---
title: "The display serif is to be replaced, and hero work is judged on composition first"
author: Sebastian
date: 2026-11-14
branch: redesign/decyzje
cost: { minutes: 1, tokens: 13494 }
id: l-faf8df80
scope: repo
status: active
src: agent
touches:
  - docs/design/2026-11-14-otwarcie-diagnoza-telefon.md
---

## Decided
On 2026-11-15 the owner decided the display serif (Fraunces) does not fit the site being built and is to be replaced; the sans and the mono stay. This lifts the earlier rule not to touch typography, for the display face only. Candidates to show live on his name: the existing sans in a heavy weight, Bricolage Grotesque, Instrument Serif. No choice made yet.

## Tried and ruled out
Answering his critique of the hero with motion and shader causes only: he called out that composition was ignored. The samples had inverted hierarchy (the name as signature was the heaviest thing), one statement split across two corners, no grid, a caption belonging to nothing, and four type styles on one screen.

## Watch out
When he criticises a screen, address hierarchy, grouping, layout and what the screen says before effects. Only the matter may be irregular; text and captions sit on one grid in fixed places.

In the code: docs/design/2026-11-14-otwarcie-diagnoza-telefon.md section 5, font setup in src/app/[locale]/layout.tsx.
