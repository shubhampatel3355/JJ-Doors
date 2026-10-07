import Image from "next/image";
import React from "react";

const highlights = [
  {
    id: 1,
    icon: "/assets/img/icon/feature-icon1-1.svg",
    title: "Original Product",
    text: "JJ Doors exports original, carved traditional entrance and pooja doors.",
  },
  {
    id: 2,
    icon: "/assets/img/icon/feature-icon1-3.svg",
    title: "Satisfaction Guarantee",
    text: "JJ Doors guarantees satisfaction: expert craftsmanship, quality improvements and support.",
  },
  {
    id: 3,
    icon: "/assets/img/icon/worldwide.svg",
    title: "JJ Doors Heritage",
    text: "Five years leading Karnataka's door manufacturing, ensuring satisfaction.",
  },
  {
    id: 4,
    icon: "/assets/img/icon/feature-icon1-5.svg",
    title: "Artisanal Mastery",
    text: "Artisans handcraft doors from 500 designs, ensuring flawless timeless elegance.",
  },
];

export default function Facts() {
  return (
    <div className="about-highlights-area space-top space-extra-bottom overflow-hidden">
      <div className="container">
        <div className="row gy-4 justify-content-center">
          {highlights.map((item, index) => (
            <div key={item.id} className="col-xl-3 col-lg-6 col-md-6">
              <div
                className="feature-card h-100 p-4 rounded-3 border bg-white shadow-sm transition-all"
                style={{
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                }}
              >
                <div
                  className="feature-card-icon mb-3 d-inline-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: "64px",
                    height: "64px",
                    backgroundColor: "#f8f9fa",
                    padding: "12px",
                  }}
                >
                  <Image
                    width={40}
                    height={40}
                    src={item.icon}
                    alt={item.title}
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <h4 className="feature-card-title mb-2 fs-5 fw-bold text-dark">
                  {item.title}
                </h4>
                <p className="feature-card-text text-muted mb-0 lh-base" style={{ fontSize: "15px" }}>
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
