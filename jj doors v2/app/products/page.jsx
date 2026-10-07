import Header3 from "@/components/headers/Header3";
import ProductSlideshow from "@/components/products/ProductSlideshow";
import React from "react";

export const metadata = {
  title: "Products Showcase || JJ Doors - Premium Door Collections",
};

// Layout follows the Frisk template's home-12: header over a full-screen slideshow
export default function ProductsPage() {
  return (
    <>
      <div className="bg-title">
        <Header3 transparent={true} />
        <ProductSlideshow />
      </div>
    </>
  );
}
