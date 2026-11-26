---
title: "Act 4 has two parts in the menu, How I work and Prices, and the touch list scrolls when it doesn't fit above the footer"
author: Sebastian
date: 2026-11-22
branch: redesign/decyzje
cost: { minutes: 10, tokens: 119712 }
id: l-8366311b
scope: repo
status: active
src: agent
---

## Decided
On 2026-11-22 act 4 got its own places in the site menu. Before that, everything after ready2order (the line, the off-the-shelf page, piczura.com and the price list) was counted as ready2order. "How I work" starts at the first act 4 scene and covers screens 1–3. "Prices" starts at the close with the price list. Labels and the one-line descriptions are factual EN placeholders, with the same text in the PL keys, until the copy goes through Codex.

## Watch out
- With 11 parts the touch list (48 px rows) is 528 px tall and runs into the footer on short phones (iPhone Safari with toolbars, about 390×664). Rows stay at 48 px for touch targets. The list stops above the footer, scrolls inside, opens with the current part in view, and hides its scrollbar. The menu still blocks wheel and touch everywhere else.
- A part whose section is missing from the page used to get its start set to the end of the page. That swallowed every later part into the one before it. A missing section now starts where the next one does, so it has zero length.
- The list height is no longer a hard-coded 9 rows. It reads the number of parts from stops.ts (--stops).

In the code: website/src/components/ui/site-nav/stops.ts (how-i-work, prices); site-nav.tsx (--stops, --route-room measured on open, wheel/touch let through inside an overflowing list); site-nav.css (touch .site-menu__route max-height/overflow). The close's root needs id="prices" (how-i-work-end.tsx); the act 4 relay section carries id="how-i-work".
