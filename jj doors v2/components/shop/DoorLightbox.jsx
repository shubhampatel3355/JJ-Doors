"use client";

// Full-screen view of a single door: large photo on a dark backdrop, its model
// name, arrows/swipe through the rest of the collection, and a WhatsApp
// enquiry with the model already written into the message.

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { contactInfo } from "@/data/contactInfo";

// The showroom number, taken from the contact details so there is one source
const WHATSAPP_NUMBER = (
  contactInfo.find((c) => (c.linkUrl || "").startsWith("tel:"))?.linkUrl || "tel:+919986069020"
).replace(/\D/g, "");

const pad2 = (n) => String(n).padStart(2, "0");

export default function DoorLightbox({ items = [], index, onClose, onIndex }) {
  const touchStartX = useRef(null);
  const closeRef = useRef(null);
  const isOpen = index != null && items[index];
  const count = items.length;

  // Escape closes, arrow keys move, and the page behind stays still
  useEffect(() => {
    if (index == null) return;
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onIndex((index + 1) % count);
      else if (e.key === "ArrowLeft") onIndex((index - 1 + count) % count);
    };
    document.addEventListener("keydown", onKey);
    const focusTimer = setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 80);

    return () => {
      root.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      clearTimeout(focusTimer);
    };
  }, [index, count, onClose, onIndex]);

  if (!isOpen) return null;

  const item = items[index];
  const name = item.name || item.title || "Door";
  const categoryName = item.categoryName || "";
  const message = `Hi JJ Doors, I'm interested in ${name}${categoryName ? ` (${categoryName})` : ""}. Could you share the details and pricing?`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 50 || count < 2) return;
    onIndex(dx < 0 ? (index + 1) % count : (index - 1 + count) % count);
  };

  return (
    <div
      className="door-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`${name}${categoryName ? `, ${categoryName}` : ""}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Clicking the space around the door closes it */}
      <button type="button" className="lightbox-backdrop" onClick={onClose} aria-label="Close" />

      <button
        type="button"
        ref={closeRef}
        className="lightbox-close"
        onClick={onClose}
        aria-label="Close"
      >
        <Image width={20} height={20} src="/assets/img/icon/close.svg" alt="" />
      </button>

      {count > 1 && (
        <>
          <button
            type="button"
            className="lightbox-arrow is-prev"
            onClick={() => onIndex((index - 1 + count) % count)}
            aria-label="Previous door"
          >
            <span />
          </button>
          <button
            type="button"
            className="lightbox-arrow is-next"
            onClick={() => onIndex((index + 1) % count)}
            aria-label="Next door"
          >
            <span />
          </button>
        </>
      )}

      <figure className="lightbox-stage">
        <Image
          // A new key per door so each photo fades in rather than swapping
          key={item.id ?? index}
          className="lightbox-photo"
          src={item.image || item.imgSrc || "/assets/img/about/1.png"}
          alt={name}
          width={600}
          height={1200}
          priority
        />
      </figure>

      <div className="lightbox-bar">
        <div className="lightbox-titles">
          <h2>{name}</h2>
          {categoryName && <span className="lightbox-category">{categoryName}</span>}
        </div>

        <div className="lightbox-actions">
          {count > 1 && (
            <span className="lightbox-count">
              <strong>{pad2(index + 1)}</strong> / {pad2(count)}
            </span>
          )}
          <a
            className="lightbox-enquire"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-whatsapp" aria-hidden="true" />
            ENQUIRE ON WHATSAPP
          </a>
        </div>
      </div>

      <style jsx>{`
        .door-lightbox {
          position: fixed;
          inset: 0;
          z-index: 1100; /* above the site header and the "view all" panel */
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 88px 88px 132px;
          animation: lightbox-in 0.35s ease both;
        }

        .lightbox-backdrop {
          position: absolute;
          inset: 0;
          border: 0;
          padding: 0;
          background: rgba(8, 9, 6, 0.94);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          cursor: zoom-out;
        }

        .lightbox-stage {
          position: relative;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          max-width: 100%;
          pointer-events: none; /* clicks fall through to the backdrop */
        }

        .lightbox-stage :global(.lightbox-photo) {
          display: block;
          width: auto;
          max-width: 100%;
          height: min(74vh, 900px);
          object-fit: contain;
          box-shadow: 0 40px 80px rgba(0, 0, 0, 0.55);
          animation: photo-in 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        /* Round buttons, matching the template's search-popup close */
        .lightbox-close,
        .lightbox-arrow {
          position: absolute;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border: 2px solid rgba(246, 245, 243, 0.55);
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.25);
          transition: transform 0.4s ease, background-color 0.3s ease, border-color 0.3s ease;
        }

        .lightbox-close {
          top: 32px;
          right: 40px;
        }

        .lightbox-close:hover {
          transform: rotate(90deg);
          background: #2e2e2d;
          border-color: transparent;
        }

        .lightbox-arrow {
          top: 50%;
          margin-top: -28px;
        }

        .lightbox-arrow.is-prev {
          left: 32px;
        }

        .lightbox-arrow.is-next {
          right: 32px;
        }

        .lightbox-arrow:hover {
          background: #00b04a;
          border-color: #00b04a;
        }

        /* Chevrons drawn from a rotated square, so no icon file is needed */
        .lightbox-arrow span {
          width: 12px;
          height: 12px;
          border-top: 2px solid #f6f5f3;
          border-right: 2px solid #f6f5f3;
        }

        .lightbox-arrow.is-prev span {
          transform: rotate(-135deg);
          margin-left: 4px;
        }

        .lightbox-arrow.is-next span {
          transform: rotate(45deg);
          margin-right: 4px;
        }

        .lightbox-bar {
          position: absolute;
          left: 48px;
          right: 48px;
          bottom: 40px;
          z-index: 2;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          pointer-events: none; /* only the controls inside are clickable */
        }

        .lightbox-titles h2 {
          margin: 0;
          color: #ffffff;
          font-size: clamp(24px, 2.4vw, 40px);
          line-height: 1.1;
        }

        .lightbox-category {
          display: block;
          margin-top: 6px;
          color: rgba(246, 245, 243, 0.6);
          font-size: 14px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .lightbox-actions {
          display: flex;
          align-items: center;
          gap: 28px;
          pointer-events: auto;
        }

        .lightbox-count {
          font-family: var(--title-font);
          font-size: 14px;
          font-variant-numeric: tabular-nums;
          color: rgba(246, 245, 243, 0.55);
        }

        .lightbox-count strong {
          color: #ffffff;
          font-weight: 600;
        }

        .lightbox-enquire {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 28px;
          background: #00b04a;
          color: #ffffff;
          font-family: var(--title-font);
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.08em;
          white-space: nowrap;
          transition: background-color 0.3s ease, transform 0.3s ease;
        }

        .lightbox-enquire:hover {
          background: #00963f;
          color: #ffffff;
          transform: translateY(-2px);
        }

        .lightbox-enquire i {
          font-size: 18px;
        }

        @keyframes lightbox-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes photo-in {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }

        @media (max-width: 991px) {
          .door-lightbox {
            padding: 80px 20px 150px;
          }
          .lightbox-stage :global(.lightbox-photo) {
            height: min(62vh, 700px);
          }
          .lightbox-close {
            top: 20px;
            right: 20px;
            width: 46px;
            height: 46px;
          }
          .lightbox-arrow {
            width: 46px;
            height: 46px;
            margin-top: -23px;
          }
          .lightbox-arrow.is-prev {
            left: 12px;
          }
          .lightbox-arrow.is-next {
            right: 12px;
          }
          .lightbox-bar {
            left: 20px;
            right: 20px;
            bottom: 24px;
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .lightbox-actions {
            width: 100%;
            justify-content: space-between;
            gap: 16px;
          }
          .lightbox-enquire {
            flex: 1 1 auto;
            justify-content: center;
            padding: 14px 20px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .door-lightbox,
          .lightbox-stage :global(.lightbox-photo) {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
