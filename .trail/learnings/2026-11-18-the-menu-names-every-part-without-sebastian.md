---
title: "The menu names every part without numbers: on desktop the names hang from the scale's ticks"
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 19, tokens: 142284 }
id: l-b9d10c14
scope: repo
status: active
src: agent
touches:
  - "src/app/[locale]/page.tsx"
  - src/components/canvas/liquid-hero/drops-stage.ts
  - src/components/sections/how-i-work-finale.css
  - src/components/sections/how-i-work-finale.tsx
  - src/i18n/messages/en.json
  - src/i18n/messages/pl.json
  - src/components/canvas/liquid-hero/drops.worker.ts
  - src/components/canvas/liquid-hero/physics.worker.ts
---

## Decided
On 2026-11-18 the owner asked to drop the part numbers (01–09) from the site menu everywhere and wanted something more creative than numbers for desktop. On desktop each part's name now hangs from its tick on the ruler, written top to bottom like the marks on a measuring tape, so every part is named at once without hover. The current part is ink and bold, the rest are lighter. On touch screens the list shows the names alone; the thick line ending in a crossbar marks where you are (tablets keep "← here").

## Tried and ruled out
- Initials or abbreviations: two parts start with A (aspect-preview, About) and two with C (calculator shown as 3D Print, Contact), so first letters are ambiguous.
- Icons: pictograms drawn in code have looked weak on this site before.
- The part's length ("1.5 screens") next to the hanging name: the owner said it makes no sense among the section names. Removed, together with the `nav.screens` message; the spacing of the ticks already shows length.

## Watch out
- On 720–800 px tall screens the longest hanging name (stronypodhale.pl) reached the footer, so below 820 px height the ruler sits at 57vh instead of 64vh.
- In the touch list, a rule for the current row (`.ruler__stop[data-active] .ruler__name`) beats a plain `.ruler__name` size; the tablet size rule must list both or the current name renders at phone size × width (huge in iPad landscape).

In the code: website/src/components/ui/site-nav/site-nav.css (.ruler__name with writing-mode: vertical-rl), site-nav.tsx (ruler__no and ruler__len spans removed).
