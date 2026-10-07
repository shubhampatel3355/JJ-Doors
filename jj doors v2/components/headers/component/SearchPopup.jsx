"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

// Frisk template search overlay. Opened by a header button that toggles the
// "show" class on .popup-search-box (see Header1 / Header3 showSearch).
// onSearch: filter on the current page. Without it, searching opens /shop.
export default function SearchPopup({ onSearch, initialValue = "" }) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const boxRef = useRef(null);
  const inputRef = useRef(null);

  // Keep the field in step when the page clears or changes the search
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const close = () => boxRef.current?.classList.remove("show");

  // Focus the field when the popup opens; Escape closes it
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const observer = new MutationObserver(() => {
      if (box.classList.contains("show")) setTimeout(() => inputRef.current?.focus(), 50);
    });
    observer.observe(box, { attributes: true, attributeFilter: ["class"] });
    const onKey = (e) => {
      if (e.key === "Escape" && box.classList.contains("show")) box.classList.remove("show");
    };
    document.addEventListener("keydown", onKey);
    return () => {
      observer.disconnect();
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = value.trim();
    if (onSearch) onSearch(q);
    else if (q) router.push(`/shop?search=${encodeURIComponent(q)}`);
    close();
  };

  return (
    <div className="popup-search-box" ref={boxRef}>
      <button
        className="searchClose"
        onClick={() =>
          document
            .getElementsByClassName("popup-search-box")[0]
            ?.classList.toggle("show")
        }
      >
        <Image
          width={24}
          height={24}
          src="/assets/img/icon/close.svg"
          alt="img"
        />
      </button>
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search Here.."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button type="submit">
          <Image
            width={24}
            height={24}
            src="/assets/img/icon/search-white.svg"
            alt="img"
          />
        </button>
      </form>
    </div>
  );
}
