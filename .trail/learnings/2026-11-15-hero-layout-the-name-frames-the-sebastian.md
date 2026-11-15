---
title: "Hero layout: the name frames the object; the owner's priority is UI rules, not the matter"
author: Sebastian
date: 2026-11-15
branch: redesign/decyzje
cost: { minutes: 4, tokens: 33027 }
id: l-5771a86f
scope: repo
status: active
src: agent
touches:
  - docs/design/2026-11-14-otwarcie-diagnoza-telefon.md
  - src/components/canvas/hero-samples/matter-renderer.ts
  - src/components/canvas/hero-samples/matter-story.ts
  - src/components/canvas/hero-samples/things.ts
  - src/components/sections/hero-assembly.tsx
---

## Decided
On 2026-11-15 the owner chose the hero skeleton "the name frames the object": first word of the name above the object, second word below it and right-aligned, the object the only thing that changes. Under it one block on one edge: a rule, role left and the current thing's caption right, the sentence, the existing call-to-action as a button. He repeated that layout, hierarchy and UI rules are the main problem and that the matter must be left alone.

## Tried and ruled out
"Who, what, proof, action" top to bottom, and "the sentence leads" with the name as a small signature: shown as wireframes, not picked. Spending rounds on the matter engine and its shading while he was asking for layout: wasted his time and tokens.

## Watch out
When he names a problem area, work only there and show a wireframe choice before building. Do not run critic loops that can pull the work away from what he asked for.

In the code: src/components/sections/hero-assembly.tsx (layout only; matter-story.ts and matter-renderer.ts untouched by this change).
