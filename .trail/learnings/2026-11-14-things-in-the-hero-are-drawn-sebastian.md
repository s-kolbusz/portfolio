---
title: "Things in the hero are drawn taken apart into labelled parts, not as pictograms"
author: Sebastian
date: 2026-11-14
branch: redesign/decyzje
cost: { minutes: 12, tokens: 97634 }
id: l-8fea0122
scope: repo
status: active
src: agent
touches:
  - docs/design/2026-11-14-otwarcie-diagnoza-telefon.md
  - "src/app/[locale]/design/hero/[variant]/page.tsx"
  - src/components/canvas/hero-samples/assembly-shader.ts
  - src/components/canvas/hero-samples/variants.ts
  - src/components/sections/hero-assembly.tsx
  - src/components/sections/hero-sample.tsx
  - docs/design/2026-11-14-jak-pracuje-z-agentami-szkic.md
---

## Decided
After seeing the first three hero samples on 2026-11-14 the owner chose to combine two of them: the matter splits into drops, each drop sets into one labelled part of a thing he makes, the parts melt and the matter takes the next thing apart somewhere else. A thing is an exploded drawing of its parts, never a single icon.

## Tried and ruled out
Single-shape pictograms (browser window, crop frame, editor, nut, dashboard): he called them boring, simple and AI-made. The "pages under water" story was dropped. Casting shapes from his real screenshots and photos, and plain silhouettes without drawing, were offered and not picked.

## Watch out
He also asked for controlled chaos: never the same place twice, organic mutation, text that answers changes of form, and a real relationship between the main blob, the small blob and set matter. Whether the combined sample meets that is not confirmed yet; it has not been seen on a real iPhone.

In the code: src/components/sections/hero-assembly.tsx, src/components/canvas/hero-samples/assembly-shader.ts, route /design/hero/zlozenie.
