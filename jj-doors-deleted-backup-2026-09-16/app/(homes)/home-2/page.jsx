import Header2 from "@/components/headers/Header2";
import SearchPopup from "@/components/headers/component/SearchPopup";
import Blogs from "@/components/homes/home-2/Blogs";
import Awards from "@/components/homes/common/Awards";
import Features from "@/components/homes/home-2/Features";
import Hero from "@/components/homes/home-2/Hero";

import Portfolio from "@/components/homes/home-2/Portfolio";
import Skills from "@/components/homes/common/Skills";
import Video from "@/components/homes/home-2/Video";
import React from "react";
import Clients from "@/components/homes/home-2/Clients";
import Cta from "@/components/homes/home-2/Cta";
import Footer2 from "@/components/footers/Footer2";
import MarqueeComponent from "@/components/common/Marquee";
export const metadata = {
  title: "Home 2 || Frisk - Creative Agency & Portfolio Nextjs Template",
};
export default function HomePage2() {
  return (
    <>
      <SearchPopup />
      <Header2 />
      <Hero />
      <MarqueeComponent />
      <Features />
      <Skills />
      <Portfolio />

      <Awards />
      <Video />
      <Blogs />
      <Clients />
      <Cta />
      <Footer2 />
    </>
  );
}
