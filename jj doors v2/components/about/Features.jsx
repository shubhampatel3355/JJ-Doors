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
          height: "100%", alignContent:"center"
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
              <span className="sub-title">WHO WE ARE</span>
              <h2 className="sec-title text-white">
                Who We Are And <span className="text-theme">What We Do</span>
              </h2>
            </div>
            <h4 className="text-theme">Established in 2011</h4>
            <p className="text-white" style={{ opacity: 0.85 }}>
              Established in the year 2011, We JJ Doors have etched our name as a
              noteworthy organisation engaged in manufacturing, exporting and
              supplying of a range of elaborately crafted doors. Our products add an
              exquisite dimension to doorways at homes, temples, offices and commercial spaces all
              over India. The detailed array of our products encompasses
              <span className="text-theme fw-semibold"> Entrance Doors, Pooja Doors, Internal Doors, and Wooden Doors</span>.
            </p>
            <h4 className="mt-35 text-theme">Artisanal Mastery & 500+ Designs</h4>
            <p className="mb-n1 text-white" style={{ opacity: 0.85 }}>
              Each and every article from our collection is meticulously carved and
              handcrafted to perfection by our dexterous craftsmen and artisans,
              enabled with our data bank of over <span className="text-theme fw-semibold">500 designs</span>. Experience our service and you will be pleasantly surprised.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
