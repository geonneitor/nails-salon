import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  // Fail-fast: el cliente admin bypasea RLS. Si lo creamos con un token vacío,
  // TODAS las queries fallan en silencio o, peor, exponen datos de todos los
  // proyectos. Es preferible un error de boot a un cliente zombie.
  throw new Error(
    'Faltan variables de entorno en el servidor: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY. ' +
    'Configúralas en .env.local (ver .env.example) antes de continuar.'
  );
}

// Cliente con privilegios de administrador, NO usar en el frontend.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
