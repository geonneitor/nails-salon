const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('service_categories').select('id, name, project_id');
  if (error) {
    console.error('Error fetching:', error);
  } else {
    console.log('Categories:', JSON.stringify(data, null, 2));
  }
}

main();
