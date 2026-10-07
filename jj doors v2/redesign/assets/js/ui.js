/* ==========================================================================
   JJ Doors: Motion owns UI interactions
   Nav, menu, buttons, cards, forms, dialog, action bar, toast, accordions
   and page content enter/exit. Scroll and cinematic moments live in
   scroll.js (GSAP). No element is animated by both. Transform and opacity only.
   ========================================================================== */
(function () {
  "use strict";

  if (!window.Motion) return;
  var animate = Motion.animate;
  var hover = Motion.hover;
  var press = Motion.press;
  var inView = Motion.inView;
  var stagger = Motion.stagger;

  var EASE = [0.16, 1, 0.3, 1];
  var UI = 0.24;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var d = document.documentElement;

  function set(el, values) { animate(el, values, { duration: 0 }); }
  function lenis() { return window.__jjLenis || null; }

  /* ---------- Buttons: fill sweep, arrow nudge, press scale ---------- */
  function isArrow(svg) {
    var use = svg.querySelector("use");
    var ref = use && (use.getAttribute("href") || use.getAttribute("xlink:href"));
    return ref === "#i-arrow" || ref === "#i-arrow-up-right";
  }

  function enhanceButton(btn) {
    if (btn.__jj) return;
    btn.__jj = true;
    var base = document.createElement("span");
    base.className = "btn__base";
    while (btn.firstChild) base.appendChild(btn.firstChild);
    btn.appendChild(base);
    var fill = document.createElement("span");
    fill.className = "btn__fill";
    fill.setAttribute("aria-hidden", "true");
    var inner = document.createElement("span");
    inner.className = "btn__fill-in";
    inner.innerHTML = base.innerHTML;
    fill.appendChild(inner);
    btn.appendChild(fill);

    var arrows = Array.prototype.filter.call(btn.querySelectorAll("svg"), isArrow);

    if (reduce) {
      fill.style.transform = "none";
      inner.style.transform = "none";
      set(fill, { opacity: 0 });
    } else {
      set(fill, { x: "-101%" });
      set(inner, { x: "101%" });
    }

    hover(btn, function () {
      if (btn.disabled || btn.getAttribute("aria-disabled") === "true") return;
      if (reduce) {
        animate(fill, { opacity: 1 }, { duration: 0.15 });
        return function () { animate(fill, { opacity: 0 }, { duration: 0.15 }); };
      }
      animate(fill, { x: "0%" }, { duration: 0.32, ease: EASE });
      animate(inner, { x: "0%" }, { duration: 0.32, ease: EASE });
      if (arrows.length) animate(arrows, { x: 4 }, { duration: UI, ease: EASE });
      return function () {
        animate(fill, { x: "-101%" }, { duration: 0.28, ease: EASE });
        animate(inner, { x: "101%" }, { duration: 0.28, ease: EASE });
        if (arrows.length) animate(arrows, { x: 0 }, { duration: UI, ease: EASE });
      };
    });

    if (!reduce) {
      press(btn, function () {
        animate(btn, { scale: 0.98 }, { duration: 0.12, ease: EASE });
        return function () { animate(btn, { scale: 1 }, { duration: 0.2, ease: EASE }); };
      });
    }
  }
  document.querySelectorAll(".btn").forEach(enhanceButton);

  /* Text links with an arrow: nudge on hover */
  if (!reduce) {
    document.querySelectorAll(".link, .tile__cta").forEach(function (link) {
      var svg = link.querySelector("svg");
      if (!svg) return;
      hover(link, function () {
        animate(svg, { x: 4 }, { duration: UI, ease: EASE });
        return function () { animate(svg, { x: 0 }, { duration: UI, ease: EASE }); };
      });
    });
  }

  /* ---------- Navigation ---------- */
  var nav = document.querySelector("[data-nav]");
  var menuOpen = false;
  if (nav) {
    var navBg = nav.querySelector(".nav__bg");
    var hidden = false;
    var solid = false;
    var lastY = window.scrollY;
    var ticking = false;

    var setHidden = function (h) {
      if (reduce || h === hidden) return;
      hidden = h;
      animate(nav, { y: h ? "-100%" : "0%" }, { duration: 0.3, ease: EASE });
    };
    var setSolid = function (s) {
      if (s === solid) return;
      solid = s;
      animate(navBg, { opacity: s ? 1 : 0 }, { duration: UI, ease: EASE });
    };
    // Over a full-bleed film the bar stays solid so the links always read
    var alwaysSolid = d.getAttribute("data-hero") === "full";
    var onScroll = function () {
      ticking = false;
      var y = window.scrollY;
      setSolid(alwaysSolid || y > 8);
      if (Math.abs(y - lastY) < 6) return;
      setHidden(y > lastY && y > 160 && !menuOpen && !nav.contains(document.activeElement));
      lastY = y;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    nav.addEventListener("focusin", function () { setHidden(false); });
    onScroll();

    /* Active-link indicator: one element glides between links (shared layout) */
    var links = Array.prototype.slice.call(nav.querySelectorAll(".nav__link"));
    var indicator = nav.querySelector(".nav__indicator");
    var linkWrap = nav.querySelector(".nav__links");
    var spied = null;
    var hovering = null;
    var moveTo = function (link) {
      if (!indicator) return;
      if (!link) { animate(indicator, { opacity: 0 }, { duration: 0.2 }); return; }
      animate(indicator, { x: link.offsetLeft, scaleX: link.offsetWidth / 100, opacity: 1 }, { duration: reduce ? 0 : 0.35, ease: EASE });
    };
    if (indicator) set(indicator, { x: 0, scaleX: 0, opacity: 0 });
    links.forEach(function (l) {
      l.addEventListener("pointerenter", function () { hovering = l; moveTo(l); });
      l.addEventListener("focus", function () { moveTo(l); });
      l.addEventListener("blur", function () { moveTo(hovering || spied); });
    });
    if (linkWrap) linkWrap.addEventListener("pointerleave", function () { hovering = null; moveTo(spied); });

    /* Scroll spy: the indicator rests under the section crossing the middle of the screen */
    links.forEach(function (l) {
      var id = l.getAttribute("data-spy");
      var section = id && document.getElementById(id);
      if (!section) return;
      inView(section, function () {
        spied = l;
        if (!hovering) moveTo(l);
        return function () {
          if (spied === l) { spied = null; if (!hovering) moveTo(null); }
        };
      }, { margin: "-45% 0px -45% 0px" });
    });
  }

  /* ---------- Full-screen menu ---------- */
  var menu = document.getElementById("menu");
  var openBtn = document.querySelector("[data-menu-open]");
  if (menu && openBtn) {
    var closeBtn = menu.querySelector("[data-menu-close]");
    var items = menu.querySelectorAll("[data-menu-item]");
    var lastFocus = null;

    var focusables = function () {
      return Array.prototype.filter.call(menu.querySelectorAll("a[href], button:not([disabled])"), function (el) { return el.offsetParent !== null; });
    };
    var onKey = function (e) {
      if (e.key === "Escape") { e.preventDefault(); closeMenu(true); return; }
      if (e.key !== "Tab") return;
      var f = focusables();
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    var openMenu = function () {
      if (menuOpen) return;
      menuOpen = true;
      lastFocus = document.activeElement;
      menu.hidden = false;
      openBtn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      if (lenis()) lenis().stop();
      animate(menu, { opacity: [0, 1] }, { duration: UI, ease: EASE });
      if (reduce) animate(items, { opacity: [0, 1] }, { duration: 0.2 });
      else animate(items, { opacity: [0, 1], y: [24, 0] }, { duration: 0.5, ease: EASE, delay: stagger(0.07, { startDelay: 0.06 }) });
      closeBtn.focus();
      document.addEventListener("keydown", onKey);
    };
    var closeMenu = function (returnFocus) {
      if (!menuOpen) return;
      menuOpen = false;
      openBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      if (lenis()) lenis().start();
      document.removeEventListener("keydown", onKey);
      animate(menu, { opacity: 0 }, { duration: 0.2, ease: EASE }).then(function () {
        if (!menuOpen) menu.hidden = true;
      });
      if (returnFocus && lastFocus) lastFocus.focus();
    };
    openBtn.addEventListener("click", openMenu);
    closeBtn.addEventListener("click", function () { closeMenu(true); });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a[href]")) closeMenu(false);
    });
  }

  /* ---------- Collection tiles: image zoom and info reveal ---------- */
  document.querySelectorAll(".tile__link").forEach(function (link) {
    var img = link.querySelector(".tile__img");
    var more = link.querySelector(".tile__more");
    if (!finePointer || !more) return;
    set(more, reduce ? { opacity: 0 } : { opacity: 0, y: 8 });
    var enter = function () {
      if (!reduce) animate(img, { scale: 1.04 }, { duration: 0.6, ease: EASE });
      animate(more, reduce ? { opacity: 1 } : { opacity: 1, y: 0 }, { duration: reduce ? 0.2 : 0.3, ease: EASE });
    };
    var leave = function () {
      if (!reduce) animate(img, { scale: 1 }, { duration: 0.6, ease: EASE });
      animate(more, reduce ? { opacity: 0 } : { opacity: 0, y: 8 }, { duration: 0.24, ease: EASE });
    };
    hover(link, function () { enter(); return leave; });
    link.addEventListener("focus", enter);
    link.addEventListener("blur", leave);
  });

  /* ---------- Guide cards: image zoom and arrow nudge ---------- */
  document.querySelectorAll(".post__link").forEach(function (link) {
    var img = link.querySelector(".post__img");
    var svg = link.querySelector(".post__cta svg");
    if (!finePointer || reduce || !img) return;
    hover(link, function () {
      animate(img, { scale: 1.04 }, { duration: 0.6, ease: EASE });
      if (svg) animate(svg, { x: 4 }, { duration: UI, ease: EASE });
      return function () {
        animate(img, { scale: 1 }, { duration: 0.6, ease: EASE });
        if (svg) animate(svg, { x: 0 }, { duration: UI, ease: EASE });
      };
    });
  });

  /* ---------- Hero film ----------
     Loads only the active variant at the right size, starts as the door opens
     (scroll.js sends "jj:hero-open"), never autoplays for reduced motion or
     Data Saver, pauses off screen, and always has a play/pause button. */
  (function () {
    var variant = d.getAttribute("data-hero") === "full" ? "full" : "framed";
    var section = document.querySelector('[data-hero-variant="' + variant + '"]');
    var video = section && section.querySelector("[data-hero-video]");
    var toggle = section && section.querySelector("[data-video-toggle]");
    if (!video || !toggle) return;
    var small = window.matchMedia("(max-width: 767px)").matches;
    var src = video.getAttribute(small ? "data-src-mobile" : "data-src-desktop");
    var saveData = navigator.connection && navigator.connection.saveData;
    var autoplay = !reduce && !saveData;
    var wanted = false;
    var userPaused = false;

    var load = function () {
      if (video.getAttribute("src")) return;
      video.setAttribute("src", src);
      video.load();
    };
    var play = function () {
      load();
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    };
    var sync = function () {
      var playing = !video.paused;
      toggle.classList.toggle("is-playing", playing);
      toggle.setAttribute("aria-label", playing ? "Pause the film" : "Play the film");
    };
    video.addEventListener("play", sync);
    video.addEventListener("pause", sync);
    toggle.addEventListener("click", function () {
      if (video.paused) { userPaused = false; wanted = true; play(); }
      else { userPaused = true; video.pause(); }
    });
    if (!reduce) {
      press(toggle, function () {
        animate(toggle, { scale: 0.94 }, { duration: 0.12, ease: EASE });
        return function () { animate(toggle, { scale: 1 }, { duration: 0.2, ease: EASE }); };
      });
    }
    if (autoplay) {
      var start = function () { if (wanted || userPaused) return; wanted = true; play(); };
      document.addEventListener("jj:hero-open", start);
      setTimeout(start, 2600); // if the intro never runs
    }
    inView(section, function () {
      if (wanted && !userPaused) play();
      return function () { if (!video.paused) video.pause(); };
    }, { amount: 0.15 });
    sync();
  })();

  /* ---------- Forms: focus line, validation, success ---------- */
  function lineOf(input) { return input.parentElement && input.parentElement.querySelector(".field__line"); }
  document.querySelectorAll(".field__input").forEach(function (input) {
    var line = lineOf(input);
    if (!line) return;
    set(line, { scaleX: 0 });
    input.addEventListener("focus", function () { animate(line, { scaleX: 1 }, { duration: reduce ? 0 : 0.3, ease: EASE }); });
    input.addEventListener("blur", function () { animate(line, { scaleX: 0 }, { duration: reduce ? 0 : UI, ease: EASE }); });
  });
  document.querySelectorAll('input[type="tel"]').forEach(function (input) {
    input.addEventListener("input", function () {
      var digits = input.value.replace(/\D/g, "").slice(0, 10);
      if (digits !== input.value) input.value = digits;
    });
  });

  function describedBy(input, id, on) {
    var ids = (input.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean);
    var has = ids.indexOf(id) > -1;
    if (on && !has) ids.push(id);
    if (!on && has) ids.splice(ids.indexOf(id), 1);
    if (ids.length) input.setAttribute("aria-describedby", ids.join(" "));
    else input.removeAttribute("aria-describedby");
  }
  function setError(field, on) {
    var input = field.querySelector(".field__input");
    var err = field.querySelector(".field__error");
    if (!input || !err) return;
    field.classList.toggle("is-invalid", on);
    describedBy(input, err.id, on);
    if (on) {
      input.setAttribute("aria-invalid", "true");
      if (err.hidden) {
        err.hidden = false;
        animate(err, reduce ? { opacity: [0, 1] } : { opacity: [0, 1], y: [-4, 0] }, { duration: UI, ease: EASE });
      }
    } else {
      input.removeAttribute("aria-invalid");
      err.hidden = true;
    }
  }
  function validate(field) {
    var input = field.querySelector(".field__input");
    if (!input || !field.querySelector(".field__error")) return true;
    if (input.value && input.type !== "tel") input.value = input.value.replace(/^\s+/, "");
    var ok = input.checkValidity() && (input.tagName === "SELECT" || !input.required || input.value.trim() !== "");
    setError(field, !ok);
    return ok;
  }

  function wireForm(form, success, onSuccess) {
    if (!form) return;
    var fields = Array.prototype.slice.call(form.querySelectorAll(".field"));
    fields.forEach(function (field) {
      var input = field.querySelector(".field__input");
      if (!input) return;
      input.addEventListener("blur", function () { if (input.value) validate(field); });
      input.addEventListener("input", function () { if (field.classList.contains("is-invalid")) validate(field); });
      input.addEventListener("change", function () { if (field.classList.contains("is-invalid")) validate(field); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      fields.forEach(function (f) { if (!validate(f) && !firstBad) firstBad = f; });
      if (firstBad) { firstBad.querySelector(".field__input").focus(); return; }
      if (onSuccess) onSuccess(form);
      animate(form, { opacity: 0 }, { duration: 0.2, ease: EASE }).then(function () {
        form.hidden = true;
        success.hidden = false;
        animate(success, reduce ? { opacity: [0, 1] } : { opacity: [0, 1], y: [12, 0] }, { duration: 0.4, ease: EASE });
        success.focus();
      });
    });
  }

  var quoteForm = document.querySelector("[data-quote-form]");
  var quoteSuccess = document.querySelector("[data-form-success]");
  wireForm(quoteForm, quoteSuccess, function (form) {
    var first = (form.elements.name.value.trim().split(/\s+/)[0] || "").slice(0, 40);
    var phone = form.elements.phone.value;
    quoteSuccess.querySelector("[data-success-title]").textContent = first ? "Thank you, " + first + "." : "Thank you.";
    quoteSuccess.querySelector("[data-success-text]").textContent =
      "We have your request for " + form.elements.interest.value + " and will contact you on +91 " + phone + ".";
  });
  var resetBtn = document.querySelector("[data-form-reset]");
  if (resetBtn && quoteForm) {
    resetBtn.addEventListener("click", function () {
      quoteForm.reset();
      quoteSuccess.hidden = true;
      quoteForm.hidden = false;
      animate(quoteForm, { opacity: [0, 1] }, { duration: 0.3, ease: EASE });
      quoteForm.querySelector(".field__input").focus();
    });
  }

  /* ---------- Catalogue gate (dialog) ---------- */
  var dlg = document.querySelector("[data-catalogue-dialog]");
  if (dlg && dlg.showModal) {
    var catForm = dlg.querySelector("[data-catalogue-form]");
    var catSuccess = dlg.querySelector("[data-catalogue-success]");
    var opener = null;
    var openDlg = function (e) {
      opener = e.currentTarget;
      catForm.hidden = false;
      catSuccess.hidden = true;
      dlg.showModal();
      if (lenis()) lenis().stop();
      animate(dlg, reduce ? { opacity: [0, 1] } : { opacity: [0, 1], y: [16, 0] }, { duration: 0.3, ease: EASE });
    };
    var closeDlg = function () {
      animate(dlg, { opacity: 0 }, { duration: 0.2, ease: EASE }).then(function () {
        dlg.close();
        if (lenis()) lenis().start();
        if (opener) opener.focus();
      });
    };
    document.querySelectorAll("[data-catalogue-open]").forEach(function (b) { b.addEventListener("click", openDlg); });
    dlg.querySelector("[data-catalogue-close]").addEventListener("click", closeDlg);
    dlg.addEventListener("cancel", function (e) { e.preventDefault(); closeDlg(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) closeDlg(); });
    wireForm(catForm, catSuccess);
  }

  /* ---------- Mobile action bar: steps aside while the enquiry form is on screen ---------- */
  var bar = document.querySelector("[data-actionbar]");
  var enquiry = document.querySelector("[data-enquiry]");
  if (bar && enquiry) {
    inView(enquiry, function () {
      animate(bar, reduce ? { opacity: 0 } : { y: "110%" }, { duration: 0.3, ease: EASE });
      bar.setAttribute("inert", "");
      return function () {
        bar.removeAttribute("inert");
        animate(bar, reduce ? { opacity: 1 } : { y: "0%" }, { duration: 0.3, ease: EASE });
      };
    }, { amount: 0.2 });
  }

  /* ---------- Prototype notices ---------- */
  var region = document.querySelector("[data-toast]");
  var toastTimer = null;
  var toast = function (msg) {
    if (!region) return;
    region.innerHTML = "";
    var p = document.createElement("p");
    p.className = "toast__msg";
    p.textContent = msg;
    region.appendChild(p);
    animate(p, reduce ? { opacity: [0, 1] } : { opacity: [0, 1], y: [12, 0] }, { duration: 0.3, ease: EASE });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      animate(p, { opacity: 0 }, { duration: 0.3 }).then(function () { if (p.parentNode) p.parentNode.removeChild(p); });
    }, 2800);
  };
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-proto]");
    if (!a) return;
    e.preventDefault();
    toast(a.getAttribute("data-proto"));
  });

  /* ---------- Accordions (design system demo and Phase 2 specs) ---------- */
  document.querySelectorAll("[data-accordion] [data-acc-trigger]").forEach(function (trigger) {
    var panel = document.getElementById(trigger.getAttribute("aria-controls"));
    var icon = trigger.querySelector("svg");
    if (!panel) return;
    trigger.addEventListener("click", function () {
      var open = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", open ? "false" : "true");
      if (icon) animate(icon, { rotate: open ? 0 : 45 }, { duration: reduce ? 0 : UI, ease: EASE });
      if (open) { panel.hidden = true; return; }
      panel.hidden = false;
      var inner = panel.firstElementChild || panel;
      animate(inner, reduce ? { opacity: [0, 1] } : { opacity: [0, 1], y: [-6, 0] }, { duration: 0.3, ease: EASE });
    });
  });

  /* ---------- Page content enter and exit (runs under the GSAP wipe) ---------- */
  var page = document.querySelector("[data-page]");
  if (page) {
    document.addEventListener("jj:page-exit", function () { animate(page, { opacity: 0 }, { duration: 0.3, ease: EASE }); });
    document.addEventListener("jj:page-enter", function () { animate(page, { opacity: [0, 1] }, { duration: 0.5, delay: 0.12, ease: EASE }); });
    window.addEventListener("pageshow", function (e) { if (e.persisted) set(page, { opacity: 1 }); });
  }

  /* ---------- Collection index: hover/focus swaps sticky preview image ---------- */
  (function () {
    var list = document.querySelector("[data-cindex]");
    if (!list) return;
    var items = Array.prototype.slice.call(list.querySelectorAll("[data-cindex-item]"));
    var codeEl = document.querySelector("[data-cindex-code]");
    var descEl = document.querySelector("[data-cindex-desc]");
    var current = -1;

    function activate(idx) {
      if (idx === current) return;
      items.forEach(function (item) { item.classList.remove("is-active"); });
      items[idx].classList.add("is-active");
      var imgs = document.querySelectorAll("[data-cindex-img]");
      imgs.forEach(function (img) { img.classList.remove("is-active"); });
      var target = document.querySelector("[data-cindex-img='" + idx + "']");
      if (target) target.classList.add("is-active");
      var link = items[idx];
      if (codeEl && link.getAttribute("data-code")) codeEl.textContent = link.getAttribute("data-code");
      if (descEl && link.getAttribute("data-desc")) descEl.textContent = link.getAttribute("data-desc");
      current = idx;
    }

    items.forEach(function (item) {
      var idx = parseInt(item.getAttribute("data-cindex-item"), 10);
      if (isNaN(idx)) return;
      item.addEventListener("mouseenter", function () { activate(idx); });
      item.addEventListener("focus", function () { activate(idx); });
    });

    activate(0);
  })();

  /* ---------- Collection browser: ARIA tablist with keyboard nav ---------- */
  (function () {
    var tablist = document.querySelector("[data-cb-tabs]");
    if (!tablist) return;
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll("[role='tab']"));
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-cb-panel]"));
    var current = 0;

    // Find initially-selected tab
    tabs.forEach(function (tab, i) {
      if (tab.getAttribute("aria-selected") === "true") current = i;
    });

    function switchTo(idx, moveFocus) {
      if (idx === current && tabs[idx].getAttribute("aria-selected") === "true") return;
      // Deactivate old
      tabs[current].setAttribute("aria-selected", "false");
      tabs[current].setAttribute("tabindex", "-1");
      var oldPanel = panels[current];
      if (oldPanel) {
        animate(oldPanel, { opacity: 0 }, { duration: 0.15, ease: EASE }).then(function () {
          oldPanel.hidden = true;
        });
      }
      current = idx;
      // Activate new
      tabs[current].setAttribute("aria-selected", "true");
      tabs[current].setAttribute("tabindex", "0");
      if (moveFocus) tabs[current].focus();
      var newPanel = panels[current];
      if (newPanel) {
        newPanel.hidden = false;
        animate(newPanel, { opacity: [0, 1] }, { duration: reduce ? 0.15 : 0.3, ease: EASE });
      }
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { switchTo(i, false); });
      tab.addEventListener("keydown", function (e) {
        var next = current;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); next = (current + 1) % tabs.length; }
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); next = (current - 1 + tabs.length) % tabs.length; }
        else if (e.key === "Home") { e.preventDefault(); next = 0; }
        else if (e.key === "End") { e.preventDefault(); next = tabs.length - 1; }
        else return;
        switchTo(next, true);
      });
    });
  })();
})();
