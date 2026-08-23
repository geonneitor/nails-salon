const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  const { data, error } = await supabase.from('business_settings').insert({
    project_id: '489e898d-3b2a-4775-b784-93a0e1a473e0',
    opening_hour: '09:00:00',
    closing_hour: '20:00:00',
    working_days: [1,2,3,4,5,6],
    advance_grace_period_hours: 2,
    cancel_grace_period_hours: 24,
    max_employees: 5,
    bank_details: 'Banco: BBVA\nCLABE: 4152 3144 5237 9798\nBeneficiario: Alexandra Garcia'
  });
  if (error) {
    console.error('Error inserting settings:', error);
  } else {
    console.log('Successfully seeded business_settings for Zen Estudio');
  }
}

seed();
