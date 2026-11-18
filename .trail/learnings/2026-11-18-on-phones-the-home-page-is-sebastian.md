---
title: "On phones the home page is slow on the GPU, not the main thread; scenes already stop drawing off screen"
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 10, tokens: 66573 }
id: l-224d2522
scope: repo
status: active
src: agent
touches:
  - src/components/canvas/liquid-hero/liquid-stage.ts
  - src/components/canvas/liquid-hero/loader.ts
  - src/components/sections/aspect-demo.css
  - src/components/sections/aspect-demo.tsx
  - src/components/sections/ready2order-scene.css
  - src/components/sections/ready2order-scene.tsx
  - src/components/ui/rise.css
  - src/components/ui/rise.tsx
  - src/hooks/use-reveal.test.tsx
  - src/hooks/use-reveal.ts
---

## Decided
- On 2026-11-18 the owner found the page very slow on an iPhone 11 Pro and asked to keep only the current section in memory. A measurement came first (owner's rule: measure before choosing).

## Watch out
- Headless Chromium at 375x812, 3x, CPU throttled 4x: scrolling every section keeps a median frame of ~11 ms and no long tasks, so the main thread is not the bottleneck. The GPU of a real iPhone can't be measured there.
- The hero, ready2order and the menu each keep a live WebGL context with their textures, and two physics workers stay alive, even when far off screen. Their draw loops do pause off screen, except the hero, which still drew while the aspect-preview demo was in view.
- The liquid is drawn at 750x1624 on a phone, with dozens of passes per frame (distance field): the likely cost on the iPhone's GPU.
- Since the fast-scroll fix, going back up caps the stronypodhale act by the scroll (actT ≤ ACT_LEN · clamp((P − (ACT_OFF_P − 0.24)) / 0.24)); the 1.4x rewind alone left the wordmark over the hero.

In the code:
- Draw counts per canvas: wrap getContext/drawArrays in an init script (Playwright), scroll section to section.
- src/components/canvas/liquid-hero/liquid-stage.ts (setRunning via IntersectionObserver on the stage), drops-stage.ts (IntersectionObserver pauses the worker), src/components/ui/site-nav/menu-water.ts.
