---
title: "Piczura's recordings show the live site with its sound switched off, captured frame by frame at 60 fps, and the strip matches the site's real tilt"
author: Sebastian
date: 2026-11-22
branch: redesign/decyzje
cost: { minutes: 10, tokens: 68894 }
id: l-c6987677
scope: repo
status: active
replaces: l-4e65c587
src: agent
touches:
  - src/components/ui/site-nav/nav-sign.tsx
  - src/components/ui/site-nav/site-nav.css
  - src/components/ui/site-nav/site-nav.tsx
  - src/i18n/messages/en.json
  - src/i18n/messages/pl.json
  - src/components/sections/how-i-work-case.css
  - src/components/sections/how-i-work-case.tsx
---

## Decided
The piczura recordings show the site the way a visitor sees it with sound switched off, using the site's own sound button. On 22.11 the owner rejected freezing the bar over the frames as "laboratory conditions": he wants reality. The sound icon (button.sound, on by default) is a playing-sound indicator, which is why it jumped from frame to frame. Muted, it is three still dots. All four scenes are captured frame by frame from the live site at 1920x1200 (every frame settled for 600 ms) and encoded at 60 fps with x264 crf 23 preset slow. Runways is a steady 5 px a frame from scroll 1838; Verdi, City and Deer are 540-600 eased frames, with City and Deer cut before the next section shows.
The hand-off DOM strip is re-measured from the live site's own boxes: 340 x 208 units at 205.3, 380.6, its row rotated -0.8 deg (.fr-wb-pas). The photos and ring turn with it about the strip's middle, and the ring uses the site's own path with only its first loop and a stroke of one width.

## Tried and ruled out
x264 crf 19 with tune film: 85 MB for 8 s, because the paper grain survives. crf 23 gives 3-8 MB and looks the same to the eye.
Laying a clean bar from one frame over every frame: the owner rejected it, it doesn't show the real site.

## Watch out
Pinned sections on piczura.com shift what is on screen at a given scroll: City starts at about 19000, not at its element's top (17850, where the Video section still holds the screen). Look at the frames before encoding.
Section ranges at 1920: Verdi 5342-7696, City 19000-30400 (cut at frame 469), Deer 46475-59675 (cut at frame 471).

In the code: src/components/sections/how-i-work-case.tsx (CLIPS *-2 names, KH/STRIP/TILT/PIVOT/turn, RING), src/components/sections/how-i-work-case.css (.cs-ring stroke 1.67), public/video/act4/piczura-*-2.mp4.
