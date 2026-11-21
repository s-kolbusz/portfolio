---
title: "Act 4 \"How I work\" can't be text with a decorative drop; the liquid has to be the content and react to the visitor"
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 11, tokens: 48271 }
id: l-e8fd1fce
scope: repo
status: active
src: agent
touches:
  - "src/app/[locale]/page.tsx"
  - src/components/canvas/liquid-hero/drops-stage.ts
  - src/components/sections/how-i-work.css
  - src/components/sections/how-i-work.tsx
  - src/i18n/messages/en.json
  - src/i18n/messages/pl.json
---

## Decided
On 2026-11-18 the owner rejected the first act 4. It was four approved lines read one at a time on a sticky stage, with a small drop of the hero's liquid beside the line being read. Their words: artificial, especially how the small drop moves; practically only text, "it has no right to exist". The bar is the top of the page: creative, interactive, surprising, a level above Awwwards sites.
The proposed replacement: one body of liquid that the visitor acts on, with each line coming out of what they did. Four drops (design, code, server, maintenance) gathered by the cursor; the liquid pushing a website template apart; the visitor's rough drawing smoothed by the liquid; the liquid filling a fixed frame to the brim, turning into the stronypodhale.pl sheet. Scene 3, the drawing, is to be tested first.

## Tried and ruled out
A drop steered by a spring to fixed points beside each line. It moves like a lift on rails, because nothing in the scene gives it a reason to move. Tuning size, speed or placement doesn't fix that.

## Watch out
Liquid that only accompanies text reads as decoration. Motion has to come from the visitor's pointer or touch and from shapes the liquid meets, not from targets on rails.

In the code: commit 6126c2a6 (website/src/components/sections/how-i-work.tsx) holds the rejected version. The drops stage's `paper` mode and its visibility fix stay useful.
