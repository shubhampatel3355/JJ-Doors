import React from "react";

export default function Breadcumb() {
  return (
    <div
      className="breadcumb-wrapper"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(10, 12, 0, 0.65) 0%, rgba(10, 12, 0, 0.45) 50%, rgba(10, 12, 0, 0.75) 100%), url(/assets/img/background/bg.png)",
      }}
    >
      <div className="container">
        <div className="breadcumb-content">
          <h1 className="breadcumb-title">Products</h1>
        </div>
      </div>
    </div>
  );
}
