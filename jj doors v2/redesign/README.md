# JJ Doors redesign: Phase 1

A static review package. Nothing outside this folder was changed; the live Next.js app in `jj doors v2/` is untouched.

## Open it

Open `index.html` (the review hub) or `home.html` (the prototype) directly in Chrome, Edge or Safari. An internet connection is needed for fonts (Fontshare), the motion libraries (jsDelivr) and the map (Google Maps).

| File | What it is |
|---|---|
| `index.html` | Hub: links, live 1440 and 390 previews, decisions needed |
| `discovery.html` | Step 1: content inventory (every model code), flags, imagery audit, reference teardown, sitemap |
| `design-system.html` | Tokens with contrast ratios, type pairings, grid, spacing, radius, component states, image rules, motion |
| `heroes.html` | Two video heroes: framed (recommended) and full-bleed, live at both sizes |
| `home.html` | Homepage prototype |

The homepage has exactly these sections, in this order: video hero, marquee, counters, “Mastering the art of door craftsmanship”, featured collections, contact form and map, three blog cards, CTA band, footer.

URL options for `home.html`: `?hero=full` (full-bleed video hero), `?grid=1` (12-column overlay), `?intro=first` (replay the first-visit intro).

## Structure

```
assets/css/tokens.css   design tokens (single source of truth)
assets/css/base.css     reset, type, grid, buttons, forms, nav, menu, action bar, footer, wipe
assets/css/home.css     homepage sections
assets/css/docs.css     review pages only
assets/js/scroll.js     GSAP + ScrollTrigger + SplitText + Lenis: scroll and cinematic moments
assets/js/ui.js         Motion: UI interactions (nav, menu, buttons, cards, film controls, forms, dialog)
assets/js/docs.js       review pages: scales the live device previews
assets/video/           the current site's hero film, trimmed before its logo end card, silent, web sizes
assets/img/doors/       WebP copies of the catalogue photos used, plus detail crops
assets/img/brand/       the supplied logo, resized only; favicon cropped from it
assets/img/manifest.json  which catalogue file each image came from
```

Each animated element is owned by one library only, and only transform and opacity are animated. The marquee moves only while the visitor scrolls; nothing loops on its own except the muted hero film, which has a pause button.

## Content rules followed

- Copy is tightened from the current site. Nothing is invented; gaps are marked `[PLACEHOLDER: …]`.
- Photography is the client's catalogue only. The AI images and AI category videos on the current site are not used. The hero film is the current site's own video (a CG render), kept because a video hero was requested.
- The form is a prototype: it validates and shows the success state but sends nothing.
