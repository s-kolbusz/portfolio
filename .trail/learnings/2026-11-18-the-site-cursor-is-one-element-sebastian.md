---
title: The site cursor is one element that changes shape and shows on any background; no system cursor anywhere
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 19, tokens: 210088 }
id: l-7b1555ad
scope: repo
status: active
src: agent
touches:
  - src/components/canvas/liquid-hero/drops-stage.ts
  - src/components/sections/ready2order-scene.css
  - src/components/sections/ready2order-scene.tsx
  - src/components/ui/site-nav/site-nav.css
  - src/app/deferred.css
  - src/components/ui/custom-cursor.css
  - src/components/ui/custom-cursor.tsx
  - public/images/demo/lioness.jpg
---

## Decided
The owner found three cursors at once in the plugin editor "mega weird": the system crosshair, our dot and our ring. The dot must be as contextual as the ring and change by morphing, not by swapping. Now the system cursor is hidden everywhere. The dot is two bars that morph between a dot, a text bar (over selectable text) and a crosshair (where you place a point), and the ring steps back meanwhile. A click shrinks both. Dot and free ring use a white difference blend, so they show on paper, ink and photos.

## Watch out
- On a link the ring is still the keyboard focus ring (focus colour, no blend). The blend is switched off there in code.
- New places where you place a point get the crosshair with `data-cursor-shape="cross"`.

In the code: src/components/ui/custom-cursor.tsx (`shapeFor`), custom-cursor.css, src/app/deferred.css (`.custom-cursor-active *`).
