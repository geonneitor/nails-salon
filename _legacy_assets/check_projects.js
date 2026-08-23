const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/projects?select=id,name`;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

fetch(url, { headers: { "apikey": key, "Authorization": "Bearer " + key }})
  .then(r => r.json())
  .then(data => console.log(JSON.stringify(data, null, 2)));
