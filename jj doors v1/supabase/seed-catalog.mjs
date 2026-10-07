// Seeds products from the extracted JJ Doors 2026–28 catalog into Supabase.
//
//   node supabase/seed-catalog.mjs --dry-run   # validate only, writes nothing
//   node supabase/seed-catalog.mjs             # upload images + insert products
//
// Source: Door_Catalog_Extracted_JJ_Names/Door_Catalog_Extracted/
//   - Door_Name_Reference.xlsx (sheet 1: Category | Image Filename | Door Name / Model | Page | W | H)
//   - one folder of JPGs per category
//
// Safe to re-run: products whose name already exists in the same category are
// skipped, and images go to fixed storage paths (upsert), so nothing duplicates.

import fs from "fs";
import path from "path";
import zlib from "zlib";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const ROOT = path.resolve(import.meta.dirname, "..");
const CATALOG_DIR = path.join(ROOT, "Door_Catalog_Extracted_JJ_Names", "Door_Catalog_Extracted");
const XLSX = path.join(CATALOG_DIR, "Door_Name_Reference.xlsx");
const BUCKET = "catalog";
const DRY_RUN = process.argv.includes("--dry-run");

// Spreadsheet category -> existing Supabase category name.
// Explicit on purpose: fuzzy matching would confuse "Primer Door" with "Premium Primer Door".
const CATEGORY_MAP = {
  "Teak Main Door": "Teak Main Doors",
  "Teak Pooja Door": "Teak Pooja Doors",
  "Teak Architecture Door": "Teak Architecture Doors",
  "Veneer Door": "Veneer Doors",
  "Premium Primer Door": "Premium Primer Doors",
  "Primer Door": "Primer Doors",
  "WPC Door / Door Frame": "WPC Doors",
  "UV Coated Doors / Door Frame": "UV Coated Doors",
};

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

// An .xlsx file is a zip archive. Read the entries we need straight from its
// central directory so the script doesn't depend on an external unzip/tar.
function readZipEntries(file, wanted) {
  const buf = fs.readFileSync(file);
  let eocd = buf.length - 22;
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd--;
  if (eocd < 0) throw new Error(`${file} is not a valid zip/xlsx file`);
  const entryCount = buf.readUInt16LE(eocd + 10);
  let ptr = buf.readUInt32LE(eocd + 16);
  const out = {};
  for (let i = 0; i < entryCount; i++) {
    const method = buf.readUInt16LE(ptr + 10);
    const compressedSize = buf.readUInt32LE(ptr + 20);
    const nameLen = buf.readUInt16LE(ptr + 28);
    const extraLen = buf.readUInt16LE(ptr + 30);
    const commentLen = buf.readUInt16LE(ptr + 32);
    const localOffset = buf.readUInt32LE(ptr + 42);
    const name = buf.toString("utf8", ptr + 46, ptr + 46 + nameLen);
    if (wanted.includes(name)) {
      const start =
        localOffset + 30 + buf.readUInt16LE(localOffset + 26) + buf.readUInt16LE(localOffset + 28);
      const data = buf.subarray(start, start + compressedSize);
      out[name] = (method === 8 ? zlib.inflateRawSync(data) : data).toString("utf8");
    }
    ptr += 46 + nameLen + extraLen + commentLen;
  }
  return out;
}

function readCatalogRows() {
  const entries = readZipEntries(XLSX, ["xl/sharedStrings.xml", "xl/worksheets/sheet1.xml"]);
  const decode = (s) =>
    s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
  const sharedXml = entries["xl/sharedStrings.xml"] || "";
  const strings = [...sharedXml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) =>
    decode([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join(""))
  );
  const sheet = entries["xl/worksheets/sheet1.xml"];
  const rows = [...sheet.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)].slice(1).map((r) => {
    const cells = {};
    for (const c of r[1].matchAll(/<c r="([A-Z]+)\d+"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const type = (c[2].match(/t="(\w+)"/) || [])[1];
      const v = ((c[3] || "").match(/<v>([\s\S]*?)<\/v>/) || [])[1];
      const inline = ((c[3] || "").match(/<t[^>]*>([\s\S]*?)<\/t>/) || [])[1];
      cells[c[1]] = type === "s" ? strings[Number(v)] : decode(inline ?? v ?? "");
    }
    return { category: cells.A, file: cells.B, model: cells.C, page: cells.D };
  });
  return rows;
}

async function runPool(items, limit, worker) {
  let next = 0;
  const runners = Array.from({ length: limit }, async () => {
    while (next < items.length) {
      const i = next++;
      await worker(items[i], i);
    }
  });
  await Promise.all(runners);
}

async function main() {
  const env = loadEnv();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });

  const rows = readCatalogRows();
  console.log(`Catalog rows: ${rows.length}${DRY_RUN ? "  (DRY RUN — nothing will be written)" : ""}`);

  const { data: categories, error: catErr } = await supabase.from("categories").select("id,name,slug");
  if (catErr) throw catErr;
  const categoryByName = Object.fromEntries(categories.map((c) => [c.name, c]));

  // Validate the whole mapping before touching anything
  const problems = [];
  for (const row of rows) {
    const target = CATEGORY_MAP[row.category];
    if (!target) problems.push(`No mapping for spreadsheet category "${row.category}"`);
    else if (!categoryByName[target]) problems.push(`Supabase has no category named "${target}"`);
    if (!fs.existsSync(path.join(CATALOG_DIR, row.file))) problems.push(`Missing image: ${row.file}`);
  }
  if (problems.length) {
    [...new Set(problems)].forEach((p) => console.error("  ✗ " + p));
    process.exit(1);
  }

  const { data: existing, error: prodErr } = await supabase.from("products").select("name,category_id");
  if (prodErr) throw prodErr;
  const existingKeys = new Set(existing.map((p) => `${p.category_id}|${p.name.trim().toLowerCase()}`));

  // Shop pages list newest first, so the first catalog row gets the newest timestamp
  const baseTime = Date.now();
  const planned = rows.map((row, index) => {
    const category = categoryByName[CATEGORY_MAP[row.category]];
    const model = row.model.trim();
    return {
      row,
      category,
      model,
      skip: existingKeys.has(`${category.id}|${model.toLowerCase()}`),
      storagePath: `products/catalog/${category.slug || slugify(category.name)}/${slugify(model)}.webp`,
      createdAt: new Date(baseTime - index * 1000).toISOString(),
    };
  });

  const perCategory = {};
  for (const p of planned) {
    const k = p.category.name;
    perCategory[k] ||= { insert: 0, skip: 0 };
    perCategory[k][p.skip ? "skip" : "insert"]++;
  }
  console.log("\nPer category (insert / skip existing):");
  for (const [name, c] of Object.entries(perCategory)) {
    console.log(`  ${name.padEnd(26)} ${String(c.insert).padStart(4)} / ${c.skip}`);
  }
  planned.filter((p) => p.skip).forEach((p) => console.log(`  skip: "${p.model}" already exists in ${p.category.name}`));

  const todo = planned.filter((p) => !p.skip);
  if (!todo.length) {
    console.log("\nNothing to do: every catalog product already exists.");
    return;
  }
  if (DRY_RUN) {
    const sample = todo[0];
    const buf = await sharp(path.join(CATALOG_DIR, sample.row.file))
      .rotate()
      .resize({ width: 900, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    const original = fs.statSync(path.join(CATALOG_DIR, sample.row.file)).size;
    console.log(
      `\nSample compression: ${sample.row.file} ${(original / 1024).toFixed(0)}KB -> ${(buf.length / 1024).toFixed(0)}KB webp`
    );
    console.log(`Sample storage path: ${sample.storagePath}`);
    console.log(`\nDry run OK. ${todo.length} products would be created.`);
    return;
  }

  // 1) Upload compressed images
  let uploaded = 0;
  let bytesIn = 0;
  let bytesOut = 0;
  const failures = [];
  await runPool(todo, 6, async (p) => {
    const src = path.join(CATALOG_DIR, p.row.file);
    try {
      const webp = await sharp(src)
        .rotate()
        .resize({ width: 900, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(p.storagePath, webp, { contentType: "image/webp", cacheControl: "31536000", upsert: true });
      if (error) throw error;
      p.imageUrl = supabase.storage.from(BUCKET).getPublicUrl(p.storagePath).data.publicUrl;
      bytesIn += fs.statSync(src).size;
      bytesOut += webp.length;
      uploaded++;
      if (uploaded % 25 === 0) console.log(`  uploaded ${uploaded}/${todo.length}`);
    } catch (e) {
      failures.push(`${p.row.file}: ${e.message}`);
    }
  });
  console.log(
    `Uploaded ${uploaded}/${todo.length} images (${(bytesIn / 1048576).toFixed(1)}MB -> ${(bytesOut / 1048576).toFixed(1)}MB)`
  );

  // 2) Insert products for every image that uploaded
  const ready = todo.filter((p) => p.imageUrl);
  let inserted = 0;
  for (let i = 0; i < ready.length; i += 50) {
    const batch = ready.slice(i, i + 50).map((p) => ({
      name: p.model,
      sku: `JJD-${p.model.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`,
      category_id: p.category.id,
      category_name: p.category.name,
      status: "Published",
      image: p.imageUrl,
      description: `${p.model} from the JJ Doors 2026–28 ${p.category.name} catalogue.`,
      created_at: p.createdAt,
    }));
    const { error } = await supabase.from("products").insert(batch);
    if (error) {
      failures.push(`insert batch starting at ${i}: ${error.message}`);
      continue;
    }
    inserted += batch.length;
  }
  console.log(`Inserted ${inserted} products.`);

  if (failures.length) {
    console.error(`\n${failures.length} failure(s):`);
    failures.forEach((f) => console.error("  ✗ " + f));
    process.exit(1);
  }
  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
