import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const STORAGE_BUCKET = 'wblrms-files';

function requireEnv(name: string, fallbackName?: string): string {
  const value = process.env[name] ?? (fallbackName ? process.env[fallbackName] : undefined);
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Set it in .env.local (see .env.example) or in Vercel project settings.`
    );
  }
  return value;
}

let adminClient: SupabaseClient | undefined;

/**
 * Server-only client using the service-role key. Bypasses RLS; must NEVER be
 * imported from client components. All data access goes through API routes.
 */
export function getAdminClient(): SupabaseClient {
  if (!adminClient) {
    adminClient = createClient(
      requireEnv('SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL'),
      requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return adminClient;
}

/**
 * Anonymous client used exclusively to verify credentials with
 * supabase.auth.signInWithPassword during login.
 */
export function getAnonClient(): SupabaseClient {
  return createClient(
    requireEnv('SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
