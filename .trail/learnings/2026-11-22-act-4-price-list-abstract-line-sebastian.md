---
title: "Act 4 price list: abstract line backgrounds described in words did not survive being drawn in code"
author: Sebastian
date: 2026-11-22
branch: redesign/decyzje
cost: { minutes: 1, tokens: 16640 }
id: l-c3bee0d3
scope: repo
status: active
src: agent
---

## Decided
On 2026-11-22 the owner rejected the "Current" background for the act 4 close (src/components/sections/how-i-work-end.tsx): one ink stream field plus green lines meaning "for you" / "with you". His words: "it has nothing to do with what you described so beautifully". The background direction is paused until he names a concrete reference to follow, or decides on no background.

## Tried and ruled out
- A board of 17 studio pricing/offer sections: "nothing here looks good". Top studios do not publish prices, and those that do use template cards.
- Fable's "Current" concept rendered as a mock: the ink field reads as contour lines again (closed lobes), and two single green lines carry no meaning a visitor can read without a caption.

## Watch out
Do not sell a visual in words before a rough still exists. The owner judges the picture against the description, and the gap reads as deception. The meaning he gives the two groups: "for someone, on their project" is freer, only a goal, the path is mine (app, creative site); "with someone, in a project" is fitting into their path (consulting, contract). One brief had this backwards.

In the code: mock and stills in cook/akt4/nurt/ (mock.html, field.js, shots.mjs); board in cook/akt4/pricing-board/.
