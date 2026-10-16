import { NextResponse } from 'next/server';
import { deleteRoad, listRoads, saveRoad } from '@/lib/local-database';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ data: listRoads() });
}

export async function POST(request: Request) {
  const payload = await request.json();
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return NextResponse.json({ message: 'A road record is required.' }, { status: 400 });
  }

  const newItem = {
    ...payload,
    id: typeof payload.id === 'string' && payload.id ? payload.id : crypto.randomUUID(),
  };
  saveRoad(newItem);

  return NextResponse.json({ success: true, data: newItem });
}

export async function PATCH(request: Request) {
  const payload = await request.json();
  if (!payload || typeof payload.id !== 'string' || !payload.id) {
    return NextResponse.json({ message: 'A road ID is required.' }, { status: 400 });
  }

  const current = listRoads().find((road) => road.id === payload.id);
  if (!current) return NextResponse.json({ message: 'Road not found.' }, { status: 404 });

  const updated = { ...current, ...payload, id: current.id };
  saveRoad(updated);
  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ message: 'A road ID is required.' }, { status: 400 });
  if (!deleteRoad(id)) return NextResponse.json({ message: 'Road not found.' }, { status: 404 });
  return NextResponse.json({ success: true });
}
