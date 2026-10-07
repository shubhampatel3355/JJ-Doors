"use client";
import React from "react";

export default function Hero() {
  return (
    <div className="hero-wrapper hero-5" id="hero">
      <div
        className="hero-slider por"
        style={{
          position: "relative",
          minHeight: "100vh",
          height: "1000px",
          overflow: "hidden",
          backgroundColor: "#0A0C00",
        }}
      >
        {/* Muted + playsInline are required for autoplay to be allowed on mobile browsers */}
        <video
          src="/assets/img/video/main-video.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -2,
          }}
        />
        <div
          className="hero-overlay"
          data-overlay="title"
          data-opacity="3"
          style={{ backgroundColor: "rgba(10, 12, 0, 0.3)" }}
        ></div>
      </div>
    </div>
  );
}
