import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const { email, name, role, projectId } = await request.json();

    if (!email || !name || !role || !projectId) {
      return NextResponse.json(
        { error: 'Faltan datos obligatorios (email, name, role, projectId).' },
        { status: 400 }
      );
    }

    // 1. Crear el usuario en Supabase Auth enviando un correo de invitación
    // El usuario recibirá un enlace para establecer su contraseña
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        name: name,
        project_id: projectId
      }
    });

    if (authError) {
      console.error('Error invitando usuario:', authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Insertar su rol en la tabla `user_roles`
    const mappedRole = role === 'TOTAL' ? 'admin' : 'employee';
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({ id: userId, role: mappedRole });

    if (roleError) {
      console.error('Error insertando rol:', roleError);
      try {
        await supabaseAdmin.auth.admin.deleteUser(userId);
      } catch (deleteError) {
        console.error('Error rollback al borrar usuario de auth:', deleteError);
      }
      return NextResponse.json({ error: 'Usuario invitado pero falló asignación de rol.' }, { status: 500 });
    }

    // 3. Crear su perfil en la tabla `employees` para que aparezca en el calendario/agenda
    const { data: employeeData, error: employeeError } = await supabaseAdmin
      .from('employees')
      .insert({
        id: userId, // Mantenemos el mismo ID de auth
        project_id: projectId,
        name: name,
        email: email,
        role: role // 'TOTAL' o 'ONLY_BOOK'
      })
      .select()
      .single();

    if (employeeError) {
      console.error('Error insertando empleado:', employeeError);
      try {
        await supabaseAdmin.auth.admin.deleteUser(userId);
      } catch (deleteError) {
        console.error('Error rollback al borrar usuario de auth:', deleteError);
      }
      return NextResponse.json({ error: 'Usuario invitado pero falló creación de perfil en agenda.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, employee: employeeData }, { status: 200 });

  } catch (error: any) {
    console.error('Error general en /api/admin/users:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
