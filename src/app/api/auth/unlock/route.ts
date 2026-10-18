import { NextResponse } from 'next/server';
import {
  findProfileByIdentifier,
  getLockState,
  setMasterCode,
  unlockAccount,
  verifyMasterCode,
} from '@/lib/supabase-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { username, masterCode } = await request.json();
  const identifier = String(username ?? '').trim();
  if (!identifier) {
    return NextResponse.json({ message: 'Username is required.' }, { status: 400 });
  }

  try {
    const profile = await findProfileByIdentifier(identifier);
    const isAdmin = profile?.roleKey === 'head_engineer';

    if (isAdmin) {
      const providedMaster = String(masterCode ?? '').trim();
      if (!(await verifyMasterCode(providedMaster))) {
        return NextResponse.json(
          { message: 'Invalid master unlock code.', requiresMaster: true },
          { status: 401 }
        );
      }
    }

    const wasLocked = (await getLockState(identifier)).locked;
    await unlockAccount(identifier);

    return NextResponse.json({
      success: true,
      unlocked: true,
      wasLocked,
      message: wasLocked ? 'Account unlocked.' : 'Account is not currently locked.',
    });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { currentPassword, newPassword } = await request.json();
  const currentValue = String(currentPassword ?? '').trim();
  const nextValue = String(newPassword ?? '').trim();

  if (!currentValue || !nextValue) {
    return NextResponse.json({ message: 'Current and new password are required.' }, { status: 400 });
  }
  if (nextValue.length < 8) {
    return NextResponse.json(
      { message: 'New password must be at least 8 characters long.' },
      { status: 400 }
    );
  }

  try {
    const result = await setMasterCode(nextValue, currentValue);
    if (!result.ok) {
      const status = result.message?.includes('incorrect') ? 401 : 400;
      return NextResponse.json({ message: result.message }, { status });
    }
    return NextResponse.json({ success: true, message: 'Master password updated successfully.' });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
