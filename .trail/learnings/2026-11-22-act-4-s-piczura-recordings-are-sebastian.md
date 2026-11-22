---
title: "Act 4's piczura recordings are true 30 fps; the stutter was clips cut after looping, and fast scroll at 30 fps"
author: Sebastian
date: 2026-11-22
branch: redesign/decyzje
cost: { minutes: 12, tokens: 134298 }
id: l-398758c9
scope: repo
status: active
src: agent
touches:
  - src/components/ui/site-nav/site-nav.css
  - src/components/ui/site-nav/site-nav.tsx
  - src/components/ui/site-nav/stops.test.ts
  - src/components/ui/site-nav/stops.ts
  - src/i18n/messages/en.json
  - src/i18n/messages/pl.json
  - src/components/sections/how-i-work-case.tsx
---

## Decided
On 22.11 the owner said the piczura.com recordings on act 4's screen 3 stutter like 15 fps. Measured: the four clips are clean 30 fps (every frame differs, no duplicates; the scroll moves evenly frame to frame), the video plays rather than being scrubbed, and on this Mac Chromium (M4 GPU) and WebKit both present them at 29-30 fps on the page, the same as the bare file on an empty page. Two real causes were left. (1) The scenes turned over on a fixed 5.2 s timer while wybiegi (4.2 s from the hand-off) and miasto (4.7 s) are shorter, so they looped back to their first frame and were cut a second later: a visible jump. Fixed: in auto mode each clip plays once and hands over on its ended event; a scene the visitor picked loops. (2) The clips show a fast page scroll, 20-30 px per frame at 1600 px, which strobes at 30 fps on 120 Hz screens. Only a 60 fps recapture fixes that, and that needs the owner's go-ahead.

## Tried and ruled out
Interpolating the clips to 60 fps with ffmpeg minterpolate (mci, aobmc, bidir): the big italic title smears and doubles in the made-up frames. Not usable.

## Watch out
The browser pane runs as a background page while it is hidden (rAF at about 3 fps), so it is useless for timing measurements. Measure with Playwright from website/node_modules, headless with channel 'chromium' (real GPU) and webkit, and count requestVideoFrameCallback frames per clip. A window that spans a scene switch makes the fps look like 15. Window per clip.

In the code: website/src/components/sections/how-i-work-case.tsx (next() on onEnded, loop={!auto}; the TURN interval is gone).
