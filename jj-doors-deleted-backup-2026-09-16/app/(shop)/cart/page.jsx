import MarqueeComponent from "@/components/common/Marquee";

import Footer6 from "@/components/footers/Footer6";
import Header3 from "@/components/headers/Header3";

import Breadcumb3 from "@/components/shop/Breadcumb3";

import ShopCart from "@/components/shop/ShopCart";
import React from "react";
export const metadata = {
  title: "Shop Cart || JJ Doors - Premium Door Collections",
};
export default function page() {
  return (
    <>
      <Header3 transparent={true} />
      <Breadcumb3 />
      <ShopCart />
      <MarqueeComponent />
      <Footer6 />
    </>
  );
}
