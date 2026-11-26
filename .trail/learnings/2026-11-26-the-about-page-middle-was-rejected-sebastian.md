---
title: "The About page middle was rejected as AI slop: a documentation grid with labels over every block and the same block repeated per path"
author: Sebastian
date: 2026-11-26
branch: redesign/decyzje
cost: { minutes: 7, tokens: 105242 }
id: l-02f9ca0a
scope: repo
status: active
src: agent
touches:
  - src/lib/calculate-print.ts
---

## Decided
On 2026-11-26 the owner rejected the first frame of the middle of the "Kim jestem" (About) page: "too much visible AI slop". The principles behind it stay accepted (definition with its path as proof, the drop shows the path's state, real photos as evidence, steps revealed in order, the print calculator as the one interaction). The execution failed.
Proposed next direction, not yet chosen: tell each path in the language of its own thing, the way ready2order tells its story with a receipt and a bundle map (home through his own energy data, the printer page building layer by layer with the calculator as part of the print, cars as a short VCDS-style readout). No labels, cards or repeated blocks; definitions stand alone and large.

## Tried and ruled out
A two-column documentation grid: a small mono eyebrow over every block ("DROGA 01", "DEFINICJA", "CO ZOSTAŁO"), the same block layout for every path, numbered step lists with hairline rules and green numerals, a dark calculator card with input boxes, a sentence explaining the design, and three link cards with a top rule and an arrow. The owner had already banned eyebrow labels over text on 2026-11-17.

## Watch out
Placing real material into a neat grid reads as a template to him even when every fact is right. Give each path its own form from its own material before drawing.

In the code: nothing built. Rejected frame (kim2.html, kim-srodek-1600.jpg, kim-srodek-390.jpg) is outside the repo in the session notes folder, podfolder podstrona-kadr. Future page lives under src/app/v2/[locale]/ and reuses the price data in src/lib/calculate-print.ts.
