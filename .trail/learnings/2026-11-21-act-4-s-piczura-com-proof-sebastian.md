---
title: "Act 4's piczura.com proof assembles the client's own photos into his scene, then hands off to the recording at the matching frame"
author: Sebastian
date: 2026-11-21
branch: redesign/decyzje
cost: { minutes: 29, tokens: 307406 }
id: l-d7be5a00
scope: repo
status: active
src: agent
touches:
  - src/components/sections/how-i-work-case.tsx
  - src/components/sections/how-i-work-case.css
---

## Decided
On 21.11 the owner found screen 3 of act 4 (piczura.com) weaker than he thought. Diagnosis: the proof was a small screen recording beside three sentences, the client's photo crossfaded into an unrelated page, and half the scroll stood still. The owner approved rebuilding it so that three real Dubai Fashion Week photos (the ones the Runways scene of piczura.com is built from) land in an album, "a photo gallery" is struck out in piczura's gold pencil, the album closes into its film strip, the show's name is written above it in piczura's own italic, and the frame grows to the screen and becomes the recording from that same frame. The owner also asked that the text be composed into the screen with hierarchy, not glued to the right: what he came with and what he expected sit beside (or over) the album, the answer replaces the struck sentence under the grown frame.

## Watch out
The hand-off only works if the DOM scene matches the clip frame. The layout was measured from the clip by dark-pixel bounding boxes, not by eye: if the piczura-wybiegi clip is re-cut or re-encoded, re-measure the title ink box and the strip at the hand-off time and update the constants.
Dash-drawn SVG strokes with pathLength break when combined with vector-effect: non-scaling-stroke (Chrome showed partial strokes at 0); draw the ring with pathLength alone and the strike with a clip-path reveal.

In the code: website/src/components/sections/how-i-work-case.tsx (scene in 1000x625 units, HANDOFF = 1.6 s, title ink x 41–866, baseline y 349, strip x 204–546, y 379–591), how-i-work-case.css; photos public/images/act4/piczura-dubai-*.webp; font public/fonts/boska.
