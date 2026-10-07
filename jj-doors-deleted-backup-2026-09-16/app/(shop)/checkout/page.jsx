import MarqueeComponent from "@/components/common/Marquee";

import Footer6 from "@/components/footers/Footer6";
import Header3 from "@/components/headers/Header3";

import Breadcumb4 from "@/components/shop/Breadcumb4";
import Checkout from "@/components/shop/Checkout";

import React from "react";
export const metadata = {
  title: "Shop Checkout || JJ Doors - Premium Door Collections",
};
export default function page() {
  return (
    <>
      <Header3 transparent={true} />
      <Breadcumb4 />
      <Checkout />
      <MarqueeComponent />
      <Footer6 />
    </>
  );
}
