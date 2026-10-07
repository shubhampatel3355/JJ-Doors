"use client";

import { projects2 } from "@/data/portfolio";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { getCategories } from "@/lib/adminApi";

export default function Portfolio({ fullHeight = false }) {
  const [items, setItems] = useState(projects2);
  const cardRefs = useRef([]);

  // Focus shift between the stacked sticky cards: as the next card slides up,
  // the covered card softly blurs and dims while the incoming card sharpens.
  // It is driven directly by scroll position, so scrolling back reverses it.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const MAX_BLUR_OUT = 8; // px, card being covered
    const MAX_BLUR_IN = 6; // px, card sliding in
    const MIN_BRIGHTNESS_OUT = 0.4; // covered card dims to this
    const MIN_BRIGHTNESS_IN = 0.6; // incoming card starts at this
    const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
    let frame = null;

    const applyFocus = (card, blur, brightness, textOpacity) => {
      const idle = blur < 0.05 && brightness > 0.995;
      const thumb = card.querySelector(".portfolio-thumb");
      if (thumb) {
        thumb.style.filter = idle
          ? ""
          : `blur(${blur.toFixed(2)}px) brightness(${brightness.toFixed(3)})`;
        // A slight zoom hides the soft see-through edge that blur creates
        thumb.style.transform = idle ? "" : `scale(${(1 + blur / 250).toFixed(4)})`;
      }
      // Text children, not .portfolio-details itself: that element has a CSS
      // transition which would make the text lag behind the scroll.
      card.querySelectorAll(".media-left, .portfolio-details-btn").forEach((el) => {
        el.style.filter = blur < 0.05 ? "" : `blur(${(blur * 0.5).toFixed(2)}px)`;
        el.style.opacity = textOpacity > 0.995 ? "" : textOpacity.toFixed(3);
      });
    };

    const update = () => {
      frame = null;
      const vh = window.innerHeight;
      const cards = cardRefs.current.slice(0, items.length);
      // 0 = just entering at the bottom of the screen, 1 = settled at the top
      const settled = cards.map((card) =>
        card ? clamp01(1 - card.getBoundingClientRect().top / vh) : 1
      );

      cards.forEach((card, i) => {
        if (!card) return;
        const covered = i + 1 < cards.length ? settled[i + 1] : 0;
        if (covered >= 1) {
          // Fully hidden under the next card; skip the filter work
          applyFocus(card, 0, 1, 1);
          return;
        }
        // The first card reads clearly from the start instead of focusing in
        const entering = i === 0 ? 0 : 1 - settled[i];
        // Linear: blur and dimming change at a constant rate with scroll
        const blurIn = entering * MAX_BLUR_IN;
        const blurOut = covered * MAX_BLUR_OUT;
        const brightness =
          (1 - entering * (1 - MIN_BRIGHTNESS_IN)) *
          (1 - covered * (1 - MIN_BRIGHTNESS_OUT));
        applyFocus(card, blurIn + blurOut, brightness, 1 - covered * 0.6);
      });
    };

    const requestUpdate = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame !== null) cancelAnimationFrame(frame);
      cardRefs.current.forEach((card) => card && applyFocus(card, 0, 1, 1));
    };
  }, [items.length]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const cats = (await getCategories()).filter((c) => c.status !== "Hidden");
        if (!alive || !cats.length) return;
        
        // Match or map categories from Supabase
        setItems((prevItems) => {
          // If we have categories from DB, prioritize them
          return cats.map((cat, idx) => {
            const fallback = prevItems.find(
              (p) =>
                p.title &&
                (p.title.toLowerCase().includes(cat.name.toLowerCase()) ||
                  cat.name.toLowerCase().includes(p.title.toLowerCase()))
            ) || prevItems[idx] || {};

            return {
              id: cat.id,
              slug: cat.slug || cat.id,
              title: cat.name,
              video: cat.video || null,
              imageSrc: cat.image || fallback.imageSrc || "/assets/img/portfolio/portfolio5_1.jpg",
              categories: fallback.categories || ["Door Collection", "JJ Doors"],
            };
          });
        });
      } catch (e) {
        // keep the bundled projects2 fallback on any error
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const isVideo = (url) => {
    if (!url) return false;
    return /\.(mp4|webm|mov|ogg|mkv)($|\?)/i.test(url) || String(url).startsWith("data:video/") || String(url).startsWith("blob:");
  };

  return (
    <div className={`project-area-6 ${fullHeight ? "mt-0 mb-100" : "mt-120 mb-180"}`}>
      
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-8 col-lg-10">
            <div className="title-area text-center mb-120">
              <span className="sub-title style2">OUR EXCLUSIVE RANGE</span>
              <h2 className="sec-title">
                Featured Door <span className="text-theme">Products</span>
              </h2>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid p-0">
        <div className="row g-0">
          <div className="col-12">
            <div className="portfolio-static-wrap">
              {items.map((elm, i) => (
                <div
                  key={i}
                  className="portfolio-static w-100"
                  style={{
                    position: "sticky",
                    top: 0,
                    height: fullHeight ? "100vh" : "85vh",
                    zIndex: i + 1,
                  }}
                >
                  <div
                    ref={(el) => (cardRefs.current[i] = el)}
                    className="portfolio-wrap style5"
                    style={{
                      position: "relative",
                      height: fullHeight ? "100vh" : "85vh",
                      minHeight: fullHeight ? "100vh" : "550px",
                      maxHeight: fullHeight ? "100vh" : "800px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      className="portfolio-thumb"
                      style={{ height: "100%", width: "100%" }}
                    >
                      {isVideo(elm.video || elm.imageSrc) ? (
                        <video
                          autoPlay
                          loop
                          muted
                          playsInline
                          src={elm.video || elm.imageSrc}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <Image
                          width={1920}
                          height={1080}
                          src={elm.imageSrc}
                          alt={elm.title}
                          priority={i === 0}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                    </div>
                    <div
                      className="portfolio-details"
                      style={{
                        bottom: fullHeight ? "70px" : "60px",
                        paddingBottom: "20px",
                      }}
                    >
                      <div className="media-left">
                        <h3 className="portfolio-title">
                          <Link
                            scroll={false}
                            href={`/shop?category=${encodeURIComponent(elm.id)}`}
                          >
                            {elm.title}
                          </Link>
                        </h3>
                      </div>
                      <div className="portfolio-details-btn">
                        <Link
                          scroll={false}
                          href={`/shop?category=${encodeURIComponent(elm.id)}`}
                          className="link-btn"
                        >
                          <span className="link-effect">
                            <span className="effect-1">VIEW PRODUCTS</span>
                            <span className="effect-1">VIEW PRODUCTS</span>
                          </span>
                          <Image
                            width={13}
                            height={13}
                            src="/assets/img/icon/arrow-left-top.svg"
                            alt="icon"
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
