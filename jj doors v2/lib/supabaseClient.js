"use client";

import { createClient } from "@supabase/supabase-js";

// These are read from .env.local (NEXT_PUBLIC_* is inlined into the client bundle).
// The hard-coded fallbacks keep the static export working even if the env file is missing.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zmmhawhyoxxdqvesxnjo.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptbWhhd2h5b3h4ZHF2ZXN4bmpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5MjgyNDAsImV4cCI6MjEwNDUwNDI0MH0.Ix-foUm-hwvjOhBMSEnakcufBErl2ly0AP_AOKfSAYs";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

// Storage bucket that holds category banners and product photos.
export const CATALOG_BUCKET = "catalog";
