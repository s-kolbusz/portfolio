---
title: "Act 4's finale is only the four heavy lines around a drop that moves only when pushed"
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 3, tokens: 46294 }
id: l-8612cf59
scope: repo
status: active
replaces: l-af0f5711
src: agent
touches:
  - src/components/ui/site-nav/site-nav.css
  - src/components/ui/site-nav/site-nav.tsx
  - src/i18n/messages/en.json
  - src/i18n/messages/pl.json
  - src/components/sections/how-i-work-finale.tsx
---

## Decided
On 2026-11-18 the owner called the first finale test, all the act's text including paragraphs written for SEO flowing around a drifting drop, "a tragedy". It lost the weight of the four lines, and a wall of constantly moving text could not be read. The finale is now only the four lines, set big in Mattone 700 with an empty row between them. The drop stands still and the text moves only when a visitor pushes it. The longer SEO paragraphs go to scenes 1–3, each beside its own line. The full stronypodhale.pl sentence stays.

## Tried and ruled out
- The drop drifting on its own, and text reflowing at the liquid's slightest quiver.
- Justified lines.
- A line jumping across the drop and reading as a zigzag.

## Watch out
The text wraps to an extent that changes only when the liquid moves more than 0.6em. Each row has one slot, on the wider side of the drop. On phones a slot must hold about six ems, and the drop sits at the right edge. The words stay real DOM text, and selection freezes the layout.

In the code: src/components/sections/how-i-work-finale.tsx (measure, sense, slotsOf, home).
