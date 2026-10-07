"use client";

// Based on the Frisk template's home-12 "Fullscreen Slideshow"
// (frisk/components/homes/home-12/Portfolio.jsx): a full-height vertical
// react-slick slider driven by the mouse wheel, horizontal swipe on phones.
// Slides are the door categories from Supabase instead of demo projects.

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Slider from "react-slick";
import { getCategories } from "@/lib/adminApi";
import { projects2 } from "@/data/portfolio";
import useWheelPaging from "@/components/common/useWheelPaging";

// Slide transition time; the wheel waits this long between steps
const SLIDE_SPEED = 800;

const isVideo = (url) =>
  !!url &&
  (/\.(mp4|webm|mov|ogg|mkv)($|\?)/i.test(url) ||
    String(url).startsWith("data:video/") ||
    String(url).startsWith("blob:"));

export default function ProductSlideshow() {
  const [slides, setSlides] = useState(null); // null while loading
  const sliderRef = useRef(null);
  const wrapRef = useRef(null);

  const slickSettings = {
    slidesToShow: 1, // Show 1 slide at a time
    slidesToScroll: 1,
    speed: SLIDE_SPEED,
    cssEase: "cubic-bezier(0.65, 0, 0.35, 1)", // Eases in and out, no abrupt start/stop
    // A swipe of 1/10 of the screen changes slide (default 1/5), so short
    // flicks on phones and tablets register instead of snapping back
    touchThreshold: 10,
    arrows: false, // Hide navigation buttons
    infinite: true, // Enable looping
    autoplaySpeed: 3000, // 3 seconds per slide
    vertical: true, // Enable vertical scrolling
    verticalSwiping: true, // Allow vertical swipe
    draggable: true, // Enable dragging
    swipe: true, // Enable swipe
    pauseOnHover: false, // Keep autoplay running on hover
    responsive: [
      {
        breakpoint: 768, // For mobile devices
        settings: {
          vertical: false, // Switch to horizontal scrolling on mobile
          verticalSwiping: false, // Disable vertical swipe on mobile
          swipe: true, // Enable swipe gestures for mobile
          swipeToSlide: true, // Enable swipe to slide (helps in smooth navigation)
        },
      },
    ],
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      let list = [];
      try {
        const cats = (await getCategories()).filter((c) => c.status !== "Hidden");
        list = cats.map((c) => ({
          id: c.id,
          title: c.name,
          media: c.video || c.image,
          meta: [c.productCount ? `${c.productCount} Designs` : "Door Collection", "JJ Doors"],
        }));
      } catch (e) {
        console.warn("Supabase categories fetch error:", e);
      }
      if (!list.length) {
        list = projects2.map((p) => ({
          id: p.id,
          title: p.title,
          media: p.imageSrc,
          meta: ["Door Collection", "JJ Doors"],
        }));
      }
      if (alive) setSlides(list);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Play only the video on the current slide. Slick clones slides for the
  // infinite loop, so without this every copy of every video would play.
  const syncVideos = useCallback(() => {
    const root = wrapRef.current;
    if (!root) return;
    const current = root.querySelector(".slick-slide.slick-current");
    root.querySelectorAll("video").forEach((video) => {
      if (current && current.contains(video)) video.play?.().catch(() => {});
      else video.pause();
    });
  }, []);

  useEffect(() => {
    if (!slides) return;
    const frame = requestAnimationFrame(syncVideos);
    return () => cancelAnimationFrame(frame);
  }, [slides, syncVideos]);

  // Mouse wheel / trackpad: one slide per gesture (see useWheelPaging)
  const handleWheel = useWheelPaging(
    (direction) => {
      if (direction > 0) sliderRef.current?.slickNext(); // Scroll down
      else sliderRef.current?.slickPrev(); // Scroll up
    },
    { cooldown: SLIDE_SPEED + 50 }
  );

  return (
    <div className="project-area-12 overflow-hidden" ref={wrapRef}>
      <h1 className="visually-hidden">JJ Doors Product Collections</h1>
      <div className="container-fluid p-0">
        <div className="project-slider-showcase-wrap style2" onWheel={handleWheel}>
          {slides && (
            <Slider
              ref={sliderRef}
              {...slickSettings}
              onInit={syncVideos}
              afterChange={syncVideos}
              className="row g-0 global-carousel project-slider-showcase"
            >
              {slides.map((slide, i) => {
                const href = `/shop?category=${encodeURIComponent(slide.id)}`;
                return (
                  <div className="col-lg-4" key={slide.id ?? i}>
                    <div className="portfolio-wrap style12">
                      <div className="portfolio-thumb">
                        {isVideo(slide.media) ? (
                          <video
                            // #t=0.1 shows the first frame while the slide is not playing
                            src={`${slide.media}#t=0.1`}
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            aria-label={slide.title}
                          />
                        ) : (
                          <Image
                            width={1920}
                            height={800}
                            src={slide.media}
                            alt={slide.title}
                            priority={i === 0}
                          />
                        )}
                      </div>
                      <div className="portfolio-details">
                        <div className="media-left">
                          <ul className="portfolio-meta">
                            {slide.meta.map((m) => (
                              <li key={m}>
                                <span>{m}</span>
                              </li>
                            ))}
                          </ul>
                          <h3 className="portfolio-title">
                            <Link scroll={false} href={href}>
                              {slide.title}
                            </Link>
                          </h3>
                        </div>
                        <div className="portfolio-details-btn">
                          <Link scroll={false} href={href} className="link-btn">
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
                );
              })}
            </Slider>
          )}
        </div>
      </div>

      <style jsx>{`
        /* The template sizes .portfolio-thumb img; videos need the same fit */
        .project-area-12 :global(.portfolio-wrap.style12 .portfolio-thumb video) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Meta items are plain text here, so give them the link colour */
        .project-area-12 :global(.portfolio-wrap.style12 .portfolio-meta li span) {
          color: var(--smoke-color, #f6f5f3);
        }

        /* Hold the full-screen space while categories load */
        .project-area-12 :global(.project-slider-showcase-wrap.style2) {
          min-height: 100vh;
        }
      `}</style>
    </div>
  );
}
