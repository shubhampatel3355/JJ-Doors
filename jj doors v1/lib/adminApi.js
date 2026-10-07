"use client";

import { supabase, CATALOG_BUCKET } from "./supabaseClient";

/* ------------------------------------------------------------------ *
 *  Row <-> UI mappers
 *  DB uses snake_case; the admin components expect camelCase.
 * ------------------------------------------------------------------ */

const toCategory = (row, productCount = 0) => {
  const isVideo = (url) => url && /\.(mp4|webm|mov|ogg|mkv)($|\?)/i.test(url);
  const videoUrl = row.video || (isVideo(row.image) ? row.image : null);
  const imageUrl = row.image || (!isVideo(row.video) ? row.video : null) || "/assets/img/about/1.png";

  return {
    id: row.id,
    name: row.name,
    slug: row.slug || "",
    smallDesc: row.small_description || "",
    smallDescription: row.small_description || "",
    description: row.description || "",
    status: row.status || "Active",
    badgeColor: row.badge_color || "gold",
    image: imageUrl,
    video: videoUrl,
    sortOrder: row.sort_order ?? 0,
    productCount,
    createdAt: (row.created_at || "").split("T")[0],
  };
};

const toProduct = (row) => ({
  id: row.id,
  name: row.name,
  sku: row.sku || "",
  categoryId: row.category_id || "",
  categoryName: row.category_name || "",
  price: row.price != null ? Number(row.price) : null,
  badge: row.badge || "",
  tagline: row.tagline || "",
  status: row.status || "Published",
  stock: row.stock ?? 0,
  image: row.image || "/assets/img/about/1.png",
  description: row.description || "",
  features: Array.isArray(row.features) ? row.features : [],
  createdAt: (row.created_at || "").split("T")[0],
});

const slugify = (s) =>
  (s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Friendlier message when the SQL migration hasn't been run yet. */
function decorateError(error) {
  if (!error) return null;
  if (error.code === "PGRST205" || /schema cache|does not exist/i.test(error.message || "")) {
    return new Error(
      "Supabase tables not found. Run supabase/schema.sql in the Supabase SQL editor, then reload."
    );
  }
  return new Error(error.message || "Supabase request failed.");
}

/* ------------------------------------------------------------------ *
 *  Media upload (Images & Videos) -> public URL in the `catalog` bucket
 * ------------------------------------------------------------------ */

export async function uploadCatalogMedia(file, folder = "categories") {
  if (!file) return null;
  const ext = (file.name?.split(".").pop() || "mp4").toLowerCase();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const contentType = file.type || (
    ext === "mp4" ? "video/mp4" :
    ext === "webm" ? "video/webm" :
    ext === "mov" ? "video/quicktime" :
    ext === "mkv" ? "video/x-matroska" :
    ext === "png" ? "image/png" :
    ext === "jpg" || ext === "jpeg" ? "image/jpeg" :
    ext === "webp" ? "image/webp" : "application/octet-stream"
  );

  const { error } = await supabase.storage
    .from(CATALOG_BUCKET)
    .upload(path, file, { contentType, cacheControl: "3600", upsert: false });

  if (error) throw decorateError(error);

  const { data } = supabase.storage.from(CATALOG_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export const uploadCatalogImage = uploadCatalogMedia;
export const uploadCatalogVideo = uploadCatalogMedia;

/* ------------------------------------------------------------------ *
 *  Categories
 * ------------------------------------------------------------------ */

export async function getCategories() {
  const { data: cats, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw decorateError(error);

  const { data: prods, error: pErr } = await supabase
    .from("products")
    .select("category_id");
  if (pErr) throw decorateError(pErr);

  const counts = {};
  (prods || []).forEach((p) => {
    if (p.category_id) counts[p.category_id] = (counts[p.category_id] || 0) + 1;
  });

  return (cats || []).map((c) => toCategory(c, counts[c.id] || 0));
}

export async function createCategory(input) {
  const sortOrder = input.sortOrder ?? Math.floor(Date.now() / 1000);

  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: input.name.trim(),
      slug: input.slug || slugify(input.name),
      small_description: (input.smallDesc || "").trim(),
      description: (input.description || "").trim(),
      status: input.status || "Active",
      badge_color: input.badgeColor || "gold",
      image: input.image || input.video || null,
      video: input.video || input.image || null,
      sort_order: sortOrder,
    })
    .select()
    .single();
  if (error) throw decorateError(error);
  return toCategory(data, 0);
}

export async function updateCategory(id, input) {
  const patch = {};
  if (input.name != null) {
    patch.name = input.name.trim();
    patch.slug = slugify(input.name);
  }
  if (input.smallDesc != null) patch.small_description = input.smallDesc.trim();
  if (input.description != null) patch.description = input.description.trim();
  if (input.status != null) patch.status = input.status;
  if (input.image !== undefined) patch.image = input.image;
  if (input.video !== undefined) patch.video = input.video;

  const { data, error } = await supabase
    .from("categories")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw decorateError(error);

  // keep denormalised category_name on products in sync
  if (patch.name) {
    await supabase.from("products").update({ category_name: patch.name }).eq("category_id", id);
  }
  return toCategory(data);
}

export async function deleteCategory(id) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw decorateError(error);
}

/** Persist a new display order. `orderedList` is the categories array in the desired order. */
export async function reorderCategories(orderedList) {
  const updates = orderedList
    .filter((c) => !String(c.id).startsWith("temp-")) // skip not-yet-saved rows
    .map((c, i) =>
      supabase.from("categories").update({ sort_order: i }).eq("id", c.id)
    );
  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed) throw decorateError(failed.error);
}

export async function getCategoryById(idOrSlug) {
  if (!idOrSlug) return null;
  const raw = String(idOrSlug).trim();

  // Try by UUID id first if format matches
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw);
  if (isUuid) {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", raw)
      .maybeSingle();
    if (!error && data) return toCategory(data);
  }

  // Try by slug
  const { data: bySlug, error: slugErr } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", raw)
    .maybeSingle();
  if (!slugErr && bySlug) return toCategory(bySlug);

  // Try by name (case-insensitive)
  const decoded = decodeURIComponent(raw).replace(/[-_]/g, " ").trim();
  const { data: byName, error: nameErr } = await supabase
    .from("categories")
    .select("*")
    .ilike("name", decoded)
    .maybeSingle();
  if (!nameErr && byName) return toCategory(byName);

  return null;
}

/* ------------------------------------------------------------------ *
 *  Products
 * ------------------------------------------------------------------ */

export async function getProducts(categoryId = null) {
  let query = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;
  if (error) throw decorateError(error);
  return (data || []).map(toProduct);
}

export async function getProductsByCategory(categoryId = null, categoryName = "") {
  let query = supabase
    .from("products")
    .select("*")
    .eq("status", "Published")
    .order("created_at", { ascending: false });

  const isUuid = categoryId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);

  if (isUuid && categoryName) {
    query = query.or(`category_id.eq.${categoryId},category_name.ilike.%${categoryName}%`);
  } else if (isUuid) {
    query = query.eq("category_id", categoryId);
  } else if (categoryName) {
    query = query.ilike("category_name", `%${categoryName}%`);
  }

  const { data, error } = await query;
  if (error) throw decorateError(error);
  return (data || []).map(toProduct);
}

export async function createProduct(input) {
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: input.name.trim(),
      sku: input.sku || `JJD-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      category_id: input.categoryId || null,
      category_name: input.categoryName || "",
      price: input.price != null && input.price !== "" ? Number(input.price) : null,
      badge: input.badge || "",
      tagline: input.tagline || "",
      status: input.status || "Published",
      stock: input.stock != null && input.stock !== "" ? Number(input.stock) : 0,
      image: input.image || null,
      description: (input.description || "").trim(),
      features: Array.isArray(input.features) ? input.features : [],
    })
    .select()
    .single();
  if (error) throw decorateError(error);
  return toProduct(data);
}

export async function updateProduct(id, input) {
  const patch = {};
  if (input.name != null) patch.name = input.name.trim();
  if (input.sku != null) patch.sku = input.sku;
  if (input.categoryId !== undefined) patch.category_id = input.categoryId || null;
  if (input.categoryName != null) patch.category_name = input.categoryName;
  if (input.price !== undefined)
    patch.price = input.price === "" || input.price == null ? null : Number(input.price);
  if (input.badge != null) patch.badge = input.badge;
  if (input.tagline != null) patch.tagline = input.tagline;
  if (input.status != null) patch.status = input.status;
  if (input.stock !== undefined)
    patch.stock = input.stock === "" || input.stock == null ? 0 : Number(input.stock);
  if (input.image !== undefined) patch.image = input.image;
  if (input.description != null) patch.description = input.description;
  if (input.features !== undefined)
    patch.features = Array.isArray(input.features) ? input.features : [];

  const { data, error } = await supabase
    .from("products")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw decorateError(error);
  return toProduct(data);
}

export async function deleteProduct(id) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw decorateError(error);
}

/* ------------------------------------------------------------------ *
 *  Dashboard aggregate
 * ------------------------------------------------------------------ */

export async function getDashboardData() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return {
    categories,
    products,
    totalCategories: categories.length,
    totalProducts: products.length,
    recentProducts: products.slice(0, 5),
    recentCategories: categories.slice(0, 4),
  };
}
