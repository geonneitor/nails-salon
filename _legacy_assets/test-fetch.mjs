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
const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/appointments?project_id=eq.${PROJECT_ID}&select=id&limit=1`;

console.log("Fetching:", url);

fetch(url, {
  headers: {
    'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
  }
}).then(async res => {
  console.log("Status:", res.status);
  console.log("Body:", await res.text());
}).catch(err => {
  console.error("Fetch error:", err.message);
});
