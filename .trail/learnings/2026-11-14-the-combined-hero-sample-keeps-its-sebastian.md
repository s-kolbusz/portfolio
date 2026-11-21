---
title: The combined hero sample keeps its direction but its execution was rejected as a prototype
author: Sebastian
date: 2026-11-14
branch: redesign/decyzje
cost: { minutes: 1, tokens: 10292 }
id: l-a33e9bbc
scope: repo
status: active
src: agent
touches:
  - docs/design/2026-11-14-jak-pracuje-z-agentami-szkic.md
  - src/components/sections/hero-assembly.tsx
  - src/components/canvas/hero-samples/assembly-shader.ts
  - docs/design/2026-11-14-otwarcie-diagnoza-telefon.md
---

## Decided
On 2026-11-15 the owner kept the direction (matter splits into drops that become the parts of things he makes) and rejected the execution: it reads as a prototype, not a base to polish. The bar is Lusion and above.

## Tried and ruled out
Randomly turning and offsetting the finished parts: chaos belongs in the blob and the drops, the finished thing must be precise. Making the name react with a wave through the letters and a wobbling outline: "completely pointless", it had no cause in the picture. A caption per part: does not work, one caption for the whole thing at most. Rounded boxes with holes cut out as the drawings: ugly icons. Cross-fading two distance fields (circle to box) as the morph: does not behave like the blob.

## Watch out
The root cause is structural, not a matter of tuning: a phase state machine with fixed durations and ease-in-out between stops gives stitched, linear motion and jumps at the seams. The next version needs one continuous physical system (positions, velocities, springs, overlapping actions), liquid that pours into a mould and sets from the point of contact, and authored drawings in one system. Two solo passes without an outside critic both landed below the bar; get critical review against reference frames before showing him again.

In the code: src/components/sections/hero-assembly.tsx, src/components/canvas/hero-samples/assembly-shader.ts, docs/design/2026-11-14-otwarcie-diagnoza-telefon.md section 5.
