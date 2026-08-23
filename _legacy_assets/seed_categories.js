const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/service_categories`;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const purpuraId = "a2f35147-30f2-4bcb-b724-042c6be1e749";
const zenId = "489e898d-3b2a-4775-b784-93a0e1a473e0";

const categories = [
  { name: 'Full Set Acrílico', selection_type: 'single' },
  { name: 'Diseños y Arte', selection_type: 'multiple' },
  { name: 'Decoraciones', selection_type: 'multiple' },
  { name: 'Reposiciones', selection_type: 'multiple' },
  { name: 'Gel Protección', selection_type: 'single' },
  { name: 'Manicura Spa', selection_type: 'single' },
  { name: 'Pedicura Spa', selection_type: 'single' }
];

async function seed() {
  await fetch(`${url}?name=eq.gfdg`, {
    method: 'DELETE',
    headers: { "apikey": key, "Authorization": "Bearer " + key }
  });

  const payload = [];
  categories.forEach(c => {
    payload.push({ ...c, project_id: purpuraId });
    payload.push({ ...c, project_id: zenId });
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: { "apikey": key, "Authorization": "Bearer " + key, "Content-Type": "application/json", "Prefer": "return=minimal" },
    body: JSON.stringify(payload)
  });
  console.log("Status:", res.status);
  console.log(await res.text());
}
seed();
