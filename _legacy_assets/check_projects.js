const url = "https://xeclkyydwouszqisgfmr.supabase.co/rest/v1/projects?select=id,name";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlY2xreXlkd291c3pxaXNnZm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxOTY1NDYsImV4cCI6MjA5NTc3MjU0Nn0.DtT5Hc9Udh2gVO7lK3Wf7-02FR2xggBSA8xGT54-1Zk";

fetch(url, { headers: { "apikey": key, "Authorization": "Bearer " + key }})
  .then(r => r.json())
  .then(data => console.log(JSON.stringify(data, null, 2)));
