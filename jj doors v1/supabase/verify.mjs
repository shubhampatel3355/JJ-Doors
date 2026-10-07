// Quick connection check. Run AFTER applying schema.sql:
//   node supabase/verify.mjs
// Uses plain fetch (works on Node 20+) against the Supabase REST API.

const URL = "https://zmmhawhyoxxdqvesxnjo.supabase.co";
const ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptbWhhd2h5b3h4ZHF2ZXN4bmpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5MjgyNDAsImV4cCI6MjEwNDUwNDI0MH0.Ix-foUm-hwvjOhBMSEnakcufBErl2ly0AP_AOKfSAYs";

async function q(path) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
  });
  return { ok: res.ok, body: await res.json() };
}

const cats = await q("categories?select=name,status,sort_order&order=sort_order");
const prods = await q("products?select=name,category_name,status");

if (!cats.ok || !prods.ok) {
  console.error("Not ready:", JSON.stringify(cats.body || prods.body));
  console.error("Apply supabase/schema.sql in the Supabase SQL editor first.");
  process.exit(1);
}

console.log(`categories: ${cats.body.length}`);
cats.body.forEach((c) => console.log(`  - ${c.name} (${c.status})`));
console.log(`products:   ${prods.body.length}`);
prods.body.forEach((p) => console.log(`  - ${p.name} [${p.category_name}] ${p.status}`));
