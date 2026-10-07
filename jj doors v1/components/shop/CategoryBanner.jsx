"use client";
import React from "react";
import Link from "next/link";

export default function CategoryBanner({
  title = "Our Products",
  subtitle = "Exclusive Door Collection",
  bgImage = "/assets/img/background/bg.png",
}) {
  return (
    <div
      className="breadcumb-wrapper category-breadcumb-banner"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
      }}
    >
      <div className="category-banner-overlay" />
      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        <div className="breadcumb-content text-center">
          {subtitle && (
            <span
              className="sub-title style2"
              style={{
                color: "var(--theme-color, #00B04A)",
                textTransform: "uppercase",
                letterSpacing: "2px",
                fontSize: "14px",
                fontWeight: 600,
                display: "inline-block",
                marginBottom: "10px",
              }}
            >
              {subtitle}
            </span>
          )}
          <h1 className="breadcumb-title" style={{ fontSize: "42px", fontWeight: 700, margin: "0 0 12px 0", color: "#ffffff" }}>
            {title}
          </h1>
          <ul className="breadcumb-menu" style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", justifyContent: "center", gap: "10px", alignItems: "center" }}>
            <li>
              <Link href="/" style={{ color: "rgba(255, 255, 255, 0.8)", textDecoration: "none" }}>Home</Link>
            </li>
            <li style={{ color: "rgba(255, 255, 255, 0.5)" }}>/</li>
            <li>
              <Link href="/products" style={{ color: "rgba(255, 255, 255, 0.8)", textDecoration: "none" }}>Products</Link>
            </li>
            <li style={{ color: "rgba(255, 255, 255, 0.5)" }}>/</li>
            <li style={{ color: "var(--theme-color, #00B04A)", fontWeight: 600 }}>{title}</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .category-breadcumb-banner {
          padding: 120px 0 90px;
          min-height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .category-banner-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(10, 12, 0, 0.65) 0%, rgba(10, 12, 0, 0.45) 50%, rgba(10, 12, 0, 0.75) 100%);
          z-index: 1;
        }
      `}</style>
    </div>
  );
}
