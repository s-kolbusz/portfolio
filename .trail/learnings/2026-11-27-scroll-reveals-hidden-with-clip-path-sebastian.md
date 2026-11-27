---
title: "Scroll reveals hidden with clip-path must be detected by measuring on scroll, and the liquid canvas must sit below the page, not under a raised layer"
author: Sebastian
date: 2026-11-27
branch: redesign/decyzje
cost: { minutes: 17, tokens: 150221 }
id: l-3736d149
scope: repo
status: active
src: agent
touches:
  - docs/design/2026-11-27-kim-jestem-ruch.md
  - src/components/about/about-liquid.tsx
  - src/components/subpage/reveal.tsx
---

## Decided
Subpage reveals are detected by measuring each element's position on scroll, not with an IntersectionObserver. The About page's liquid canvas is fixed at z-index -1 under a see-through page, with no z-indexed layer between it and the text.

## Tried and ruled out
An IntersectionObserver on the reveal targets: Chrome never reported elements hidden by their own clip-path (inset(100% ...) for the printer's layer-by-layer reveal), so they stayed invisible forever.
A content layer with position: relative and z-index: 1 above the canvas: the matte full stop's backdrop-filter then saw only the text, not the liquid, so the drop never went matte.

## Watch out
Any new reveal that hides an element with clip-path relies on the scroll measurement. Anything placed over the liquid that should affect it (backdrop-filter) must not sit inside a new stacking context. The contact and the door keep their own paper and cover the canvas on purpose.

In the code: src/components/subpage/reveal.tsx (scroll check, line at 0.88 of the screen), src/components/about/about.css (.ab-liquid z-index -1, .sp[data-liquid] background transparent, matte stop backdrop-filter clipped to circle(37%)), src/components/about/about-liquid.tsx.
