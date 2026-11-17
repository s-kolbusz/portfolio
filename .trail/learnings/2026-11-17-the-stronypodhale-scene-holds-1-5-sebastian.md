---
title: "The stronypodhale scene holds 1.5 screens, its pins and notes are kolbusz.xyz paper and ink, phones get the portrait phone screenshot, and tilt lives only in t…"
author: Sebastian
date: 2026-11-17
branch: redesign/decyzje
cost: { minutes: 1, tokens: 4543 }
id: l-0420ee9c
scope: repo
status: active
src: agent
touches:
  - cook/ciecz-czastki/index.html
  - src/components/canvas/liquid-hero/liquid-stage.ts
  - src/components/sections/hero.tsx
  - src/components/canvas/liquid-hero/liquid-hero.css
---

## Decided
- On 2026-11-17 the owner said the page moved on from the finished stronypodhale scene too soon. The stage is now pinned for one more screen, so the finished frame holds for about 1.5 screens of scroll. The wheel is also braked from the moment the act starts until the stage unpins.
- What is 100% stronypodhale.pl keeps its colours: the screenshot and the wordmark set exactly as its logo. What kolbusz.xyz adds on top is in the site's own paper and ink: the notes, and the pins as well. The owner then asked for pins that are easy to spot. They are now a bullseye (paper, an ink ring, a paper ring) with two pulsing rings, so they read on the dark sheet and on the light screenshot alike.
- On phones (viewport under 700 px) the scene shows stronypodhale.pl as seen on a phone, in portrait. The owner decided this on 14.11, but it was not implemented until 17.11, so carry it in briefs. The pins point to the same facts on that view. Tablets and desktops keep the 16:9 desktop screenshot.
- Tilt only means something in the hero. Once the sheet darkens, the TILT button fades out and tilt switches off.

## Watch out
- The phone screenshot was captured at 390×844 at 2×, with the showcase stopped on piczura.com. Recapture it the same way when the live site changes, and re-place the mu/mv pin fractions afterwards.
- The test page in cook/ciecz-czastki/index.html has the new pin styles, but not the portrait phone screenshot or the tilt rule. The real scene is ahead of it there.

In the code:
- src/components/canvas/liquid-hero/liquid-stage.ts: TRACK_SCREENS = 5, HOLD_FROM, PHONE_SHOT, IA (the screenshot's aspect ratio). On phones the frame height is capped at 60% of the visible height. The tilt button gets a data-away attribute.
- src/components/sections/hero.tsx: a hold marker with data-scroll-heavy="0.45" and data-scroll-range="box", and PINS mu/mv.
- src/components/canvas/liquid-hero/liquid-hero.css: .pin styles.
- public/images/projects/stronypodhale-mobile.avif
