import Header3 from "@/components/headers/Header3";
import Breadcumb from "@/components/portfolio/Breadcumb";

import Portfolio from "@/components/homes/home-6/Portfolio";

import Cta from "@/components/homes/home-7/Cta";
import Footer6 from "@/components/footers/Footer6";
import React from "react";
export const metadata = {
  title: "Project 6 || Frisk - Creative Agency & Portfolio Nextjs Template",
};
export default function ProjectPage6() {
  return (
    <>
      <Header3 />
      <Breadcumb />
      <Portfolio />
      <Cta />
      <Footer6 />
    </>
  );
}
