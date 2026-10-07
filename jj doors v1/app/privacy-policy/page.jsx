import Footer6 from "@/components/footers/Footer6";
import Header3 from "@/components/headers/Header3";
import LegalPage from "@/components/legal/LegalPage";
import { privacyPolicy } from "@/data/legal";
import React from "react";

export const metadata = {
  title: "Privacy Policy || JJ Doors - Handcrafted Wooden & Pooja Doors",
  description:
    "Learn how JJ Doors collects, uses and protects your personal information when you visit our website, send an enquiry or order handcrafted doors.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header3 transparent={true} />
      <LegalPage {...privacyPolicy} />
      <Footer6 />
    </>
  );
}
