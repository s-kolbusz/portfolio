---
title: "Text that rises from under a mask is clipped only at the bottom, and pin notes open and close in the same time"
author: Sebastian
date: 2026-11-17
branch: redesign/decyzje
cost: { minutes: 14, tokens: 69158 }
id: l-438df1de
scope: repo
status: active
src: agent
touches:
  - cook/ciecz-czastki/index.html
  - src/components/canvas/liquid-hero/liquid-hero.css
---

## Decided
- On 2026-11-17 the owner asked for a proper reveal on the pin notes, so that every detail gets polished, not only some. A note opens in one movement: the line draws out of the pin, the paper unrolls from the line's end, then the fact and the sentence rise in. It closes in reverse, and both ways take 0.9 s.

## Tried and ruled out
- overflow: hidden on the line masks of the stronypodhale scene. It cut the letters that reach past their own box: the end of the r and the tail of the y in the wordmark. The masks now clip only the bottom edge, the one the text rises from.

## Watch out
- In headless Chromium at 2× pixel density on a 1440 px viewport, the liquid stage draws so slowly that the timed act never finishes, so the wordmark stays hidden. Verify the desktop scene at 1×.
- To check a CSS transition frame by frame, pause the element's CSSTransition animations and set their currentTime. Screenshots are too slow to catch frames in real time.

In the code:
- src/components/canvas/liquid-hero/liquid-hero.css: `.scene .m` uses clip-path: inset(-1em -0.5em -0.12em -0.5em). The pin note's paper is `p::before`, scaled from the side of the pin. The delays of the open state and the closed state mirror each other.
