import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createRouteHandlerClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        // Read-only in route handlers for verification purposes
      },
      remove(name: string, options: any) {
        // Read-only
      },
    },
  });
}

/**
 * Verifica si el usuario actual es admin. Si se pasa un projectId, verifica que sea admin de ESE proyecto.
 */
export async function verifyAdminAccess(expectedProjectId?: string) {
  const supabase = await createRouteHandlerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { error: 'unauthenticated', status: 401 };
  }

  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role, project_id')
    .eq('id', user.id)
    .single();

  if (roleError || !roleData) {
    return { error: 'forbidden', status: 403 };
  }

  if (roleData.role !== 'admin') {
    return { error: 'forbidden', status: 403 };
  }

  if (expectedProjectId && roleData.project_id !== expectedProjectId) {
    return { error: 'forbidden', status: 403 };
  }

  return { user, roleData, status: 200 };
}
