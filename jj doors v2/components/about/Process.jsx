import Image from "next/image";
import React from "react";

const processSteps = [
  {
    title: "Wood Sourcing & Seasoning",
    desc: "We hand-select premium grade Teakwood and hardwoods, kiln-seasoning them to optimal moisture levels to ensure zero warping, termite resistance, and supreme longevity.",
    icon: "/assets/img/icon/feature-icon1-1.svg",
  },
  {
    title: "Sacred & Architectural Design",
    desc: "Drawing from our archive of 500+ traditional pooja door motifs and contemporary architectural templates, or creating bespoke Vastu-compliant custom drawings.",
    icon: "/assets/img/icon/feature-icon1-5.svg",
  },
  {
    title: "Master Hand Carving",
    desc: "Our master sculptors meticulously chisel intricate deities, kalash motifs, floral borders, and brass inlays by hand with divine precision and deep relief depth.",
    icon: "/assets/img/icon/feature-icon1-3.svg",
  },
  {
    title: "Finishing & Quality Testing",
    desc: "Multi-layered protective weather coating, natural wood grain enhancement, and rigorous dimensional checks before safe door-step delivery.",
    icon: "/assets/img/icon/worldwide.svg",
  },
];

export default function Process() {
  return (
    <section className="process-area space bg-smoke overflow-hidden">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-8 col-lg-9">
            <div className="title-area text-center mb-50">
              <span className="sub-title fs-6 fw-semibold text-uppercase text-secondary mb-2 d-inline-block">
                HOW WE CRAFT PERFECTION
              </span>
              <h2 className="sec-title">Our Handcrafted Creation Process</h2>
              <p className="sec-text text-muted mx-auto" style={{ maxWidth: "620px" }}>
                Every JJ Door passes through a rigorous four-stage artisanal journey, turning raw seasoned timber into a timeless architectural masterpiece.
              </p>
            </div>
          </div>
        </div>

        <div className="row gy-4 justify-content-center">
          {processSteps.map((item, index) => (
            <div key={index} className="col-xl-3 col-lg-6 col-md-6">
              <div
                className="process-card-box h-100 p-4 rounded-4 bg-white border shadow-sm position-relative d-flex flex-column justify-content-between"
                style={{
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  overflow: "hidden",
                }}
              >
                <div>
                  <div
                    className="feature-card-icon mb-4 d-inline-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      width: "60px",
                      height: "60px",
                      backgroundColor: "#f4f5f7",
                      padding: "14px",
                    }}
                  >
                    <Image
                      width={32}
                      height={32}
                      src={item.icon}
                      alt={item.title}
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                  <h4 className="fs-5 fw-bold text-dark mb-3">
                    {item.title}
                  </h4>
                  <p className="text-muted mb-0 lh-base" style={{ fontSize: "14.5px" }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
