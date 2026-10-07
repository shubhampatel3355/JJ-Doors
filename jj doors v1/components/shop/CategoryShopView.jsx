"use client";

import React from "react";
import CategoryProducts from "./CategoryProducts";

// Layout follows the Frisk template's home-11: a full-screen card carousel
// with no banner above it.
export default function CategoryShopView({ categoryId, initialQuery = "" }) {
  return <CategoryProducts categoryId={categoryId} initialQuery={initialQuery} />;
}
