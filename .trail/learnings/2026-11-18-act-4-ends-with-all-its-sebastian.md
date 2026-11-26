---
title: Act 4 ends with all its text flowing around one live drop; the fixed-price sentence stays whole
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 6, tokens: 96290 }
id: l-af0f5711
scope: repo
status: active
src: agent
touches:
  - "src/app/[locale]/page.tsx"
  - src/components/canvas/liquid-hero/drops-stage.ts
  - src/components/sections/how-i-work-finale.css
  - src/components/sections/how-i-work-finale.tsx
  - src/i18n/messages/en.json
  - src/i18n/messages/pl.json
  - src/components/canvas/liquid-hero/drops.worker.ts
  - src/components/canvas/liquid-hero/physics.worker.ts
  - src/components/ui/site-nav/site-nav.css
  - src/components/ui/site-nav/site-nav.tsx
---

## Decided
On 2026-11-18 the owner approved the concept for act 4, where the liquid works on the text, and asked for more text (for SEO and language models) and a creative finale that gathers everything. The finale sets all four lines plus a paragraph under each as one text that wraps around a single live drop and rewraps every frame. The sentence "Need a proven website at a fixed price? That's what stronypodhale.pl is for." stays whole. Only a bare "fixed price" label was ruled out: without the rest of the sentence it reads like something kolbusz.xyz sells.

## Tried and ruled out
- Filling every free gap on a row: text ran into holes and gaps inside the liquid, and the reading order broke. Each row now has at most two slots, left and right of everything the liquid covers on it.
- A fixed font size: the text sat small at the top with the drop below it. The size is now the largest at which the text fills the stage around the drop.
- Justifying every line: lines next to the drop got huge word gaps. A line justifies only if the gap stays under 0.45em, otherwise it stays ragged.

## Watch out
- The words must stay real text inside the paragraphs (one span per line, with a trailing space), so search engines, language models and selection read normal paragraphs.
- The layout holds still while text in it is selected; the owner wants text selection to always come first.
- The paragraph copy is a placeholder until it goes through Codex.

In the code: src/components/sections/how-i-work-finale.tsx (measure / slotsOf / layout); drops-stage.ts `shape` callback gives the particles in CSS px each frame; copy keys howIWork.more.* in en.json and pl.json.
