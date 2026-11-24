---
title: Price list cards stay plain rectangles; meaning comes from what grows around them and in what order
author: Sebastian
date: 2026-11-24
branch: redesign/decyzje
cost: { minutes: 1, tokens: 1954 }
id: l-23864420
scope: repo
status: active
src: agent
---

## Decided
- Both price cards (for you / with you) are plain, solid rectangles of one family. At these prices (app from 30 000 zł) the card must read as finished and premium.
- The meaning lives in the surroundings, told by the order elements appear in. Left ("I build it for you"): empty paper, the card lands first, then a tile grid grows out from it. Right ("I work with you"): the tile grid already stands, and the card slots into its gap a beat later. The gap must not stay empty for long.
- When stronypodhale.pl is revealed under the lifting sheet, our two cards stay large with readable prices. stronypodhale.pl is a smaller band below them, an add-on to our offer, never the main act.

## Tried and ruled out
- Abstract background lines (a loop, "many routes, one goal"). The owner said they read as random strokes or "jellyfish hair".
- An odd card silhouette: a tag/shield shape, trimmings, a card assembled from cut pieces with a slanted top and tapered side. Rejected because the shape "looks unfinished" and does not say a 30 000 zł custom app. The mistake was treating "different card shape" as a fixed premise for three rounds while only polishing its execution.
- Squeezing both cards into small tiles at the lift. It handed all the attention to stronypodhale.pl.

## Watch out
- On tablets the cards fold during the lift. The tile structures are rebuilt around the folded cards, otherwise a large empty stretch of paper appears above them.
- Sub-lines and fact pairs are placeholder copy until they go through Codex.

In the code: website/src/components/sections/how-i-work-end.tsx, website/src/components/sections/how-i-work-end-ground.ts (2D canvas tiles), website/src/components/sections/how-i-work-end.css. S.steps for group 2 were moved earlier (0.76 / 1.02 / 1.16 / 1.30), and S.written is pinned at 1.64 so the lift timing and website/src/components/ui/site-nav/stops.ts stay unchanged. Mock and stills: website/cook/akt4/close-bg/ (rounds r5–r14 in out/).
