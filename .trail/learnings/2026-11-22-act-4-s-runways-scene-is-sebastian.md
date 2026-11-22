---
title: "Act 4's Runways scene is scrolled by the visitor through frames of the live site, not played as a recording"
author: Sebastian
date: 2026-11-22
branch: redesign/decyzje
cost: { minutes: 19, tokens: 127389 }
id: l-53d3b7ee
scope: repo
status: active
src: agent
touches:
  - src/components/sections/how-i-work-case.tsx
  - src/components/sections/how-i-work-case-frames.ts
---

## Decided
On 22.11 the owner disliked the piczura.com recordings: the autoplayed scroll looked odd, and the header icon went wild because the capture was sped up. He wanted something interactive, like the moment the photos close into a film strip. The Runways scene is now frames taken from the live site, one every 10 px of its scroll, and once the frame has grown the visitor's own scroll moves through them (170 svh of extra track). The scene stays real (the client's actual page), the tempo is the visitor's, and on screens of any refresh rate it is as smooth as the scroll. The other three scenes are still recordings for now. The owner judges Runways first. Scenes no longer turn over by themselves, because that would fight the visitor's scroll.

## Tried and ruled out
Re-recording at 60 fps: it fixes frame stepping but keeps the autoplayed scroll the owner disliked.

## Watch out
The first frame must match the DOM scene at the hand-off. It was found by SSIM against the old clip's hand-off frame: viewport 1920x1200, piczura.com scroll 1838 (Lenis, gsap; each step settled 600 ms before the screenshot, mouse parked in the corner). If piczura.com changes, recapture from there and check the hand-off. Keep only a few frames decoded (1600x1000 bitmaps are 6.4 MB each). The compressed set is 17 MB and is fetched coarse-first once the section is near.

In the code: website/src/components/sections/how-i-work-case-frames.ts (FrameSequence), how-i-work-case.tsx (RUNWAYS 253 frames, TRACK 440 + DRIVE 170 svh, piecewise scroll mapping around T.play), public/video/act4/wybiegi/000-252.webp (cwebp -q 65 -m 6 -sharp_yuv).
