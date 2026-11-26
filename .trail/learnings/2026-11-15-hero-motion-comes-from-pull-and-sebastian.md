---
title: "Hero motion comes from pull and weight: drops fall, the blob swallows, letters are built from matter"
author: Sebastian
date: 2026-11-15
branch: redesign/decyzje
cost: { minutes: 11, tokens: 119066 }
id: l-aa619cb0
scope: repo
status: active
src: agent
touches:
  - docs/design/2026-11-14-historia-strony-koncept.md
  - docs/design/2026-11-14-otwarcie-diagnoza-telefon.md
  - src/components/canvas/hero-samples/matter-renderer.ts
  - src/components/canvas/hero-samples/matter-story.ts
  - src/components/sections/hero-assembly.tsx
---

## Decided
On 2026-11-15 the owner asked for an organic entrance with one choreography and said the blob is the heavier matter: it attracts and absorbs. Built: drops enter from beyond the frame at their own pace; about a third build the letters of the name (drawn with the real font exactly where the text stands, set in green, then the real text takes over and the matter beads off into the blob), the rest gather into the blob. Travelling drops are pulled with a steady force, so they start slowly and arrive fast on their own arcs; they stretch, squash and trail slow drops. The blob takes a swallowed drop's momentum, recoils and rings. The name is stacked almost centred around the object, a few percent off either way; the canvas sits above the name so the blob covers the letters, and letters in its reach lean towards it.

## Tried and ruled out
Drops as round discs driven by springs along eased paths, launched one after another: read as sequential and robotic. The pointer pushing matter apart: wrong way round, the blob is the heavy one. His other idea (one huge blob falls, splashes and runs back together) was not tried.

## Watch out
Arrival is detected by distance and speed with a timeout; a drop that never slows keeps a letter missing for a second or two. The first half second is empty (font wait, drops still outside). Nothing here was checked on a real iPhone or with a pointer.

In the code: src/components/canvas/hero-samples/matter-story.ts (fly, swallow, land, release), things.ts (rasteriseParts), src/components/sections/hero-assembly.tsx (letters mask, canvas above the name).
