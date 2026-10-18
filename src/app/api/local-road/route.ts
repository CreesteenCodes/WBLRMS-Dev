import { NextResponse } from 'next/server';
import { deleteRoad, getRoad, listRoads, saveRoad } from '@/lib/supabase-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({ data: await listRoads() });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const payload = await request.json();
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return NextResponse.json({ message: 'A road record is required.' }, { status: 400 });
  }

  try {
    const newItem = {
      ...payload,
      id: typeof payload.id === 'string' && payload.id ? payload.id : crypto.randomUUID(),
    };
    const saved = await saveRoad(newItem);
    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const payload = await request.json();
  if (!payload || typeof payload.id !== 'string' || !payload.id) {
    return NextResponse.json({ message: 'A road ID is required.' }, { status: 400 });
  }

  try {
    const current = await getRoad(payload.id);
    if (!current) return NextResponse.json({ message: 'Road not found.' }, { status: 404 });

    const updated = await saveRoad({ ...current, ...payload, id: current.id });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ message: 'A road ID is required.' }, { status: 400 });

  try {
    if (!(await deleteRoad(id))) return NextResponse.json({ message: 'Road not found.' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
