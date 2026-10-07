import Header3 from "@/components/headers/Header3";
import CategoryShopView from "@/components/shop/CategoryShopView";
import { projects2 } from "@/data/portfolio";
import React from "react";

export const metadata = {
  title: "Shop Category || JJ Doors - Premium Door Collections",
};

export async function generateStaticParams() {
  const paramsList = [
    ...projects2.map((elm) => ({ id: `${elm.id}` })),
    { id: "all" },
    { id: "1" },
    { id: "2" },
    { id: "3" },
    { id: "4" },
  ];

  try {
    const URL = "https://zmmhawhyoxxdqvesxnjo.supabase.co";
    const ANON =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptbWhhd2h5b3h4ZHF2ZXN4bmpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5MjgyNDAsImV4cCI6MjEwNDUwNDI0MH0.Ix-foUm-hwvjOhBMSEnakcufBErl2ly0AP_AOKfSAYs";
    
    const res = await fetch(`${URL}/rest/v1/categories?select=id,slug`, {
      headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
    });
    if (res.ok) {
      const data = await res.json();
      (data || []).forEach((c) => {
        if (c.id) paramsList.push({ id: String(c.id) });
        if (c.slug) paramsList.push({ id: String(c.slug) });
      });
    }
  } catch (e) {
    // fallback paramsList
  }

  return paramsList;
}

export default async function CategoryShopPage(props) {
  const params = await props.params;
  const categoryId = params?.id || "";

  // Layout follows the Frisk template's home-11: header over a full-screen carousel
  return (
    <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
      <Header3 transparent={true} showSearch={true} onLight={true} />
      <CategoryShopView categoryId={categoryId} />
    </div>
  );
}
