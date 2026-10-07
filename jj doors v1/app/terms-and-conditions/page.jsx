import Footer6 from "@/components/footers/Footer6";
import Header3 from "@/components/headers/Header3";
import LegalPage from "@/components/legal/LegalPage";
import { termsConditions } from "@/data/legal";
import React from "react";

export const metadata = {
  title: "Terms & Conditions || JJ Doors - Handcrafted Wooden & Pooja Doors",
  description:
    "Terms & Conditions for using the JJ Doors website and ordering handcrafted teak, pooja, veneer and WPC doors, including quotations, payments, delivery and warranty.",
};

export default function TermsConditionsPage() {
  return (
    <>
      <Header3 transparent={true} />
      <LegalPage {...termsConditions} />
      <Footer6 />
    </>
  );
}
