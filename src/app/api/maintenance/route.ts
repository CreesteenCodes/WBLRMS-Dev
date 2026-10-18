import { NextResponse } from 'next/server';
import { getRoad, listMaintenanceRecords, saveMaintenanceRecord } from '@/lib/supabase-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({ data: await listMaintenanceRecords() });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const payload = await request.json();
  if (
    !payload ||
    typeof payload !== 'object' ||
    Array.isArray(payload) ||
    typeof payload.localRoadId !== 'string' ||
    !payload.localRoadId
  ) {
    return NextResponse.json({ message: 'A valid road ID is required.' }, { status: 400 });
  }

  try {
    const road = await getRoad(payload.localRoadId);
    if (!road) return NextResponse.json({ message: 'Road not found.' }, { status: 404 });

    const record = await saveMaintenanceRecord({ ...payload, id: crypto.randomUUID() }, road.id);
    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const payload = await request.json();
  if (
    !payload ||
    typeof payload.id !== 'string' ||
    !['Scheduled', 'In Progress', 'Completed'].includes(payload.status)
  ) {
    return NextResponse.json({ message: 'A valid record ID and status are required.' }, { status: 400 });
  }

  try {
    const record = (await listMaintenanceRecords()).find((item) => item.id === payload.id);
    if (!record) return NextResponse.json({ message: 'Maintenance record not found.' }, { status: 404 });

    const updated = { ...record, status: payload.status, completedDate: payload.completedDate };
    await saveMaintenanceRecord(updated, String(record.localRoadId));
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
