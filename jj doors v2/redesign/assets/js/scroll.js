/* ==========================================================================
   JJ Doors: GSAP owns scroll and cinematic moments
   Intro, line reveals, image wipes, pinned sections, parallax, counters,
   the scroll-driven dark backdrop and the page wipe.
   UI interactions live in ui.js (Motion). No element is animated by both.
   Only transform and opacity are animated.
   ========================================================================== */
(function () {
  "use strict";

  var d = document.documentElement;
  if (!window.gsap || !window.ScrollTrigger) {
    d.classList.remove("intro-pending", "wipe-in");
    return;
  }

  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  CustomEase.create("jj", "0.16,1,0.3,1");

  var EASE = "jj";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var inFrame = d.classList.contains("in-frame");
  var params = new URLSearchParams(location.search);
  var wipeIn = d.classList.contains("wipe-in");
  var mm = gsap.matchMedia();

  gsap.defaults({ ease: EASE });

  /* ---------- Smooth scroll: Lenis, desktop pointer only ---------- */
  var lenis = null;
  if (!reduce && !inFrame && window.Lenis && window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches) {
    lenis = new Lenis({ lerp: 0.12, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  window.__jjLenis = lenis;

  function navOffset() {
    var nav = document.querySelector(".nav");
    return nav ? nav.offsetHeight : 0;
  }

  function whenFontsReady(cb) {
    var done = false;
    function go() { if (!done) { done = true; cb(); } }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
    setTimeout(go, 1200);
  }

  /* ---------- In-page anchors ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute("data-proto") || e.defaultPrevented) return;
    var id = a.getAttribute("href").slice(1);
    var target = id && document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: -navOffset(), duration: 1.1, force: true });
    else target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    if (history.pushState) history.pushState(null, "", "#" + id);
    setTimeout(function () {
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }, reduce ? 0 : 700);
  });

  /* ---------- Page wipe between top-level pages (700ms total) ----------
     The CSS parks the panel with translateX(101%). GSAP would read that as a
     pixel x and add xPercent on top, so x is zeroed whenever GSAP takes over. */
  var wipe = document.querySelector("[data-wipe]");
  if (wipe) {
    if (wipeIn) {
      gsap.set(wipe, { x: 0, xPercent: 0 });
      d.classList.remove("wipe-in");
      gsap.to(wipe, { xPercent: 101, duration: reduce ? 0 : 0.35, delay: 0.05 });
      document.dispatchEvent(new CustomEvent("jj:page-enter"));
    } else {
      gsap.set(wipe, { x: 0, xPercent: 101 });
    }
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) gsap.set(wipe, { x: 0, xPercent: 101 });
    });
    if (!inFrame) {
      document.addEventListener("click", function (e) {
        var a = e.target.closest("a[href]");
        if (!a || e.defaultPrevented || a.hasAttribute("data-proto")) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        if (a.target === "_blank" || a.hasAttribute("download")) return;
        var url;
        try { url = new URL(a.getAttribute("href"), location.href); } catch (err) { return; }
        if (url.protocol !== location.protocol || url.host !== location.host) return;
        if (url.pathname === location.pathname) return;
        if (!/\.html$/.test(url.pathname)) return;
        e.preventDefault();
        try { sessionStorage.setItem("jj-wipe", "1"); } catch (err) {}
        document.dispatchEvent(new CustomEvent("jj:page-exit"));
        if (reduce) { location.href = url.href; return; }
        gsap.fromTo(wipe, { x: 0, xPercent: 101 }, {
          xPercent: 0,
          duration: 0.35,
          onComplete: function () { location.href = url.href; }
        });
      });
    }
  }

  /* ---------- Hero intro ----------
     The threshold line draws, the panel slides off the film like a sliding
     door, and the headline rises. ui.js starts the film on "jj:hero-open". */
  function heroIntro() {
    var variant = d.getAttribute("data-hero") === "full" ? "full" : "video";
    var hero = document.querySelector(".hero--" + variant);
    window.__jjIntro = true;
    if (!hero) { d.classList.remove("intro-pending"); return; }

    var title = hero.querySelector("[data-intro-title]");
    var fades = gsap.utils.toArray(hero.querySelectorAll("[data-intro]"));
    var line = hero.querySelector(".hero__threshold");
    var panels = gsap.utils.toArray(hero.querySelectorAll(".hero__panel"));
    var imgs = gsap.utils.toArray(hero.querySelectorAll(".hero__video"));
    var open = function () { document.dispatchEvent(new CustomEvent("jj:hero-open")); };

    if (reduce) {
      d.classList.remove("intro-pending");
      gsap.from([title].concat(fades), { autoAlpha: 0, duration: 0.5, stagger: 0.05, ease: "none" });
      return;
    }

    var first = true;
    try {
      first = !sessionStorage.getItem("jj-visited");
      sessionStorage.setItem("jj-visited", "1");
    } catch (err) {}
    if (params.get("intro") === "first") first = true;

    // Take over the starting states from the CSS guard, then drop the guard
    gsap.set(line, { scaleX: 0, transformOrigin: "0% 50%" });
    gsap.set(panels, { x: 0, xPercent: 0 });
    gsap.set(fades, { autoAlpha: 0, y: 16 });
    gsap.set(title, { autoAlpha: 0 });
    d.classList.remove("intro-pending");

    var split = SplitText.create(title, { type: "lines", mask: "lines", linesClass: "split-line" });
    gsap.set(split.lines, { yPercent: 110 });
    gsap.set(title, { autoAlpha: 1 });

    var tl = gsap.timeline({ delay: wipeIn ? 0.3 : 0.1 });
    // 1. Threshold line draws: the light under the door (1.1s first visit, 0.7s after)
    tl.to(line, { scaleX: 1, duration: first ? 1.1 : 0.7 }, 0);
    // 2. The panel slides away like a sliding door; the film starts and settles from 1.1
    tl.to(panels, { xPercent: 101, duration: 1.0, stagger: 0.08 }, first ? 0.55 : 0.2);
    tl.call(open, null, "<");
    tl.fromTo(imgs, { scale: 1.1 }, { scale: 1, duration: 1.4, stagger: 0.08 }, "<");
    // 3. Headline rises line by line, then subtext, CTAs and caption
    tl.to(split.lines, { yPercent: 0, duration: 0.9, stagger: 0.08 }, "<0.05");
    tl.to(fades, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.07 }, "<0.35");
    tl.add(function () { split.revert(); });
  }

  /* ---------- Section headings: line-by-line rise ---------- */
  function splitHeadings() {
    gsap.utils.toArray("[data-split]").forEach(function (el) {
      if (reduce) {
        gsap.from(el, { autoAlpha: 0, duration: 0.6, ease: "none", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
        return;
      }
      SplitText.create(el, {
        type: "lines",
        mask: "lines",
        linesClass: "split-line",
        autoSplit: true,
        onSplit: function (self) {
          return gsap.from(self.lines, {
            yPercent: 110,
            duration: 0.9,
            stagger: 0.08,
            scrollTrigger: { trigger: el, start: "top 86%", once: true }
          });
        }
      });
    });
  }

  /* ---------- Fade-ups (batched so neighbours stagger) ---------- */
  function fades() {
    var items = gsap.utils.toArray("[data-fade]");
    if (!items.length) return;
    gsap.set(items, reduce ? { autoAlpha: 0 } : { autoAlpha: 0, y: 24 });
    ScrollTrigger.batch(items, {
      start: "top 90%",
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, reduce
          ? { autoAlpha: 1, duration: 0.5, ease: "none" }
          : { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.07 });
      }
    });
  }

  /* ---------- Image reveals: transform-only wipe + scale settle ----------
     The outer .frame__wipe slides up from 100% while the inner .frame__counter
     slides down by the same amount, so the image stays put and the visible
     window grows from the bottom edge, like a door being lifted into place. */
  function reveals() {
    gsap.utils.toArray("[data-reveal]").forEach(function (frame) {
      var wipeEl = frame.querySelector(".frame__wipe");
      var counter = frame.querySelector(".frame__counter");
      if (!wipeEl || !counter) return;
      if (reduce) {
        gsap.from(wipeEl, { autoAlpha: 0, duration: 0.6, ease: "none", scrollTrigger: { trigger: frame, start: "top 90%", once: true } });
        return;
      }
      var tl = gsap.timeline({ scrollTrigger: { trigger: frame, start: "top 88%", once: true } });
      tl.fromTo(wipeEl, { yPercent: 100 }, { yPercent: 0, duration: 1.0 }, 0)
        .fromTo(counter, { yPercent: -100 }, { yPercent: 0, duration: 1.0 }, 0)
        .fromTo(counter, { scale: 1.08 }, { scale: 1, duration: 1.3 }, 0);
    });
  }

  /* ---------- Threshold lines that draw on enter ---------- */
  function drawLines() {
    gsap.utils.toArray("[data-draw]").forEach(function (el) {
      if (reduce) return;
      gsap.fromTo(el, { scaleX: 0, transformOrigin: "0% 50%" }, {
        scaleX: 1,
        duration: 1.2,
        scrollTrigger: { trigger: el, start: "top 92%", once: true }
      });
    });
  }

  /* ---------- Counters: count up once ---------- */
  function counters() {
    gsap.utils.toArray("[data-count]").forEach(function (el) {
      var end = parseFloat(el.getAttribute("data-count"));
      if (reduce || isNaN(end)) return;
      var obj = { v: 0 };
      el.textContent = "0";
      gsap.to(obj, {
        v: end,
        duration: 1.6,
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
        onUpdate: function () { el.textContent = Math.round(obj.v).toLocaleString("en-IN"); }
      });
    });
  }

  /* ---------- Collections: pinned horizontal scroll on desktop ---------- */
  function collections() {
    var section = document.querySelector(".collections");
    if (!section) return;
    var track = section.querySelector("[data-collections-track]");
    var viewport = section.querySelector("[data-collections-viewport]");
    var bar = section.querySelector("[data-collections-progress]");

    mm.add({ desktop: "(min-width: 1024px)", reduce: "(prefers-reduced-motion: reduce)" }, function (ctx) {
      var c = ctx.conditions;
      if (c.desktop && !c.reduce) {
        section.classList.add("is-pinned");
        var distance = function () { return Math.max(0, track.scrollWidth - viewport.clientWidth); };
        gsap.to(track, {
          x: function () { return -distance(); },
          ease: "none",
          scrollTrigger: {
            trigger: section,
            pin: section.querySelector(".collections__pin"),
            start: "top top",
            end: function () { return "+=" + distance(); },
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: function (self) { gsap.set(bar, { scaleX: self.progress }); }
          }
        });
        return function () {
          section.classList.remove("is-pinned");
          gsap.set(track, { clearProps: "transform" });
        };
      }
      // Mobile, tablet and reduced motion: native swipe, progress follows the scroller
      var setBar = gsap.quickSetter(bar, "scaleX");
      var update = function () {
        var max = viewport.scrollWidth - viewport.clientWidth;
        setBar(max > 0 ? viewport.scrollLeft / max : 0);
      };
      viewport.addEventListener("scroll", update, { passive: true });
      update();
      return function () { viewport.removeEventListener("scroll", update); };
    });
  }

  /* ---------- Dark section: scroll-linked colour change into and out of Ink ---------- */
  function darkSection() {
    var spot = document.querySelector("[data-dark]");
    var back = document.querySelector("[data-backdrop]");
    if (!spot || !back || reduce) return;
    d.classList.add("has-backdrop");
    var enter, exit;
    var render = function () {
      var o = (enter ? enter.progress : 0) * (1 - (exit ? exit.progress : 0));
      gsap.set(back, { opacity: o });
    };
    // Short ranges keep the in-between grey brief; both are scrubbed by scroll position
    enter = ScrollTrigger.create({ trigger: spot, start: "top 70%", end: "top 40%", onUpdate: render, onRefresh: render });
    exit = ScrollTrigger.create({ trigger: spot, start: "bottom 75%", end: "bottom 40%", onUpdate: render, onRefresh: render });
    render();
  }

  /* ---------- Parallax: large editorial media only, about 10% travel, desktop ---------- */
  function parallax() {
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", function () {
      gsap.utils.toArray("[data-parallax]").forEach(function (el) {
        var box = el.closest(".hero__frame, .frame") || el.parentElement;
        gsap.fromTo(el, { yPercent: -6 }, {
          yPercent: 6,
          ease: "none",
          scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: true }
        });
      });
    });
  }

  /* ---------- Marquee: moves only while the visitor scrolls, never on its own ---------- */
  function marquee() {
    var row = document.querySelector("[data-marquee]");
    if (!row || reduce) return;
    gsap.fromTo(row, { xPercent: 0 }, {
      xPercent: -22,
      ease: "none",
      scrollTrigger: { trigger: row.parentElement, start: "top bottom", end: "bottom top", scrub: 0.4 }
    });
  }

  /* ---------- Why JJ: sticky visual swaps as points scroll past ---------- */
  function why() {
    var visuals = gsap.utils.toArray("[data-why-visual]");
    var points = gsap.utils.toArray("[data-why-point]");
    if (!points.length) return;
    var lines = points.map(function (p) { return p.querySelector(".point__line"); });

    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", function () {
      var current = 0;
      gsap.set(visuals, { autoAlpha: 0 });
      gsap.set(visuals[0], { autoAlpha: 1 });
      gsap.set(lines, { scaleX: 0, transformOrigin: "0% 50%" });
      gsap.set(lines[0], { scaleX: 1 });
      var show = function (i) {
        if (i === current) return;
        gsap.to(visuals[current], { autoAlpha: 0, duration: 0.6, overwrite: true });
        gsap.fromTo(visuals[i], { autoAlpha: 0, scale: 1.03 }, { autoAlpha: 1, scale: 1, duration: 0.9, overwrite: true });
        gsap.to(lines[current], { scaleX: 0, duration: 0.4, overwrite: true });
        gsap.to(lines[i], { scaleX: 1, duration: 0.7, overwrite: true });
        current = i;
      };
      points.forEach(function (p, i) {
        ScrollTrigger.create({
          trigger: p,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: function (self) { if (self.isActive) show(i); }
        });
      });
      return function () { gsap.set(visuals.concat(lines), { clearProps: "all" }); };
    });

    mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", function () {
      lines.forEach(function (line) {
        gsap.fromTo(line, { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 0.9, scrollTrigger: { trigger: line, start: "top 90%", once: true } });
      });
    });
  }

  /* ---------- Boot ---------- */
  whenFontsReady(function () {
    heroIntro();
    splitHeadings();
    fades();
    reveals();
    drawLines();
    counters();
    marquee();
    collections();
    darkSection();
    parallax();
    why();
    ScrollTrigger.refresh();
  });
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
