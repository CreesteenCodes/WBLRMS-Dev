import { NextResponse } from 'next/server';
import { prioritizeMaintenance } from '@/lib/ai';

export async function POST(request: Request) {
  const body = await request.json();
  const items = Array.isArray(body?.items) ? body.items : [];

  const prioritized = await prioritizeMaintenance(items);

  return NextResponse.json({
    success: true,
    data: prioritized,
  });
}
