"use client";

// Based on the Frisk template's home-11 (frisk/components/homes/home-11/Projects.jsx):
// a full-screen row of tall doors in an autoplaying carousel that the mouse
// wheel scrolls. Every door is the same height and as wide as its own shape,
// so the carousel is a custom sliding track rather than react-slick (whose
// slots are all one width). Products come from Supabase; the template's
// search popup filters them. "View all" opens every door of the collection in
// a vertically scrolling grid with its own search.

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getProducts, getCategories } from "@/lib/adminApi";
import { products as fallbackProducts } from "@/data/products";
import { projects2 as fallbackCategories } from "@/data/portfolio";
import SearchPopup from "@/components/headers/component/SearchPopup";
import useWheelPaging from "@/components/common/useWheelPaging";
import DoorLightbox from "@/components/shop/DoorLightbox";

const ALL = "all";

// Slow glide from one page of doors to the next; the wheel waits this long between steps
const SLIDE_SPEED = 1400;
// Autoplay rests this long between moves
const AUTOPLAY_PAUSE = 3500;
// Room kept under each door for its name bar
const BAR_H = 52;
// Warm plate the door rests on
const PLATE_PAD = 20;
// Space between doors (also used to work out how many fit on screen)
const TRACK_GAP = 36;

// Lowercase and drop spaces/punctuation so "jj117" finds "JJ 117"
const normalize = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const matchesQuery = (product, query) => {
  const q = normalize(query);
  return (
    !q ||
    normalize(product.name || product.title).includes(q) ||
    normalize(product.sku).includes(q) ||
    normalize(product.categoryName).includes(q)
  );
};

// Exact id or name match. (A substring match would put "Premium Primer Doors"
// products on the "Primer Doors" page.)
const matchesCategory = (product, category) =>
  (category.id != null && String(product.categoryId) === String(category.id)) ||
  (product.categoryName || "").trim().toLowerCase() === (category.name || "").trim().toLowerCase();

const pad2 = (n) => String(n).padStart(2, "0");

// Phones and tablets show the all-designs grid as the page instead of the carousel
const COMPACT_QUERY = "(max-width: 991.98px)";

export default function CategoryProducts({ categoryId, initialQuery = "" }) {
  const [category, setCategory] = useState(null);
  // Where this collection sits among the others, e.g. "collection 03 / 08"
  const [collectionPosition, setCollectionPosition] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState(initialQuery);
  const [current, setCurrent] = useState(0); // index of the first door on screen
  const [slots, setSlots] = useState(5);

  // "View all" panel
  const [allMounted, setAllMounted] = useState(false);
  const [allOpen, setAllOpen] = useState(false);
  const [allQuery, setAllQuery] = useState(initialQuery);
  const allSearchRef = useRef(null);
  const [isCompact, setIsCompact] = useState(false);

  // Full-screen door view: which list it is walking, and where in it
  const [lightboxItems, setLightboxItems] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const openDoor = (items, index) => {
    setLightboxItems(items);
    setLightboxIndex(index);
  };

  useEffect(() => {
    setQuery(initialQuery);
    setAllQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const mql = window.matchMedia(COMPACT_QUERY);
    const update = () => setIsCompact(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [dbCategories, dbProducts] = await Promise.all([
          getCategories().catch((e) => {
            console.warn("Supabase categories fetch error:", e);
            return [];
          }),
          getProducts().catch((e) => {
            console.warn("Products fetch error from Supabase:", e);
            return [];
          }),
        ]);

        const cats = dbCategories.filter((c) => c.status !== "Hidden");
        let prods = dbProducts.filter((p) => p.status === "Published");

        const wanted =
          categoryId && categoryId !== ALL
            ? decodeURIComponent(String(categoryId)).toLowerCase()
            : null;

        let currentCat = wanted
          ? cats.find(
              (c) =>
                String(c.id).toLowerCase() === wanted ||
                (c.slug && c.slug.toLowerCase() === wanted) ||
                (c.name && c.name.toLowerCase() === wanted)
            )
          : null;

        // Fall back to local portfolio data if the category isn't in Supabase
        if (wanted && !currentCat) {
          const fb = fallbackCategories.find(
            (p) =>
              String(p.id) === wanted ||
              p.title.toLowerCase() === wanted ||
              p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") === wanted
          );
          if (fb) currentCat = { id: fb.id, name: fb.title, image: fb.imageSrc };
        }

        if (currentCat) prods = prods.filter((p) => matchesCategory(p, currentCat));

        // Fall back to local product data if Supabase has none for this view
        if (!prods.length) {
          const source = currentCat
            ? fallbackProducts.filter(
                (f) =>
                  f.title.toLowerCase().includes(currentCat.name.toLowerCase()) ||
                  currentCat.name.toLowerCase().includes(f.title.toLowerCase())
              )
            : fallbackProducts;
          prods = source.map((f) => ({
            id: f.id,
            name: f.title,
            image: f.imgSrc,
            categoryName: currentCat ? currentCat.name : "Doors",
          }));
        }

        // Sort products numbered wise and keep "pg" named products in the end
        prods.sort((a, b) => {
          const nameA = (a.name || a.title || "").toLowerCase();
          const nameB = (b.name || b.title || "").toLowerCase();
          
          const isPgA = nameA.includes("pg");
          const isPgB = nameB.includes("pg");
          
          if (isPgA && !isPgB) return 1;
          if (!isPgA && isPgB) return -1;
          
          const numA = parseInt((nameA.match(/\d+/) || [0])[0], 10);
          const numB = parseInt((nameB.match(/\d+/) || [0])[0], 10);
          
          if (numA !== numB) {
            return numA - numB;
          }
          
          return nameA.localeCompare(nameB);
        });

        if (!alive) return;
        setCategory(currentCat);
        const at = currentCat ? cats.findIndex((c) => c.id === currentCat.id) : -1;
        setCollectionPosition(at >= 0 ? { index: at + 1, total: cats.length } : null);
        setProducts(prods);
      } catch (err) {
        console.error("Error loading category products:", err);
        if (alive) setError(err.message || "Failed to load products.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [categoryId]);

  const visibleProducts = useMemo(
    () => products.filter((p) => matchesQuery(p, query)),
    [products, query]
  );

  const allProducts = useMemo(
    () => products.filter((p) => matchesQuery(p, allQuery)),
    [products, allQuery]
  );

  // ---------- Desktop carousel: equal-height doors on a sliding track ----------
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const movingUntil = useRef(0); // end time of the glide in progress
  const [scrollable, setScrollable] = useState(false); // doors overflow the screen
  const [atEnd, setAtEnd] = useState(false); // the last door is on screen
  const [hovered, setHovered] = useState(false);
  const total = visibleProducts.length;

  // Start again from the first door whenever the results change
  useEffect(() => {
    setCurrent(0);
  }, [category?.id, query]);

  // Slide the track so door `current` is at the left edge, but never past the
  // point where the last door reaches the right edge
  const placeTrack = useCallback(
    (instant) => {
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!viewport || !track) return;
      const maxOffset = Math.max(0, track.offsetWidth - viewport.clientWidth);
      const slide = track.children[current];
      const offset = Math.min(slide ? slide.offsetLeft : 0, maxOffset);
      const transform = `translate3d(${-offset}px, 0, 0)`;
      if (instant) {
        track.style.transition = "none";
        track.style.transform = transform;
        void track.offsetWidth; // commit the jump before transitions come back
        track.style.transition = "";
      } else if (track.style.transform !== transform) {
        track.style.transform = transform;
        movingUntil.current = performance.now() + SLIDE_SPEED;
      }
      setScrollable(maxOffset > 0);
      setAtEnd(maxOffset > 0 && offset >= maxOffset - 1);

      // How many doors actually fit beside the collection blurb, measured
      // rather than guessed from the screen width: a page step moves exactly
      // one screenful, so the counter matches what you just scrolled past
      const first = track.children[0];
      if (first) {
        const step = first.offsetWidth + TRACK_GAP;
        setSlots(Math.max(1, Math.floor((viewport.clientWidth + TRACK_GAP) / step)));
      }
    },
    [current]
  );

  // Also when a new set of doors mounts (category, search) or the layout switches back to desktop
  useEffect(() => {
    placeTrack(false);
  }, [placeTrack, total, category?.id, query, isCompact]);

  useEffect(() => {
    const onResize = () => placeTrack(true);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [placeTrack]);

  // A photo arriving changes its door's width, so re-measure once no glide is
  // running. Photos that land mid-glide are picked up right after it ends,
  // otherwise the track keeps stale widths and the last door stays clipped.
  const remeasureTimer = useRef(null);
  const onDoorLoad = () => {
    const now = performance.now();
    if (now >= movingUntil.current) {
      placeTrack(true);
      return;
    }
    clearTimeout(remeasureTimer.current);
    remeasureTimer.current = setTimeout(() => placeTrack(true), movingUntil.current - now + 60);
  };

  useEffect(() => () => clearTimeout(remeasureTimer.current), []);

  // A page is `slots` doors, so the counter reads 05, 10, 15... on a wide screen
  const next = useCallback(() => {
    if (!scrollable) return;
    setCurrent((c) => (atEnd ? 0 : Math.min(c + slots, total - 1)));
  }, [scrollable, atEnd, slots, total]);

  const prev = useCallback(() => {
    if (!scrollable) return;
    // From the first page wrap to the last; otherwise back one page (keeps 05, 10, 15...)
    setCurrent((c) => (c === 0 ? Math.floor((total - 1) / slots) * slots : Math.max(0, c - slots)));
  }, [scrollable, slots, total]);

  // Autoplay while the pointer isn't over the doors and the "view all" panel is closed
  useEffect(() => {
    if (isCompact || !scrollable || hovered || allOpen || lightboxIndex !== null) return;
    const timer = setTimeout(next, SLIDE_SPEED + AUTOPLAY_PAUSE);
    return () => clearTimeout(timer);
  }, [current, isCompact, scrollable, hovered, allOpen, lightboxIndex, next]);

  // Mouse wheel / trackpad: one page of doors per gesture (see useWheelPaging)
  const handleWheel = useWheelPaging((direction) => (direction > 0 ? next() : prev()), {
    cooldown: SLIDE_SPEED + 50,
  });

  // Progress: the last door on screen, out of all doors in the carousel
  const lastVisible = !total ? 0 : atEnd || !scrollable ? total : Math.min(current + slots, total);

  const openSearch = () =>
    document.getElementsByClassName("popup-search-box")[0]?.classList.add("show");

  const openAll = () => {
    setAllQuery(query);
    setAllMounted(true);
    // Two frames so the panel is painted closed first and the open transition runs
    requestAnimationFrame(() => requestAnimationFrame(() => setAllOpen(true)));
  };
  const closeAll = () => setAllOpen(false);

  // Phones and tablets: the all-designs grid is the page itself
  const isPage = isCompact;
  const panelOpen = allOpen || isPage;

  // The page behind stays still while the panel covers it
  useEffect(() => {
    if (!panelOpen) return;
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prevOverflow;
    };
  }, [panelOpen]);

  // Desktop panel: focus the search, Escape closes (autoplay pauses via allOpen)
  useEffect(() => {
    if (!allOpen || isPage) return;
    const focusTimer = setTimeout(() => allSearchRef.current?.focus({ preventScroll: true }), 350);
    const onKey = (e) => {
      if (e.key === "Escape") setAllOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
    };
  }, [allOpen, isPage]);

  const heading = category ? category.name : "All Doors";
  // The collection's own words when the admin panel has them
  const introText =
    category?.smallDesc ||
    category?.description ||
    "Handcrafted and made to order at our Bangalore workshop.";

  // A short "good / best / quality" style description reads better as spaced
  // keywords than as a sentence; anything longer stays a paragraph
  const introKeywords =
    introText.length <= 60 && /[/|•·]/.test(introText)
      ? introText.split(/\s*[/|•·]\s*/).filter(Boolean)
      : null;

  return (
    <div className="project-area-11 overflow-hidden">
      <SearchPopup initialValue={query} onSearch={setQuery} />
      <h1 className="visually-hidden">{heading}</h1>

      <div className="container-fluid">
        <div className="project-slider-showcase-wrap" onWheel={handleWheel}>
          {loading && <p className="showcase-message">Loading doors…</p>}

          {!loading && error && (
            <div className="showcase-message">
              <p>{error}</p>
              <button type="button" className="btn" onClick={() => window.location.reload()}>
                RETRY
              </button>
            </div>
          )}

          {!isCompact && !loading && !error && visibleProducts.length > 0 && (
            <div className="showcase-layout">
              {/* What this collection is, beside the doors */}
              <aside className="collection-intro">
                <div className="intro-top">
                  {/* {collectionPosition && (
                    <p className="intro-index">
                      COLLECTION {pad2(collectionPosition.index)}
                      <span> / {pad2(collectionPosition.total)}</span>
                    </p>
                  )} */}
                  <span className="intro-sub">EXCLUSIVE COLLECTION</span>
                  <h2 className="intro-title">{heading}</h2>
                  {introKeywords ? (
                    <ul className="intro-keywords">
                      {introKeywords.map((word) => (
                        <li key={word}>{word}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="intro-text">{introText}</p>
                  )}
                  <p className="intro-count">
                    {/* <strong>{pad2(products.length)}</strong>{" "}
                    {products.length === 1 ? "design" : "designs"} */}
                  </p>
                </div>

                <div className="intro-bottom">
                  <div className="intro-actions">
                    <Link href="/contact" className="intro-cta">
                      REQUEST A QUOTE
                      <Image width={13} height={13} src="/assets/img/icon/arrow-left-top.svg" alt="" />
                    </Link>
                    <button type="button" className="intro-link" onClick={openAll}>
                      Browse all {products.length} designs
                    </button>
                  </div>

                  {/* A horizontal carousel isn't obviously scrollable */}
                  {/* {scrollable && (
                    <p className="intro-hint" aria-hidden="true">
                      <span className="intro-hint-rule" />
                      SCROLL
                    </p>
                  )} */}
                </div>
              </aside>

              <div
                className="door-viewport"
                ref={viewportRef}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
              >
                <div
                  className="door-track"
                  ref={trackRef}
                  // A fresh track (back at the first door) whenever the results change
                  key={`${category?.id ?? ALL}|${query}`}
                >
                  {visibleProducts.map((item, i) => (
                    <div className="door-slide" key={item.id ?? i}>
                      {/* Door + name bar as one unit, exactly as wide as the door */}
                      <div
                        className="door-unit"
                        role="button"
                        tabIndex={0}
                        aria-label={`View ${item.name || item.title} full screen`}
                        onClick={() => openDoor(visibleProducts, i)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openDoor(visibleProducts, i);
                          }
                        }}
                      >
                        <Image
                          alt={item.name || item.title || "Door"}
                          src={item.image || item.imgSrc || "/assets/img/about/1.png"}
                          // Typical single-door shape (1:2) until the photo loads
                          width={500}
                          height={1000}
                          // The track clips off-screen doors, so native lazy loading
                          // would only start as they glide in: load the next pages ahead
                          loading={i < current + slots * 3 || i >= total - slots * 2 ? "eager" : "lazy"}
                          onLoad={onDoorLoad}
                        />
                        <h3 className="door-name">{item.name || item.title}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!isCompact && !loading && !error && visibleProducts.length === 0 && query && (
            <div className="showcase-message">
              <h2>No doors match &ldquo;{query}&rdquo;</h2>
              <p>Try a different model number, e.g. JJ 117.</p>
              <div className="showcase-message-actions">
                <button type="button" className="btn" onClick={openSearch}>
                  SEARCH AGAIN
                </button>
                <button type="button" className="btn style2" onClick={() => setQuery("")}>
                  CLEAR SEARCH
                </button>
              </div>
            </div>
          )}

          {!isCompact && !loading && !error && products.length === 0 && !query && (
            <div className="showcase-message">
              <h2>No Door Models in this Category Yet</h2>
              <p>We are updating our catalog with new designs for {heading}.</p>
              <Link href="/products" className="btn">
                EXPLORE ALL CATEGORIES
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Collection name, progress through the carousel, and "view all" */}
      {!isCompact && !loading && !error && products.length > 0 && (
        <div className="showcase-status">
          <div className="status-label">
            {query ? (
              <>
                <span>
                  <strong>{total}</strong> {total === 1 ? "result" : "results"} for &ldquo;{query}&rdquo;
                </span>
                <button type="button" className="status-clear" onClick={() => setQuery("")}>
                  Clear search
                </button>
              </>
            ) : (
              <strong>{heading}</strong>
            )}
          </div>

          {total > 0 && (
            <div
              className="status-progress"
              role="progressbar"
              aria-label="Doors viewed"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={lastVisible}
            >
              <span className="status-count is-current">{pad2(lastVisible)}</span>
              <span className="status-track">
                <span
                  className="status-fill"
                  style={{ transform: `scaleX(${lastVisible / total})` }}
                />
              </span>
              <span className="status-count">{pad2(total)}</span>
            </div>
          )}

          <button type="button" className="link-btn status-view-all" onClick={openAll}>
            <span className="link-effect">
              <span className="effect-1">VIEW ALL</span>
              <span className="effect-1">VIEW ALL</span>
            </span>
            <Image width={13} height={13} src="/assets/img/icon/arrow-left-top.svg" alt="" />
          </button>
        </div>
      )}

      {/* View all: every door in the collection, scrolling vertically */}
      {(allMounted || (isPage && !loading && !error)) && (
        <div
          className={`all-doors ${panelOpen ? "is-open" : ""} ${isPage ? "is-page" : ""}`}
          role={isPage ? undefined : "dialog"}
          aria-modal={isPage ? undefined : "true"}
          aria-label={`All ${heading}`}
          aria-hidden={!panelOpen}
        >
          <div className="all-doors-head">
            <div className="all-doors-titles">
              <span className="all-doors-sub">ALL DESIGNS</span>
              <h2>{heading}</h2>
            </div>

            <div className="all-doors-search">
              <label htmlFor="all-doors-search-input" className="visually-hidden">
                Search {heading}
              </label>
              <i className="fas fa-search" aria-hidden="true" />
              <input
                id="all-doors-search-input"
                ref={allSearchRef}
                type="text"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                value={allQuery}
                onChange={(e) => setAllQuery(e.target.value)}
                placeholder="Search by model, e.g. JJ 117"
              />
              {allQuery && (
                <button
                  type="button"
                  className="all-doors-search-clear"
                  onClick={() => setAllQuery("")}
                  aria-label="Clear search"
                >
                  <i className="fas fa-times" aria-hidden="true" />
                </button>
              )}
            </div>

            {isPage ? (
              // As the page itself there is nothing to close: go back to the collections
              <Link href="/products" className="all-doors-close" aria-label="Back to all collections">
                <Image width={20} height={20} src="/assets/img/icon/close.svg" alt="" />
              </Link>
            ) : (
              <button type="button" className="all-doors-close" onClick={closeAll} aria-label="Close">
                <Image width={20} height={20} src="/assets/img/icon/close.svg" alt="" />
              </button>
            )}
          </div>

          {products.length > 0 && (
            <p className="all-doors-count" aria-live="polite">
              Showing <strong>{allProducts.length}</strong> of {products.length}{" "}
              {products.length === 1 ? "design" : "designs"}
            </p>
          )}

          {allProducts.length > 0 ? (
            <div className="all-doors-grid">
              {allProducts.map((item, i) => (
                <div
                  className="all-door-card"
                  key={item.id ?? i}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${item.name || item.title} full screen`}
                  onClick={() => openDoor(allProducts, i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openDoor(allProducts, i);
                    }
                  }}
                >
                  <Image
                    alt={item.name || item.title || "Door"}
                    src={item.image || item.imgSrc || "/assets/img/about/1.png"}
                    // Reserves a typical single door's shape (1:2) until the photo
                    // loads, so the grid barely shifts while scrolling
                    width={500}
                    height={1000}
                    loading={i < 6 ? "eager" : "lazy"}
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                  />
                  <div className="all-door-name">{item.name || item.title}</div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="all-doors-empty">
              <p>No door models in this category yet. We are updating our catalog with new designs.</p>
              <Link href="/products" className="btn">
                EXPLORE ALL CATEGORIES
              </Link>
            </div>
          ) : (
            <div className="all-doors-empty">
              <p>No doors match &ldquo;{allQuery}&rdquo;.</p>
              <button type="button" className="btn style2" onClick={() => setAllQuery("")}>
                CLEAR SEARCH
              </button>
            </div>
          )}
        </div>
      )}

      <DoorLightbox
        items={lightboxItems}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndex={setLightboxIndex}
      />

      <style jsx>{`
        .project-area-11 {
          position: relative;
          background: #ffffff;
        }

        /* ---------- Collection blurb beside the doors ---------- */
        .showcase-layout {
          display: flex;
          align-items: stretch; /* the blurb runs the full height of the doors */
          gap: 48px;
          width: 100%;
          height: 100%;
          /* Without this the track's full width (100,000px+) becomes this
             element's minimum size, and the doors stop sliding */
          min-width: 0;
        }

        /* An editorial column: title at the top, the count and actions at the
           foot, with a hairline separating it from the doors */
        /* One centred block rather than content pinned top and bottom: with
           only a few lines, stretching leaves a large hole in the middle */
        .collection-intro {
          flex: none;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 26px;
          width: 320px;
          padding: 4px 48px 40px 0; /* 40px clears the status bar below */
          border-right: 1px solid rgba(21, 21, 21, 0.1);
        }

        .intro-index {
          margin: 0 0 24px;
          color: rgba(21, 21, 21, 0.45);
          font-family: var(--title-font);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.24em;
          font-variant-numeric: tabular-nums;
        }

        .intro-index span {
          color: rgba(21, 21, 21, 0.28);
        }

        /* Each part rises in once the collection has loaded. Declared inside
           the media query on purpose: the column's normal state is fully
           visible, so nothing can leave it stuck at opacity 0 if the
           animation never runs. */
        @media (prefers-reduced-motion: no-preference) {
          .intro-top > *,
          .intro-count,
          .intro-actions {
            animation: intro-rise 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
          }

          .intro-top > *:nth-child(2) {
            animation-delay: 0.06s;
          }
          .intro-top > *:nth-child(3) {
            animation-delay: 0.12s;
          }
          .intro-top > *:nth-child(4) {
            animation-delay: 0.18s;
          }
          .intro-top > *:nth-child(5) {
            animation-delay: 0.24s;
          }
          .intro-actions {
            animation-delay: 0.3s;
          }
        }

        @keyframes intro-rise {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }

        /* Green rule leading into the eyebrow */
        .intro-sub {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
          color: #00b04a;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.22em;
        }

        .intro-sub:before {
          content: "";
          width: 22px;
          height: 2px;
          background: #00b04a;
        }

        .intro-title {
          margin: 0 0 16px;
          color: #151515;
          font-size: clamp(22px, 1.9vw, 34px);
          line-height: 1.08;
          letter-spacing: -0.015em;
        }

        .intro-text {
          margin: 0; /* the rule below supplies the spacing */
          color: rgba(21, 21, 21, 0.65);
          font-size: 14px;
          line-height: 1.7;
        }

        /* "good / best / quality" reads as keywords, not a sentence */
        .intro-keywords {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px 10px;
          margin: 0; /* the rule below supplies the spacing */
          padding: 0;
          list-style: none;
        }

        .intro-keywords li {
          color: rgba(21, 21, 21, 0.7);
          font-family: var(--title-font);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .intro-keywords li:not(:last-child):after {
          content: "";
          display: inline-block;
          width: 4px;
          height: 4px;
          margin-left: 12px;
          vertical-align: middle;
          border-radius: 50%;
          background: #00b04a;
        }

        /* Also the finishing rule under the text, so it still reads as a
           divider when the count itself is not shown */
        .intro-count {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin: 0;
          padding-top: 22px;
          border-top: 1px solid rgba(21, 21, 21, 0.12);
          color: rgba(21, 21, 21, 0.5);
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .intro-count strong {
          color: #151515;
          font-family: var(--title-font);
          font-size: 28px;
          font-weight: 600;
          line-height: 1;
          font-variant-numeric: tabular-nums;
        }

        .intro-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 14px;
        }

        .intro-link {
          border: 0;
          padding: 0;
          background: none;
          color: rgba(21, 21, 21, 0.6);
          font-size: 13px;
          text-decoration: underline;
          text-underline-offset: 4px;
          text-decoration-color: rgba(21, 21, 21, 0.25);
          cursor: pointer;
          transition: color 0.3s ease, text-decoration-color 0.3s ease;
        }

        .intro-link:hover {
          color: #00b04a;
          text-decoration-color: #00b04a;
        }

        .intro-hint {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 32px 0 0;
          color: rgba(21, 21, 21, 0.38);
          font-family: var(--title-font);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.24em;
        }

        .intro-hint-rule {
          width: 46px;
          height: 1px;
          background: rgba(21, 21, 21, 0.25);
          transform-origin: left center;
          animation: hint-slide 2.4s ease-in-out infinite;
        }

        @keyframes hint-slide {
          0%,
          100% {
            transform: scaleX(0.4);
            opacity: 0.5;
          }
          50% {
            transform: scaleX(1);
            opacity: 1;
          }
        }

        .collection-intro :global(.intro-cta) {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding-bottom: 6px;
          border-bottom: 1px solid rgba(21, 21, 21, 0.35);
          color: #151515;
          font-family: var(--title-font);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.08em;
          transition: color 0.3s ease, border-color 0.3s ease;
        }

        .collection-intro :global(.intro-cta:hover) {
          color: #00b04a;
          border-color: #00b04a;
        }

        @media (max-width: 1400px) {
          .showcase-layout {
            gap: 36px;
          }
          .collection-intro {
            width: 264px;
            padding-right: 36px;
          }
        }

        @media (max-width: 1200px) {
          .showcase-layout {
            gap: 28px;
          }
          .collection-intro {
            width: 224px;
            padding-right: 28px;
          }
          .intro-text {
            font-size: 15px;
          }
          .intro-count strong {
            font-size: 24px;
          }
        }

        /* ---------- Desktop carousel: equal-height doors on a sliding track ---------- */
        .door-viewport {
          position: relative;
          flex: 1 1 auto; /* the space left beside the collection blurb */
          min-width: 0;
          height: 100%;
          overflow: hidden;
          display: flex;
          justify-content: safe center; /* few results: centred; many: from the left */
        }

        .door-track {
          position: relative; /* doors' offsetLeft is measured from here */
          flex: none;
          display: flex;
          align-items: flex-start; /* door tops line up */
          gap: ${TRACK_GAP}px;
          height: 100%;
          transition: transform ${SLIDE_SPEED}ms cubic-bezier(0.65, 0, 0.35, 1);
          will-change: transform;
        }

        .door-slide {
          flex: none;
          height: 100%;
        }

        /* The door rests on a warm plate with a soft shadow, and lifts slowly
           on hover, like a piece standing in a showroom */
        .door-unit {
          position: relative; /* the name bar is pinned to this plate */
          display: flex;
          flex-direction: column;
          height: 100%; /* the photo is sized from this, so nothing overflows */
          padding: ${PLATE_PAD}px ${PLATE_PAD}px ${PLATE_PAD + BAR_H}px;
          background: linear-gradient(180deg, #faf8f5 0%, #efece5 100%);
          box-shadow: 0 18px 40px rgba(21, 21, 21, 0.1);
          cursor: zoom-in;
          transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .door-unit:hover,
        .door-unit:focus-visible {
          transform: translateY(-10px);
          box-shadow: 0 34px 64px rgba(21, 21, 21, 0.18);
          outline: none;
        }

        /* Every door the same height — whatever is left of the plate once the
           gap and the name bar are taken off; width follows the door's shape */
        .door-unit :global(img) {
          display: block;
          height: 100%; /* the plate's padding already leaves room for the bar */
          width: auto;
          max-width: none;
        }

        /* Pinned to the plate's bottom edge: exactly the plate's width, and it
           adds nothing to the unit's width however long the name is */
        .door-name {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: ${BAR_H}px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin: 0;
          padding: 0 14px;
          background: #00b04a;
          color: #ffffff;
          font-size: clamp(14px, 1vw, 18px);
          font-weight: 600;
          letter-spacing: 0.14em;
          line-height: 1.2;
          text-align: center;
          text-transform: uppercase;
          overflow-wrap: anywhere;
        }

        .showcase-message {
          margin: auto;
          max-width: 520px;
          padding: 0 20px;
          text-align: center;
          color: rgba(21, 21, 21, 0.7);
        }

        .showcase-message h2 {
          color: #151515;
          font-size: 32px;
          margin-bottom: 12px;
        }

        .showcase-message p {
          margin-bottom: 28px;
        }

        .showcase-message-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
        }

        /* ---------- Bottom bar: name | progress | view all ---------- */
        .showcase-status {
          position: absolute;
          left: 36px;
          right: 36px;
          bottom: 30px;
          z-index: 2;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr);
          align-items: center;
          gap: 32px;
          font-size: 15px;
          color: rgba(21, 21, 21, 0.65);
        }

        .status-label {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .status-label strong {
          color: #151515;
          font-weight: 600;
        }

        .status-clear {
          border: 0;
          padding: 0;
          background: none;
          color: #00b04a;
          font-weight: 600;
          white-space: nowrap;
        }

        .status-clear:hover {
          text-decoration: underline;
        }

        .status-progress {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .status-count {
          flex: none;
          min-width: 2ch;
          font-family: var(--title-font);
          font-size: 14px;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
          color: rgba(21, 21, 21, 0.5);
        }

        .status-count.is-current {
          color: #151515;
        }

        .status-track {
          position: relative;
          flex: 1 1 auto;
          height: 2px;
          overflow: hidden;
          background: rgba(21, 21, 21, 0.14);
        }

        /* Fills in step with the cards: same 1.4s glide and easing */
        .status-fill {
          position: absolute;
          inset: 0;
          background: #00b04a;
          transform-origin: left center;
          transition: transform 1.4s cubic-bezier(0.65, 0, 0.35, 1);
        }

        .status-view-all {
          justify-self: end;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 0;
          padding: 0 0 4px;
          background: none;
          color: #151515;
          font-family: var(--title-font);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        /* The arrow icon file is already dark, so it needs no filter here */
        .status-view-all :global(img) {
          filter: none;
        }

        .status-view-all:before,
        .status-view-all:after {
          background: #151515;
        }

        .status-view-all:hover {
          color: #00b04a;
        }

        /* ---------- View all panel ---------- */
        .all-doors {
          position: fixed;
          inset: 0;
          z-index: 1000; /* above the fixed site header */
          overflow-y: auto;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          background: #ffffff;
          opacity: 0;
          visibility: hidden;
          transform: translateY(40px);
          transition: opacity 0.5s ease, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1),
            visibility 0s linear 0.7s;
        }

        .all-doors.is-open {
          opacity: 1;
          visibility: visible;
          transform: none;
          transition: opacity 0.5s ease, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1),
            visibility 0s;
        }

        /* Phones and tablets: shown as the page, so it appears without animating in */
        .all-doors.is-page {
          transition: none;
        }

        /* Title, search and close stay pinned while the grid scrolls */
        .all-doors-head {
          position: sticky;
          top: 0;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 32px;
          padding: 28px 48px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .all-doors-titles {
          flex: none;
        }

        .all-doors-sub {
          display: block;
          margin-bottom: 4px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 2px;
          color: #00b04a;
        }

        .all-doors-titles h2 {
          margin: 0;
          font-size: 28px;
          line-height: 1.15;
          color: #151515;
        }

        .all-doors-search {
          position: relative;
          flex: 1 1 auto;
          max-width: 620px;
          margin-left: auto;
        }

        .all-doors-search > i {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(21, 21, 21, 0.5);
          pointer-events: none;
        }

        .all-doors-search input {
          width: 100%;
          height: 52px;
          padding: 0 48px 0 46px;
          border: 1px solid rgba(0, 0, 0, 0.15);
          border-radius: 0;
          background: rgba(0, 0, 0, 0.035);
          color: #151515;
          font-size: 15px;
          transition: border-color 0.2s ease, background-color 0.2s ease;
        }

        .all-doors-search input::placeholder {
          color: rgba(21, 21, 21, 0.45);
        }

        .all-doors-search input:focus {
          outline: none;
          border-color: #00b04a;
          background: rgba(0, 0, 0, 0.05);
        }

        .all-doors-search-clear {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 32px;
          height: 32px;
          border: 0;
          background: transparent;
          color: rgba(21, 21, 21, 0.55);
        }

        .all-doors-search-clear:hover {
          color: #151515;
        }

        /* Same round close button as the template's search popup.
           :global because on phones it is a <Link>, which styled-jsx can't scope. */
        .all-doors :global(.all-doors-close) {
          flex: none;
          width: 52px;
          height: 52px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #151515;
          border-radius: 50%;
          background: transparent;
          transition: transform 0.4s ease, background-color 0.4s ease, border-color 0.4s ease;
        }

        /* The icon file is near-white, so darken it on the light panel */
        .all-doors :global(.all-doors-close img) {
          filter: brightness(0);
          transition: filter 0.4s ease;
        }

        .all-doors :global(.all-doors-close:hover) {
          transform: rotate(90deg);
          background: #151515;
          border-color: #151515;
        }

        .all-doors :global(.all-doors-close:hover img) {
          filter: none; /* back to the light icon on the dark hover state */
        }

        .all-doors-count {
          margin: 0;
          padding: 24px 48px 0;
          font-size: 14px;
          color: rgba(21, 21, 21, 0.6);
        }

        .all-doors-count strong {
          color: #151515;
        }

        /* Every door the same height, as wide as its own shape. The height is
           set so a row of standard doors (half as wide as tall) fills the width
           exactly: --per-row of them plus the gaps. Rows are centred, so a row
           holding a wide or slimmer door still looks balanced. */
        .all-doors-grid {
          --per-row: 5;
          --col-gap: 28px;
          --plate: 16px;
          --bar: 44px;
          container-type: inline-size; /* lets the doors size from the grid width */
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: flex-start;
          gap: 44px var(--col-gap);
          padding: 28px 48px 80px;
        }

        .all-door-card {
          position: relative; /* the name bar is pinned to this plate */
          flex: none;
          display: flex;
          flex-direction: column;
          padding: var(--plate) var(--plate) calc(var(--plate) + var(--bar));
          background: linear-gradient(180deg, #faf8f5 0%, #efece5 100%);
          box-shadow: 0 14px 30px rgba(21, 21, 21, 0.08);
          cursor: zoom-in;
          transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .all-door-card:hover,
        .all-door-card:focus-visible {
          transform: translateY(-10px);
          box-shadow: 0 30px 56px rgba(21, 21, 21, 0.16);
          outline: none;
        }

        .all-door-card :global(img) {
          display: block;
          /* 0.505 rather than 0.5 and 8px spare, so rounding never pushes the
             last door of a row onto the next one. Each door also carries its
             plate's side padding. */
          height: calc(
            (
                100cqw - (var(--per-row) - 1) * var(--col-gap) - var(--per-row) * var(--plate) * 2 -
                  8px
              ) / var(--per-row) / 0.505
          );
          width: auto;
          max-width: calc(100cqw - var(--plate) * 2);
          object-fit: contain;
        }

        /* Exactly as wide as the door: width 0 + min-width 100% stops a long
           name from widening the card; it wraps instead */
        /* Pinned to the plate's bottom edge: exactly the plate's width, and it
           adds nothing to the card's width however long the name is */
        .all-door-name {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: var(--bar);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin: 0;
          padding: 0 12px;
          background: #00b04a;
          color: #ffffff;
          font-family: var(--title-font);
          font-size: clamp(13px, 0.9vw, 16px);
          font-weight: 600;
          letter-spacing: 0.14em;
          line-height: 1.2;
          text-align: center;
          text-transform: uppercase;
          overflow-wrap: anywhere;
        }

        .all-doors-empty {
          padding: 80px 24px;
          text-align: center;
          color: rgba(21, 21, 21, 0.7);
        }

        .all-doors-empty p {
          margin-bottom: 24px;
          font-size: 18px;
        }

        @media (max-width: 1400px) {
          .all-doors-grid {
            --per-row: 4;
          }
        }

        @media (max-width: 1200px) {
          .all-doors-grid {
            --per-row: 3;
          }
        }

        @media (max-width: 991px) {
          .showcase-status {
            bottom: 22px;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 20px;
          }
          .status-label {
            display: none;
          }
          /* Solid instead of blurred: a blur is redrawn on every scroll frame,
             which is what makes scrolling stutter on phones */
          .all-doors-head {
            flex-wrap: wrap;
            gap: 16px;
            padding: 20px 24px;
            background: #ffffff;
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
          }
          .all-doors-search {
            order: 3;
            flex-basis: 100%;
            max-width: none;
            margin-left: 0;
          }
          .all-doors :global(.all-doors-close) {
            margin-left: auto;
          }
          .all-doors-count {
            padding: 18px 24px 0;
          }
          .all-doors-grid {
            --col-gap: 20px;
            --plate: 12px;
            --bar: 40px;
            row-gap: 32px;
            padding: 20px 24px 60px;
          }
        }

        @media (max-width: 767px) {
          .all-doors-grid {
            --per-row: 2;
            --col-gap: 14px;
            --plate: 10px;
            --bar: 36px;
            row-gap: 24px;
          }
        }

        @media (max-width: 575px) {
          .showcase-status {
            left: 15px;
            right: 15px;
            bottom: 12px;
            font-size: 13px;
          }
          .showcase-message h2 {
            font-size: 24px;
          }
          .all-doors-titles h2 {
            font-size: 22px;
          }
          /* 16px text stops iOS Safari zooming in when the field is focused */
          .all-doors-search input {
            height: 46px;
            font-size: 16px;
          }
          .all-doors :global(.all-doors-close) {
            width: 44px;
            height: 44px;
          }
          .all-door-name {
            padding: 0 8px;
            font-size: 13px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .intro-hint-rule {
            animation: none;
          }
          .all-doors,
          .all-doors.is-open {
            transform: none;
            transition: opacity 0.2s ease, visibility 0s;
          }
          .status-fill {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
