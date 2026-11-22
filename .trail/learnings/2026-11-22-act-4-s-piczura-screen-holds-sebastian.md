---
title: "Act 4's piczura screen holds still while the scroll turns the scenes; each recording plays once"
author: Sebastian
date: 2026-11-22
branch: redesign/decyzje
cost: { minutes: 1, tokens: 1267 }
id: l-4e65c587
scope: repo
status: active
replaces: l-53d3b7ee
src: agent
touches:
  - public/video/act4/piczura-wybiegi.mp4
---

## Decided
On 22.11 the owner went back to recordings after trying the scroll-driven frames, because even with in-between drawing they stuttered at the end of a scroll and the bar icon misbehaved. His way: once the frame has grown, the stage holds still, the scroll only turns the scenes over (200 svh for four), and the close covers the stage (it already starts 150 svh over screen 3's end). Each scene's recording plays once at its own speed and stops on its last frame, because looping back to the start was a visible jump. A name picked by hand holds until the scroll crosses into another scene. The Runways clip is rebuilt at 60 fps from frames of the live site taken at a steady 5 px scroll step (1920x1200, from scroll 1838, which matches the photo hand-off), with the bar from one clean frame laid over all of them, so its sound icon holds still. Verdi, City and Deer are still the old 30 fps clips.

## Tried and ruled out
Driving frames of the live page with the visitor's scroll (253 webp frames, 17 MB, with in-between drawing): the owner liked the link to the scroll, but the motion still stepped at the end of a scroll. An iframe of piczura.com fails because the site sends X-Frame-Options DENY, and a cross-origin frame can't be driven by our scroll anyway.

## Watch out
Whether the recording plays is decided from the raw scroll (s >= at), not from p >= T.play[1], because p is held at exactly T.play[1] while the scenes turn, and floating point put it just below, so nothing played.

In the code: website/src/components/sections/how-i-work-case.tsx (TRACK 440 + DRIVE 200 svh, scene from scroll, clips preload when near), public/video/act4/piczura-wybiegi.mp4 (1600x1000, 60 fps, 8.4 s), built with ffmpeg from capture frames plus a bar overlay.
