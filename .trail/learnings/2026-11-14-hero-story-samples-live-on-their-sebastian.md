---
title: "Hero story samples live on their own route with their own shader, not inside the production opening"
author: Sebastian
date: 2026-11-14
branch: redesign/decyzje
cost: { minutes: 15, tokens: 164669 }
id: l-5040e745
scope: repo
status: active
src: agent
touches:
  - docs/design/2026-11-14-otwarcie-diagnoza-telefon.md
  - "src/app/[locale]/design/hero/[variant]/page.tsx"
  - src/components/canvas/hero-samples/shader.ts
  - src/components/canvas/hero-samples/variants.ts
  - src/components/sections/hero-sample.tsx
  - docs/design/2026-11-14-jak-pracuje-z-agentami-szkic.md
  - src/components/canvas/viscous-puddle.tsx
  - src/components/canvas/viscous-puddle/shaders.ts
  - src/components/canvas/viscous-puddle/choreography.ts
---

## Decided
The three hero story samples (matter tries on shapes, pages under the water, matter split into labelled parts) were built as a separate noindex route with a standalone canvas and shader, so the owner can choose a story without the production hero, signature scene or desktop home page changing. The chosen story gets wired into the scroll afterwards; the other two get deleted.

## Tried and ruled out
Switching the variant with a query parameter on the home page: reading it on the server would make the statically generated home page dynamic, and reading it on the client would flash the cream page before the green sheet. A static route per variant lets the sheet be server-rendered, so the page starts as matter before any script runs.
Extending the production choreography for the samples: it is a pure function of scroll tied to the measured name and the signature stage, and the samples play in time before any scroll.

## Watch out
A constant exported from a 'use client' file is a client reference on the server: calling .map on it in generateStaticParams fails the build ("map is not a function"). The variant list therefore sits in a plain shared module.
While the sheet covers the frame the matter must be one flat colour (no depth shading, no sheen), otherwise letters and patches show through as ghosts. Letters are hidden under the sheet and switch on in the matter's green as its edge passes, then dry to ink.
Not verified on a real iPhone: the SVG displacement filter on the letters and frame rate at DPR 2.

In the code: src/app/[locale]/design/hero/[variant]/page.tsx, src/components/sections/hero-sample.tsx, src/components/canvas/hero-samples/ (shader.ts, variants.ts).
