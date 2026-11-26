---
title: "Outlined Mattone letters show internal lines, so trace an outline from the filled shape"
author: Sebastian
date: 2026-11-19
branch: redesign/decyzje
cost: { minutes: 1, tokens: 1232 }
id: l-5b1b78d6
scope: repo
status: active
src: agent
---

## Tried and ruled out
Act 4 test: liquid fills huge hollow words (reference buzzworthystudio.com). I drew the outline with canvas strokeText in Mattone 900. The owner called the result "tragic". A and M are built from overlapping contours, so strokeText draws every piece and you see construction lines inside the letters (the A's crossbar, the M's diagonals). On top of that, the particle liquid sat in the letters as separate stumps, a hairline outline next to thick glossy liquid read like a coloring book, and the liquid bled past the outline at the bottom.

## Watch out
Never outline a font with strokeText when the font has overlapping contours. Fill the glyph into a mask and trace the edge of that mask (or of the SDF built from it).

In the code: src/components/sections/act4-frames.tsx (Act4Fill, k=6 on /design/akt4), vessel in drops-stage.ts / drops.worker.ts.
