---
title: "The motion scenario for the chosen hero frame is a proposal awaiting the owner's corrections: the page opens just after a tear and the blob puts itself together"
author: Sebastian
date: 2026-11-15
branch: redesign/decyzje
cost: { minutes: 1, tokens: 2944 }
id: l-30d2565b
scope: repo
status: active
src: agent
touches:
  - src/components/canvas/viscous-puddle/shaders.ts
  - src/components/canvas/viscous-puddle/choreography.ts
  - src/components/sections/hero-frame.tsx
  - src/components/sections/hero-sample.tsx
---

## Decided
Nothing here is the owner's decision yet. On 2026-11-15 a step-by-step motion scenario for hero frame 1 (the name frames the blob) was written for him to correct; no motion code exists. What it proposes and why:
- One set of rules instead of separate animations: only the body gives up matter, matter is conserved (the body shrinks and grows back, which is the visible proof it "put itself together"), pieces wait while the visitor works and return when he lets go, the body pulls with a steady force, and the ink on the three lines follows events (tear → line 1, return starts → line 2, last piece swallowed → line 3), never a clock.
- The load is those rules started from a prepared state: the chosen still (body, tongue, drop, two free pieces). Reason: the three lines only name what the visitor has just seen, so everyone must see the gesture once, also those who never touch the blob. The name and text block stand from first paint; the typed-name animation goes, because it is what makes the blob look late.
- At rest the whole blob behaves as it does live and line 3 is in ink. It never falls apart on its own.
- One open question was put to him: keep the three lines at their size and judge in motion (recommended), or enlarge now.

## Tried and ruled out
- Hold-to-grab on phones: nobody would find it, and a long press on iPhone selects the name's letters.
- Blocking scroll for any touch that starts on the blob: the blob is nearly as wide as a phone, the visitor would be stuck in the hero.
- Letting the visitor carry pieces or split them further: more rules to tune, and splitting makes puffs.
- A narrower soft edge for small pieces: it changes the blob's look, so it is listed only as something that needs his consent.

## Watch out
- The soft edge's width is a share of the viewport height, not of the blob's size, and it ignores the phone's smaller blob: the same edge sits on a much smaller body there. That is why the floor proposed for any piece is the size of the phone's cursor drop, the smallest thing the site draws from this matter.
- The hero scroll makes the blob cling to a box around the whole name. In frame 1 the two words stand in opposite corners, so that box is nearly the whole screen. The scenario proposes the blob stays put and the letters drink from the nearest ones outwards; nobody has seen that.
- The stills draw the blob smaller than production does, and on phones above the middle of the screen; the scroll choreography assumes the production size and the centre.
- Odds given to him: pieces, return and gulp likely; tongue and tear about even on a first round; phone unknown until it runs on his iPhone. Stop rule offered: after two of his reviews without the tongue reading as liquid, name the limit instead of a third round.

In the code: scenario in `docs/design/2026-11-16-hero-kadr-1-scenariusz-ruchu.md` (technical appendix at the end); edge width is `aa` (0.04 of half the viewport height) in `src/components/canvas/viscous-puddle/shaders.ts`; drop size in `ballMetrics`, cling target in `heroFrame` (`src/components/canvas/viscous-puddle/choreography.ts`); still sizes in `MATTER` in `src/components/sections/hero-frame.tsx`; `touch-pan-y` was already used in `src/components/sections/hero-sample.tsx`.
