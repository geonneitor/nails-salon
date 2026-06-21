const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

const supabase = createClient(supabaseUrl, supabaseKey);

const categoriesToInsert = [
  { name: 'Gel Protección', selection_type: 'base', is_active: true, display_order: 1 },
  { name: 'Manicura', selection_type: 'base', is_active: true, display_order: 2 },
  { name: 'Pedicura Spa', selection_type: 'base', is_active: true, display_order: 3 },
  { name: 'Full Set', selection_type: 'base', is_active: true, display_order: 4 },
];

const variants = [
  // Gel Protección
  { categoryName: 'Gel Protección', name: 'Protección Polygel', base_price: 400, base_duration_minutes: 60, display_order: 1 },
  { categoryName: 'Gel Protección', name: 'Protección Builder Gel', base_price: 400, base_duration_minutes: 60, display_order: 2 },
  { categoryName: 'Gel Protección', name: 'Gel sobre uña natural', base_price: 350, base_duration_minutes: 60, display_order: 3 },
  { categoryName: 'Gel Protección', name: 'Cambio de gel', base_price: 380, base_duration_minutes: 60, display_order: 4 },
  { categoryName: 'Gel Protección', name: 'Nivelación con Rubber', base_price: 380, base_duration_minutes: 60, display_order: 5 },
  { categoryName: 'Gel Protección', name: 'Relleno Rubber', base_price: 380, base_duration_minutes: 60, display_order: 6 },
  
  // Manicura
  { categoryName: 'Manicura', name: 'Con gel', base_price: 400, base_duration_minutes: 60, display_order: 1 },
  { categoryName: 'Manicura', name: 'Sin gel', base_price: 300, base_duration_minutes: 45, display_order: 2 },
  
  // Pedicura Spa
  { categoryName: 'Pedicura Spa', name: 'Pedicura spa', base_price: 480, base_duration_minutes: 60, display_order: 1 },
  { categoryName: 'Pedicura Spa', name: 'Pedicura + Acripie', base_price: 800, base_duration_minutes: 120, display_order: 2 },
  { categoryName: 'Pedicura Spa', name: 'Pedicura + French', base_price: 550, base_duration_minutes: 90, display_order: 3 },
  { categoryName: 'Pedicura Spa', name: 'Pedicura, Acripie 2 dedos, French', base_price: 750, base_duration_minutes: 120, display_order: 4 },

  // Full Set
  { categoryName: 'Full Set', name: 'Acrílico', base_price: 500, base_duration_minutes: 120, display_order: 1 },
  { categoryName: 'Full Set', name: 'Builder Gel', base_price: 600, base_duration_minutes: 120, display_order: 2 },
  { categoryName: 'Full Set', name: 'Polygel', base_price: 600, base_duration_minutes: 120, display_order: 3 },
];

async function seed() {
  console.log('Deleting existing categories for project...');
  await supabase.from('service_categories').delete().eq('project_id', projectId);

  console.log('Inserting categories...');
  const { data: cats, error: catErr } = await supabase.from('service_categories')
    .insert(categoriesToInsert.map(c => ({...c, project_id: projectId})))
    .select();
  
  if (catErr) {
    console.error('Cat Error', catErr);
    return;
  }

  const catMap = {};
  for(const c of cats) {
    catMap[c.name] = c.id;
  }

  console.log('Inserting variants...');
  const varsToInsert = variants.map(v => {
    const { categoryName, ...rest } = v;
    return {
      ...rest,
      category_id: catMap[categoryName],
      is_active: true
    };
  });

  const { error: varErr } = await supabase.from('service_variants').insert(varsToInsert);
  if (varErr) {
    console.error('Var Error', varErr);
    return;
  }

  console.log('Inserting modifiers...');
  const modifiersToInsert = [];
  for(const c of cats) {
    modifiersToInsert.push({
      category_id: c.id,
      name: 'Tonos extra ($5)',
      modifier_type: 'per_unit',
      price_delta: 5,
      duration_delta: 0,
      is_active: true,
      display_order: 1
    });
  }

  const { error: modErr } = await supabase.from('service_modifiers').insert(modifiersToInsert);
  if (modErr) {
    console.error('Mod Error', modErr);
    return;
  }

  console.log('Done successfully!');
}
seed();
