// ============================================================
// src/lib/supabaseClient.ts
// Singleton del cliente Supabase para Next.js App Router (Client Components).
// Para Server Components / Route Handlers, usa createServerClient de @supabase/ssr.
// ============================================================

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail-fast: NO usar fallbacks hardcodeados. Si llegamos aquí, el build o el
  // runtime carece de configuración y debe fallar de forma explícita en lugar
  // de inicializar un cliente con valores fantasma.
  throw new Error(
    'Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
    'Configúralas en .env.local (ver .env.example) antes de continuar.'
  );
}

/**
 * Cliente Supabase singleton para uso en Client Components.
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
