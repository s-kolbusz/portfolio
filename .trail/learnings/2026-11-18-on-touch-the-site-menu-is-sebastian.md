---
title: "On touch the site menu is a list of every part by name, not the ruler"
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 14, tokens: 165340 }
id: l-d96dd17f
scope: repo
status: active
src: agent
touches:
  - src/components/ui/site-nav/site-nav.css
  - src/components/ui/site-nav/site-nav.tsx
  - src/i18n/messages/en.json
  - src/i18n/messages/pl.json
  - "src/app/[locale]/page.tsx"
  - src/components/canvas/liquid-hero/drops-stage.ts
  - src/components/sections/how-i-work.css
  - src/components/sections/how-i-work.tsx
---

## Decided
On 2026-11-18 the owner approved: with no hover (phones and tablets) the menu's scale becomes a vertical list of all nine parts, each with number and name, and the travelled line ends in a crossbar at the current part (tablets also write "here"). The desktop ruler showed names only on hover, so on an iPad you could not tell where a tick leads (reported twice). Phones drop the Elsewhere row; the big word and sentence are hidden on touch.
On desktop the big word is capped to fit the page width (it overflowed with aspect-preview even on ultrawide) and the ruler name sits under its number.

## Watch out
The list's height counts rows (9 × --row); adding a stop means changing that count in the touch block. The big word's fit uses --len (label length) × 0.8 em, measured for Mattone Black.

In the code: src/components/ui/site-nav/site-nav.css (blocks "(max-width: 700px), (hover: none)" and "(hover: none) and (min-width: 701px)"), site-nav.tsx (.ruler__mark, --len on the word).
