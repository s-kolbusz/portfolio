---
title: "Many unequal drops condensing into one shape is the hero's mechanism, and the liquid must feel dense"
author: Sebastian
date: 2026-11-15
branch: redesign/decyzje
cost: { minutes: 5, tokens: 36466 }
id: l-9003817d
scope: repo
status: active
src: agent
touches:
  - docs/design/2026-11-14-otwarcie-diagnoza-telefon.md
  - "src/app/[locale]/design/hero/[variant]/page.tsx"
  - src/components/sections/hero-assembly.tsx
  - src/components/canvas/hero-samples/matter-story.ts
---

## Decided
On 2026-11-15 the owner liked an accidental effect: several blobs of different sizes running together and condensing into one final shape. It is now deliberate. On load the matter is scattered over the frame as 13 drops of unequal size that set off one after another and merge into the blob (the full green sheet on load is gone). Larger parts of a drawing arrive as two or three unequal drops, so a thing condenses out of a dozen drops, and returns to the blob the same way.

## Tried and ruled out
Loose springs and a wide soft edge: he read the blob as "balls of smoke, not liquid". Stiffer springs, more damping, a narrower soft edge and less field blur make it dense without changing its flat pastel look. A layout capped at 1440 px wide with rem-sized type: tiny and lost on an ultrawide 1440p screen.

## Watch out
Scale the hero with viewport height as well as width (svh in max-width, type and button sizes), and check 3440x1440 along with phone and desktop. He wants samples and questions when unsure, not half a day of unrequested work.

In the code: src/components/canvas/hero-samples/matter-story.ts (BIRTH_DROPS, the chunks in assign), matter-renderer.ts (soft, textureLod level), src/components/sections/hero-assembly.tsx.
