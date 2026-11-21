---
title: "The ready2order steps are a path of four named, tappable stretches, and the receipt from the till prints the result"
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 7, tokens: 62132 }
id: l-d0118aed
scope: repo
status: active
src: agent
touches:
  - cook/akt3/r2o-szkic/lewa.html
  - src/components/sections/ready2order-scene.tsx
---

## Decided
- On 2026-11-18 the owner asked for the left column without template-like lists, steps you can click and not only scroll to, the ready2order description kept in place, and a creative use of the space under the steps. The steps are now four stretches that fill with the scroll. Each one is a button with its name always showing. Under them sits the step it is on, and a till receipt that prints line by line and ends with "JS at start −50%". ready2order makes tills, so the receipt is its own artefact.
- The logo comes from ready2order's press kit (ready2order.com/at/presse/downloads, Google Drive). The owner decided that press-marked material can be used without asking them. It is recoloured for ink: the wordmark in paper, the mark kept in their blue.

## Tried and ruled out
- A tick scale like the site bar's. The owner found it too close to a map scale, and a scale whose labels show on hover does not work on touch screens (seen in the menu on a landscape tablet).

## Watch out
- Nothing in the steps may depend on hover. Names always show, and every target is at least 44 px tall.
- On a phone the column sits under the map, and from step 3 under the shelf of split-off screens (the top moves with a transition).

In the code: src/components/sections/ready2order-scene.tsx (T.hold, the click handler using the Lenis scroll store, line()/receipt, data-print/data-on), ready2order-scene.css (.r2o-path, .r2o-step, .r2o-receipt), public/images/r2o/ready2order-logo-on-ink.webp.
