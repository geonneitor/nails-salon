const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Creando proyecto Púrpura Nails...');
  
  // 1. Crear el proyecto
  const { data: project, error: projErr } = await supabase
    .from('projects')
    .insert({ name: 'Púrpura Nails' })
    .select()
    .single();

  if (projErr) {
    console.error('Error creando proyecto:', projErr);
    return;
  }
  console.log('Proyecto creado:', project.id);

  // 2. Si es necesario, aquí podríamos crear un usuario Admin específico para Púrpura.
  // Pero como los usuarios se manejan vía auth.users, el dueño debe crear la cuenta
  // o le asignamos un user_role con project_id = project.id una vez que se registre.
  // Por ahora, solo necesitamos que exista el proyecto en la base de datos.
  
  console.log('Listo. Púrpura Nails ha sido inicializado en la base de datos.');
}

seed();
