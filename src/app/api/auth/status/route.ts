import { NextResponse } from 'next/server';
import { listLocalUsers, updateLocalUserStatus } from '@/lib/supabase-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({ users: await listLocalUsers() });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { email, status } = await request.json();

  if (!email || (status !== 'Active' && status !== 'Inactive')) {
    return NextResponse.json({ message: 'Invalid email or status.' }, { status: 400 });
  }

  try {
    if (await updateLocalUserStatus(String(email), status)) {
      return NextResponse.json({ success: true, status });
    }
    return NextResponse.json({ message: 'User not found.' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
