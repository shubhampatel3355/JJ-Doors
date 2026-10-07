import Breadcumb from "@/components/about/Breadcumb";
import Facts from "@/components/about/Facts";
import Features from "@/components/about/Features";
import Process from "@/components/about/Process";
import MissionVision from "@/components/about/MissionVision";
import Testimonials from "@/components/homes/home-5/Testimonials";
import Cta from "@/components/homes/home-7/Cta";
import Footer6 from "@/components/footers/Footer6";
import Header3 from "@/components/headers/Header3";
import React from "react";

export const metadata = {
  title: "About Us || JJ Doors - Handcrafted Wooden & Pooja Doors",
};

export default function AboutPage() {
  return (
    <>
      <Header3 transparent={true}/>
      <Breadcumb />
      <Features />
      <Facts />
      <Process />
      <MissionVision />
      <Testimonials />
      <Cta />
      <Footer6 />
    </>
  );
}
