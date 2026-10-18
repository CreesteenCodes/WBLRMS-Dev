import { getAdminClient } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  let database = 'unreachable';
  try {
    const { error } = await getAdminClient().from('barangays').select('id', { count: 'exact', head: true });
    database = error ? `error: ${error.message}` : 'ok';
  } catch (error) {
    database = `error: ${(error as Error).message}`;
  }

  return Response.json({
    status: database === 'ok' ? 'ok' : 'degraded',
    service: 'wblrms',
    mode: 'nextjs-supabase',
    database,
  });
}
