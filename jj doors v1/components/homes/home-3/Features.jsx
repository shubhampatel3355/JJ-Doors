import Image from "next/image";
import React from "react";

export default function Features() {
  return (
    <div className="why-area-1 space bg-title shape-mockup-wrap mb-10 overflow-hidden">
      <div
        className="why-img-1-1 shape-mockup wow img-custom-anim-right animated"
        data-wow-duration="1.5s"
        data-wow-delay="0.2s"
        style={{
          top: "0px",
          bottom: "0px",
          right: "0px",
          height: "100%",alignContent:"center"
        }}
      >
        <Image
          width={838}
          height={778}
          src="/assets/img/about/about.jpeg"
          alt="JJ Doors Craftsmanship"
          style={{ height: "80%", width: "100%", objectFit: "cover" }}
        />
      </div>
      <div className="container">
        <div className="row">
          <div className="col-lg-6">
            <div className="title-area mb-45">
              <span className="sub-title">WHY CHOOSE US</span>
              <h2 className="sec-title text-white">
                Mastering The Art of <span className="text-theme">Door Craftsmanship</span>
              </h2>
            </div>
            <h4 className="text-theme">Handcrafted Perfection Since 2011</h4>
            <p className="text-white" style={{ opacity: 0.85 }}>
              JJ Doors is an esteemed leader in manufacturing, exporting, and supplying elaborately designed doors. Our products add an exquisite dimension to doorways at luxury residences, sacred temples, offices, and commercial spaces across India.
            </p>
            <h4 className="mt-35 text-theme">Why Homeowners & Builders Trust Us</h4>
            <p className="mb-n1 text-white" style={{ opacity: 0.85 }}>
              From our extensive databank of over <span className="text-theme fw-semibold">500 traditional and contemporary designs</span> to <span className="text-theme fw-semibold">100% moisture-resistant</span> WPC and Teak Wood engineering, we deliver end-to-end doorway solutions from vaskal frame crafting to flawless installation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
