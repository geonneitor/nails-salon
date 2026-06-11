// ============================================================
// src/lib/supabaseClient.ts
// Singleton del cliente Supabase para Next.js App Router (Client Components).
// Para Server Components / Route Handlers, usa createServerClient de @supabase/ssr.
// ============================================================

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xeclkyydwouszqisgfmr.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlY2xreXlkd291c3pxaXNnZm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxOTY1NDYsImV4cCI6MjA5NTc3MjU0Nn0.DtT5Hc9Udh2gVO7lK3Wf7-02FR2xggBSA8xGT54-1Zk';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

/**
 * Cliente Supabase singleton para uso en Client Components.
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
