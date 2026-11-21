---
title: Liquid poured into huge hollow letters was dropped for act 4
author: Sebastian
date: 2026-11-20
branch: redesign/decyzje
cost: { minutes: 1, tokens: 2120 }
id: l-2c0b2f24
scope: repo
status: active
replaces: l-5b1b78d6
src: agent
---

## Decided
The owner dropped the act 4 direction where liquid fills huge hollow words, one word per statement (reference buzzworthystudio.com). It looked bad, and it can't run smoothly on an iPad or iPhone 11.

## Tried and ruled out
Test word "SAM" in Mattone 900. The particle liquid was held in the letters by a signed distance field of the letter mask and fell under gravity. It ran at 72–79 fps on desktop with about 5,400 particles. The owner called the letters "tragic":
- the outline was drawn with strokeText, and Mattone's A and M are built from overlapping contours, so construction lines showed inside the letters;
- the liquid sat in the letters as separate stumps;
- a hairline outline next to thick glossy liquid read like a coloring book;
- the liquid bled past the outline at the bottom.
On mobile it's a dead end. The same engine already struggles on an iPad (ready2order: about 84 ms per physics step), and lighter physics means fewer, coarser particles, which makes the stumps worse.

## Watch out
Never outline a font that has overlapping contours with strokeText: fill the glyph into a mask and trace the mask's edge.
Act 4 test code that ready2order also loads must not go into the shared liquid files: half-saved edits broke ready2order on the owner's iPad.

In the code: the test lived in act4-frames.tsx (Act4Fill) on a lab route /design/akt4 and as a `vessel` option in drops-stage.ts / drops.worker.ts. All of it was removed, not committed.
