const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/service_categories?select=id,name,project_id`;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

fetch(url, { headers: { "apikey": key, "Authorization": "Bearer " + key }})
  .then(r => r.json())
  .then(data => console.log(JSON.stringify(data, null, 2)));
