import React from "react";
import Link from "next/link";

const pillars = [
  {
    iconClass: "fas fa-bullseye",
    title: "Our Sacred Mission",
    desc: "To preserve and elevate traditional Indian woodcraft by creating spiritually uplifting Pooja doors and bespoke entrance doors that enrich homes, temples, and architectural spaces across the globe.",
  },
  {
    iconClass: "fas fa-eye",
    title: "Our Vision",
    desc: "To be India's most cherished handcrafted door atelier, renowned for marrying sacred Vedic artistry with durable engineering, sustainable timber sourcing, and unmatched lifetime quality.",
  },
  {
    iconClass: "fas fa-gem",
    title: "Our Core Values",
    desc: "100% genuine seasoned timber, uncompromising master craftsmanship, client-tailored Vastu dimensions, and transparent relationships built on trust since 2011.",
  },
];

const highlights = [
  { count: "14+", label: "Years of Craftsmanship", sub: "Since 2011" },
  { count: "500+", label: "Original Door Designs", sub: "Temple & Modern" },
  { count: "10,000+", label: "Doors Delivered", sub: "Across India & Abroad" },
  { count: "100%", label: "Seasoned Hardwood", sub: "Zero Warping & Decay" },
];

export default function MissionVision() {
  return (
    <section className="mission-vision-area space overflow-hidden bg-white">
      <div className="container">
        {/* Section Heading */}
        <div className="row justify-content-center">
          <div className="col-xl-8 col-lg-9">
            <div className="title-area text-center mb-50">
              <span className="sub-title fs-6 fw-semibold text-uppercase text-secondary mb-2 d-inline-block">
                PURPOSE & PRINCIPLES
              </span>
              <h2 className="sec-title">Our Mission, Vision & Heritage</h2>
              <p className="sec-text text-muted mx-auto" style={{ maxWidth: "650px" }}>
                Every doorway is the first impression of your sanctuary. We combine ancestral carving heritage with modern durability standards.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Pillars Cards */}
        <div className="row gy-4 mb-50">
          {pillars.map((pillar, idx) => (
            <div key={idx} className="col-lg-4 col-md-6">
              <div
                className="h-100 p-4 p-xl-5 rounded-4 border bg-light position-relative"
                style={{
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
              >
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-3 mb-4 text-white"
                  style={{
                    width: "56px",
                    height: "56px",
                    backgroundColor: "#1b242a",
                    fontSize: "22px",
                  }}
                >
                  <i className={pillar.iconClass}></i>
                </div>
                <h3 className="fs-4 fw-bold text-dark mb-3">{pillar.title}</h3>
                <p className="text-muted mb-0 lh-base" style={{ fontSize: "15px" }}>
                  {pillar.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats / Numbers Banner */}
        <div
          className="p-4 p-md-5 rounded-4 text-white"
          style={{
            backgroundColor: "#111619",
            backgroundImage: "radial-gradient(circle at 10% 20%, rgba(255,255,255,0.03) 0%, transparent 60%)",
          }}
        >
          <div className="row gy-4 text-center align-items-center">
            {highlights.map((item, idx) => (
              <div key={idx} className="col-6 col-lg-3">
                <div className="stat-box px-2">
                  <h3
                    className="fw-bold text-white mb-1"
                    style={{ fontSize: "clamp(2rem, 3.5vw, 2.75rem)", letterSpacing: "-1px" }}
                  >
                    {item.count}
                  </h3>
                  <div className="fw-semibold text-light mb-1" style={{ fontSize: "15px" }}>
                    {item.label}
                  </div>
                  <span className="text-secondary small d-block" style={{ color: "#9ca3af !important" }}>
                    {item.sub}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
