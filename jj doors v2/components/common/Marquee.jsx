"use client";
import Marquee from "react-fast-marquee";

export default function MarqueeComponent() {
  const marQueeItems = [
    {
      id: 1,
      href: "/products",
      text: "Handcrafted Teak Main Doors",
      icon: "fas fa-star-of-life",
    },
    {
      id: 2,
      href: "/products",
      text: "Traditional Carved Pooja Doors",
      icon: "fas fa-star-of-life",
    },
    {
      id: 3,
      href: "/products",
      text: "100% Waterproof WPC Doors",
      icon: "fas fa-star-of-life",
    },
    {
      id: 4,
      href: "/products",
      text: "Premium Veneer & Laminated Doors",
      icon: "fas fa-star-of-life",
    },
    {
      id: 5,
      href: "/about",
      text: "500+ Designer Door Bank",
      icon: "fas fa-star-of-life",
    },
    {
      id: 6,
      href: "/contact",
      text: "Custom Sizes & Turnkey Installation",
      icon: "fas fa-star-of-life",
    },
  ];

  return (
    <div className="container-fluid p-0 overflow-hidden">
      <div className="slider__marquee clearfix marquee-wrap">
        <div className="marquee_mode marquee__group">
          <Marquee pauseOnHover={true} speed={40}>
            {marQueeItems.map((elm, i) => (
              <h6 key={i} className="item m-item">
                <a href={elm.href}>
                  <i className={elm.icon}></i> {elm.text}
                </a>
              </h6>
            ))}
          </Marquee>
        </div>
      </div>
    </div>
  );
}
