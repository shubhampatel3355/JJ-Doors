import Header3 from "@/components/headers/Header3";
import SearchPopup from "@/components/headers/component/SearchPopup";
import Blogs from "@/components/homes/common/Blogs";

import Facts from "@/components/homes/home-3/Facts";
import Features from "@/components/homes/home-3/Features";

import Hero from "@/components/homes/home-6/Hero";

import MarqueeComponent from "@/components/common/Marquee";

import Portfolio from "@/components/homes/home-6/Portfolio";
import React from "react";
import Contact from "@/components/homes/common/Contact";
import Cta from "@/components/homes/home-7/Cta";
import Footer6 from "@/components/footers/Footer6";

export const metadata = {
  title: "JJ Doors - Handcrafted Teak, Pooja, Veneer & WPC Doors Manufacturer",
  description: "Manufacturer, exporter and supplier of handcrafted Teak Main Doors, Traditional Pooja Doors, Veneer, and 100% Waterproof WPC doors in Bangalore, India.",
};

export default function HomePage6() {
  return (
    <>
      <SearchPopup />
      <Header3 transparent={true}/>
      <Hero />
      <MarqueeComponent />
      <Facts />
      <Features />
      <Portfolio />
      <Contact />
      <Blogs />
      <Cta />
      <Footer6 />
    </>
  );
}
