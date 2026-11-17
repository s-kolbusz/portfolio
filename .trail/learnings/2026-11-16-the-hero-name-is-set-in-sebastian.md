---
title: The hero name is set in Mattone Black from Collletttivo; Bricolage Grotesque was rejected again as AI slop
author: Sebastian
date: 2026-11-16
branch: redesign/decyzje
cost: { minutes: 23, tokens: 211666 }
id: l-7714c245
scope: repo
status: active
src: agent
touches:
  - cook/ciecz-na-wprost/index.html
  - cook/ciecz-na-wprost/shots.mjs
---

## Decided
On 2026-11-16 the owner approved Mattone Black (Collletttivo, SIL OFL, Polish letters confirmed in the foundry's glyph map) for "Sebastian Kolbusz" in the hero. He had asked for a heavy, non-serif face that fits the liquid idea instead of an elegant serif stuck on top. Mattone is wide with round, full bowls, which sits well next to the liquid.

## Tried and ruled out
- Bona Nova (serif): does not fit, too elegant, looks pasted on.
- Bricolage Grotesque 800: rejected at once as standard AI slop, the second time. An earlier learning already said so and was not checked before choosing.

## Watch out
- Check the typeface learnings before proposing any font.
- Mattone is wide: at the old size "Kolbusz" runs into the text block, so the name is sized to fit the space beside the block.
- The foundry's site serves its specimen fonts behind a 403. The Download button opens the official GitHub repo, collletttivo/mattone, which has woff2/otf/ttf and LICENSE.txt.

In the code: cook/fonts/mattone (woff2 files, LICENSE.txt, mattone-black.css with the font embedded as base64 so file:// pages can load it); the test still is cook/ciecz-srodek/index.html.
