"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header3 from "@/components/headers/Header3";
import CategoryShopView from "@/components/shop/CategoryShopView";

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || searchParams.get("id") || "";
  const searchParam = searchParams.get("search") || "";

  return <CategoryShopView categoryId={categoryParam} initialQuery={searchParam} />;
}

// Layout follows the Frisk template's home-11: header over a full-screen carousel
export default function ShopPage() {
  return (
    <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
      <Header3 transparent={true} showSearch={true} onLight={true} />
      <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
        <ShopContent />
      </Suspense>
    </div>
  );
}
