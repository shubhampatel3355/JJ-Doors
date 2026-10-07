import BlogList1 from "@/components/blog/BlogList1";
import Breadcumb from "@/components/blog/Breadcumb";
import Cta from "@/components/homes/home-7/Cta";
import Footer6 from "@/components/footers/Footer6";
import Header3 from "@/components/headers/Header3";
import React from "react";

export const metadata = {
  title: "Blog & Door Guides || JJ Doors - Insights, Trends & Craftsmanship",
  description: "Explore the latest insights on teak wood pooja doors, veneer vs laminate selection, and waterproof WPC bathroom doors from JJ Doors Bangalore.",
};

export default function BlogPage1() {
  return (
    <>
      <Header3 transparent={true} />
      <Breadcumb />
      <BlogList1 />
      <Cta />
      <Footer6 />
    </>
  );
}
