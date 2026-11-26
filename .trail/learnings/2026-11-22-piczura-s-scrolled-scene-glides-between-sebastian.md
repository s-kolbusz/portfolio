---
title: "Piczura's scrolled scene glides between frames by drawing the fraction of a scroll step, with its bar taken from one clean frame"
author: Sebastian
date: 2026-11-22
branch: redesign/decyzje
cost: { minutes: 9, tokens: 64448 }
id: l-287f100a
scope: repo
status: active
src: agent
touches:
  - public/video/act4/wybiegi/000.webp
  - public/video/act4/wybiegi/001.webp
  - public/video/act4/wybiegi/002.webp
  - public/video/act4/wybiegi/003.webp
  - public/video/act4/wybiegi/004.webp
  - public/video/act4/wybiegi/005.webp
  - public/video/act4/wybiegi/006.webp
  - public/video/act4/wybiegi/007.webp
---

## Decided
On 22.11 the owner liked tying piczura.com's page to the visitor's scroll, but the end of each scroll stuttered and the bar's sound icon flickered wildly. Cause: the frames are 10 px of piczura scroll apart, so a slow scroll or the ease-out stepped frame to frame. The bar is translucent, and its icon was in a different state in every frame. Fix: consecutive frames differ by a plain vertical scroll (measured: 8.33 px in the 1600 px frames). So between two frames the canvas draws the current frame moved up by the fraction of a step, rounded to whole frame pixels to keep type crisp, and the next frame drawn one step lower fills the bottom. One px of scroll now moves the page 1-2 px, never 8. The bar is always drawn from one frame (33), where nothing shows through it: static icon, no stepping under the bar.

## Tried and ruled out
Patching only the icon from the first frame: the translucent bar shows the page behind it, so the patch showed as a box. Filling it with the bar colour beside it still cut the ghost letters passing underneath.

## Watch out
This only holds while the scene is a plain scroll (the Runways section isn't pinned). For pinned piczura scenes (miasto, jelenie: is-przyklejona) the frames are not shifts of each other, so the in-between drawing would smear them. They need finer frames or another way.

In the code: website/src/components/sections/how-i-work-case-frames.ts (FrameOptions step/top/bar, paint), how-i-work-case.tsx (step 10*1600/1920, top 60, bar 33).
