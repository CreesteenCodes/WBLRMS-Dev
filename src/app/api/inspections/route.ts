import { NextResponse } from 'next/server';
import { listInspections, listRoads, saveInspection, saveRoad } from '@/lib/local-database';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ data: listInspections() });
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

  const inspection = { ...payload, id: crypto.randomUUID() };
  saveInspection(inspection, road.id);

  const condition =
    Number(inspection.conditionRating) >= 8 ? 'Good' :
    Number(inspection.conditionRating) >= 5 ? 'Fair' : 'Poor';
  saveRoad({ ...road, condition, lastInspection: inspection.date });

  return NextResponse.json({ success: true, data: inspection });
}
