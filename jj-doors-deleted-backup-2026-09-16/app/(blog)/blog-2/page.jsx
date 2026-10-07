import BlogList2 from "@/components/blog/BlogList2";
import Breadcumb from "@/components/blog/Breadcumb";
import MarqueeComponent from "@/components/common/Marquee";
import Footer6 from "@/components/footers/Footer6";
import Header3 from "@/components/headers/Header3";
import React from "react";

export const metadata = {
  title: "Blog & Door Guides || JJ Doors - Insights, Trends & Craftsmanship",
};

export default function BlogPage2() {
  return (
    <>
      <Header3 transparent={true} />
      <Breadcumb />
      <BlogList2 />
      <MarqueeComponent />
      <Footer6 />
    </>
  );
}
