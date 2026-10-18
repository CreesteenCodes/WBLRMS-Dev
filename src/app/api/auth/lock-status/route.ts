import { NextResponse } from 'next/server';
import { listLockedIdentifiers } from '@/lib/supabase-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({ locked: await listLockedIdentifiers() });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
