const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xeclkyydwouszqisgfmr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlY2xreXlkd291c3pxaXNnZm1yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDE5NjU0NiwiZXhwIjoyMDk1NzcyNTQ2fQ.lV6ZCm9plS63KU-Yy37Ejy134c92td0uuEKPc8kc65M';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.rpc('exec_sql', { query: 'SELECT 1' });
  console.log('exec_sql result:', data, error);
}

check();
