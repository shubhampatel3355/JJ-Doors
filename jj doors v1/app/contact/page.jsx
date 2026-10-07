import Breadcumb from "@/components/contact/Breadcumb";
import Contact from "@/components/contact/Contact";
import ContactInfo from "@/components/contact/ContactInfo";

import Footer6 from "@/components/footers/Footer6";
import Header3 from "@/components/headers/Header3";
import React from "react";

export const metadata = {
  title: "Contact || JJ Doors - Handcrafted Teak, Pooja, Veneer & WPC Doors Manufacturer",
};

export default function ContactPage() {
  return (
    <>
      <Header3 transparent={true} />
      <Breadcumb />
      <ContactInfo />
      <Contact />
      <div className="mt-80">
        <Footer6 />
      </div>
    </>
  );
}
