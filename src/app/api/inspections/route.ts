import { NextResponse } from 'next/server';
import { getRoad, listInspections, saveInspection } from '@/lib/supabase-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({ data: await listInspections() });
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

    // The database trigger sync_road_after_inspection updates the road's
    // condition and last inspection date automatically after this insert.
    const inspection = await saveInspection({ ...payload, id: crypto.randomUUID() }, road.id);
    return NextResponse.json({ success: true, data: inspection });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
