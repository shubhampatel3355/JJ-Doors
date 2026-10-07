/* Review pages: scale live device previews to fit their column.
   Each .device__screen holds an iframe rendered at its true size
   (data-w × data-h) and scaled down with a transform. */
(function () {
  "use strict";
  var screens = Array.prototype.slice.call(document.querySelectorAll(".device__screen[data-w]"));
  function fit() {
    screens.forEach(function (screen) {
      var frame = screen.querySelector("iframe");
      var w = +screen.getAttribute("data-w");
      var h = +screen.getAttribute("data-h");
      var max = +(screen.getAttribute("data-max") || 1);
      var inner = screen.clientWidth;
      var scale = Math.min(max, inner / w);
      frame.style.width = w + "px";
      frame.style.height = h + "px";
      frame.style.transform = "scale(" + scale + ")";
      screen.style.height = Math.round(h * scale) + "px";
    });
  }
  window.addEventListener("resize", fit);
  fit();

  /* Lazy-load previews so several prototypes do not boot at once */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var f = e.target.querySelector("iframe[data-src]");
        if (f) { f.src = f.getAttribute("data-src"); f.removeAttribute("data-src"); }
        io.unobserve(e.target);
      });
    }, { rootMargin: "200px" });
    screens.forEach(function (s) { io.observe(s); });
  } else {
    screens.forEach(function (s) {
      var f = s.querySelector("iframe[data-src]");
      if (f) f.src = f.getAttribute("data-src");
    });
  }

  /* Replay buttons reload a preview with the first-visit intro */
  document.querySelectorAll("[data-replay]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = document.getElementById(btn.getAttribute("data-replay"));
      if (!f) return;
      var src = f.getAttribute("src") || f.getAttribute("data-src");
      f.src = "about:blank";
      setTimeout(function () { f.src = src; }, 30);
    });
  });
})();
