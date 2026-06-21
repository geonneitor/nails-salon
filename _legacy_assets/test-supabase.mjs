import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envRaw = readFileSync('.env.local', 'utf-8');
const env = {};
envRaw.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^"|"$/g, '');
  }
});

const PROJECT_ID = env.NEXT_PUBLIC_PROJECT_ID || 'bf2460b5-f50d-4b30-a780-b91f05e3096b';
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing URL or Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('appointments')
    .select('start_time, end_time, status, created_at')
    .eq('project_id', PROJECT_ID)
    .gte('start_time', startOfDay.toISOString())
    .lte('start_time', endOfDay.toISOString())
    .not('status', 'eq', 'cancelled');

  if (error) {
    console.error("ERROR:", error);
    console.error("DETAILS:", error.details);
    console.error("HINT:", error.hint);
  } else {
    console.log("SUCCESS. Data count:", data.length);
  }
}
test();
