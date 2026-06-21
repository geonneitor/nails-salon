const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
  console.log('Checking appointment_reminders table...');
  const { data, error } = await supabase.from('appointment_reminders').select('id').limit(1);
  if (error) {
    console.error('Error fetching table:', error);
  } else {
    console.log('Table exists, data:', data);
  }
}

checkTable();
