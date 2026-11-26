---
title: "The ready2order liquid takes the ready2order logo's blue as it rises; only the hue changes, the glass stays the hero's"
author: Sebastian
date: 2026-11-21
branch: redesign/decyzje
cost: { minutes: 4, tokens: 189800 }
id: l-90b65f38
scope: repo
status: active
src: agent
touches:
  - src/components/canvas/liquid-hero/drops-stage.ts
  - src/components/sections/ready2order-scene.tsx
---

## Decided
On 2026-11-21 the owner approved recoloring the ready2order scene's liquid to ready2order's blue, so the one liquid running through the page takes each scene's brand colour (as it darkens into green in the stronypodhale.pl scene). It rises from under the map in the hero's green and turns blue during the entrance, never appearing as a ready-made blue blob. The blue is the logo's exact colour, #1493BE, the only blue in the scene. The glass filters are the hero's green ones turned by the same hue angle (+38°, saturation and value kept), so transparency, refraction and highlights stay identical.

## Watch out
The blue is lighter than the old green because the logo blue itself is brighter; that is expected, not a bug. The no-WebGL2 fallback (cut-out PNG drops) is still green. The blue only affects the ink (dark) mode; paper mode (act 4) and its uTintK darkening are untouched.

In the code: drops-stage.ts SURFACE shader, const R2O, uniform uBlue, DropsFrame.blue (ink only); ready2order-scene.tsx frameAt returns blue = ease(span(intro, INTRO.liquid[0] + 0.4, INTRO.liquid[1])). Commit ef948b49.
