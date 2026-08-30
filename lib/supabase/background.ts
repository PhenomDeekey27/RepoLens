import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createBackgroundClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    console.error('[background-client] SUPABASE_SERVICE_ROLE_KEY is not set! Background tasks will fail due to RLS.');
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
