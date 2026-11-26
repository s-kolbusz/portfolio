---
title: The price list sheet follows the scroll in CSS so it stays smooth in iPhone Low Power Mode
author: Sebastian
date: 2026-11-26
branch: redesign/decyzje
cost: { minutes: 3, tokens: 29112 }
id: l-953b0c50
scope: repo
status: active
src: agent
---

## Decided
iOS Low Power Mode caps page scripts (requestAnimationFrame) at 30 fps while native scrolling keeps the screen's rate. A sheet moved by script lags the finger and stutters. Its rise and its lift are now scroll-driven CSS animations (view-timeline on the section). Their keyframes sample the script's smoothstep every 10%, so the path matches the old one within 2 px.
The sheet's blurred edge used to repaint every frame (the mask moved). Now the mask stays still and the whole sheet moves, while the inner content moves back by the same amount so the tiles stay put. Both are compositor-only.
The contact reveals once its main block is 40% on screen and the bar's liquid flood (site-bar[data-menu]) has drained, so a jump from the bar does not play it hidden under the flood.

## Watch out
- The steps, the folds (--c/--c2) and the canvas ground are still script-driven. If Low Power Mode still stutters, they are the next candidates.
- Browsers without animation-timeline fall back to the script (setting --y and --lift), now without the mask repaint. Scroll-driven CSS on iOS needs Safari 26.
- Not yet confirmed on the owner's iPhone.

In the code: how-i-work-end.css (the @supports block at the end, .cl-paper-in), how-i-work-end.tsx (onScroll), contact.tsx (reveal effect), contact.css (entry animation).
