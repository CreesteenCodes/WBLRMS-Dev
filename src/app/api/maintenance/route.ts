import { NextResponse } from 'next/server';
import {
  listMaintenanceRecords,
  listRoads,
  saveMaintenanceRecord,
} from '@/lib/local-database';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ data: listMaintenanceRecords() });
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

  const road = listRoads().find((item) => item.id === payload.localRoadId);
  if (!road) return NextResponse.json({ message: 'Road not found.' }, { status: 404 });

  const record = { ...payload, id: crypto.randomUUID() };
  saveMaintenanceRecord(record, road.id);
  return NextResponse.json({ success: true, data: record });
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

  const record = listMaintenanceRecords().find((item) => item.id === payload.id);
  if (!record) return NextResponse.json({ message: 'Maintenance record not found.' }, { status: 404 });

  const updated = { ...record, status: payload.status, completedDate: payload.completedDate };
  saveMaintenanceRecord(updated, String(record.localRoadId));
  return NextResponse.json({ success: true, data: updated });
}
