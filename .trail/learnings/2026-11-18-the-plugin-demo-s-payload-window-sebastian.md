---
title: "The plugin demo's Payload window is zoomed to fit 90% of the screen, with its layout width fixed first"
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 19, tokens: 210088 }
id: l-bf6a6897
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
The owner wants the whole plugin preview at most 90vh on a desktop, in a wireframe true to Payload 3 (wide nav, breadcrumbs, document header). It cannot fit by trimming, so the window is drawn at its natural size and scaled with CSS zoom. CSS zoom, not a transform, so react-image-crop's pointer maths stays right.

## Tried and ruled out
- A photo cap in svh: under zoom the content grows back.
- An auto width under zoom: the inside gets wider as the zoom drops, and at 1280×720 the zoom ran down to 0.25 without ever fitting.

## Watch out
The fit sets an explicit px width (the column's), a px photo cap (`--apd-cap`), then iterates the zoom three times. At 1280×720 the zoom is about 0.54 and the text gets small.

In the code: src/components/sections/aspect-demo.tsx (the `fit` in useLayoutEffect), aspect-demo.css.
