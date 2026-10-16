import { NextResponse } from 'next/server';
import { listLocalUsers, updateLocalUserStatus } from '@/lib/local-database';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ users: listLocalUsers() });
}

export async function PATCH(request: Request) {
  const { email, status } = await request.json();

  if (!email || (status !== 'Active' && status !== 'Inactive')) {
    return NextResponse.json(
      { message: 'Invalid email or status.' },
      { status: 400 }
    );
  }

  if (updateLocalUserStatus(String(email), status)) return NextResponse.json({ success: true, status });
  return NextResponse.json({ message: 'User not found.' }, { status: 404 });
}
