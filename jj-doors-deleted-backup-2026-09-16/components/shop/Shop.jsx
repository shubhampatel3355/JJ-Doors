"use client";

import React from "react";
import CategoryProducts from "./CategoryProducts";

export default function Shop({ categoryId }) {
  return <CategoryProducts categoryId={categoryId} />;
}
