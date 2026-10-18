import { NextResponse } from 'next/server';
import { getAdminClient, getAnonClient } from '@/lib/supabase';
import {
  MAX_ATTEMPTS,
  findProfileByIdentifier,
  getLockState,
  registerFailedLogin,
  registerSuccessfulLogin,
  roleToDisplay,
} from '@/lib/supabase-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) return `${seconds} second(s)`;
  return seconds > 0 ? `${minutes} minute(s) ${seconds} second(s)` : `${minutes} minute(s)`;
}

function lockedResponse(retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    {
      message: `Account locked due to too many failed attempts. Try again in ${formatDuration(retryAfterSeconds)}.`,
      locked: true,
      retryAfterSeconds,
    },
    { status: 423 }
  );
}

export async function POST(request: Request) {
  const { username, password } = await request.json();
  const identifier = String(username ?? '').trim();
  const passwordValue = String(password ?? '');

  if (!identifier || !passwordValue) {
    return NextResponse.json({ message: 'Username and password are required.' }, { status: 400 });
  }

  try {
    const lockState = await getLockState(identifier);
    if (lockState.locked) return lockedResponse(lockState.retryAfterSeconds);

    // Resolve username -> login email via the database (RPC handles case/active checks)
    let email = identifier.includes('@') ? identifier : '';
    if (!email) {
      const { data } = await getAdminClient().rpc('resolve_login_email', { input_username: identifier });
      email = typeof data === 'string' ? data : '';
    }

    const profile = await findProfileByIdentifier(identifier);
    if (profile && profile.status === 'inactive') {
      return NextResponse.json(
        { message: 'This account is inactive. Contact your administrator.' },
        { status: 403 }
      );
    }

    let authenticated = false;
    let userId: string | null = null;
    if (email) {
      const { data, error } = await getAnonClient().auth.signInWithPassword({ email, password: passwordValue });
      if (!error && data.user) {
        authenticated = true;
        userId = data.user.id;
      }
    }

    if (!authenticated) {
      const failure = await registerFailedLogin(identifier);
      if (failure.lockedUntil && new Date(failure.lockedUntil).getTime() > Date.now()) {
        const retry = Math.ceil((new Date(failure.lockedUntil).getTime() - Date.now()) / 1000);
        return lockedResponse(retry);
      }
      const remaining = Math.max(0, MAX_ATTEMPTS - failure.failedCount);
      return NextResponse.json(
        { message: `Invalid username or password. ${remaining} attempt(s) remaining.` },
        { status: 401 }
      );
    }

    await registerSuccessfulLogin(identifier);

    // Prefer the profile row matched to the authenticated user id
    const { data: byId } = await getAdminClient()
      .from('profiles')
      .select('id, full_name, email, role')
      .eq('id', userId)
      .maybeSingle();

    const resolved = byId ?? profile;
    return NextResponse.json({
      id: (byId?.id as string) ?? profile?.id ?? userId,
      name: String(byId?.full_name ?? profile?.name ?? identifier),
      email: String(byId?.email ?? profile?.email ?? email),
      role: byId ? roleToDisplay(byId.role) : profile?.role ?? 'Staff - Encoder',
    });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
