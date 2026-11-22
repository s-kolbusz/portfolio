---
title: Desktop menu as one big sentence of part names was rejected
author: Sebastian
date: 2026-11-22
branch: redesign/decyzje
cost: { minutes: 1, tokens: 2142 }
id: l-3d67d080
scope: repo
status: active
src: agent
touches:
  - src/components/ui/site-nav/site-nav.css
  - src/components/ui/site-nav/site-nav.tsx
---

## Tried and ruled out
On 2026-11-22 the owner rejected a frame of the desktop menu as one large run-on sentence: all part names in the hero typeface, separated by slashes, wrapping across the full width. Names already read were in ink, the current one underlined, the rest faded. His verdict was "not this direction". This came after he also rejected the names hanging from the ruler (hard to read), callout lines from evenly spaced names to the ticks (noisier), and the plain list on desktop (empty, boring, no character).

## Watch out
Four desktop menu directions in one day did not land. Before another round, ask the owner which menu among his reference sites he likes, or get several genuinely different frames from a fresh designer, instead of iterating on these.

In the code: src/components/ui/site-nav/site-nav.css (desktop block after the list block) and src/components/ui/site-nav/site-nav.tsx. Rejected frames are in docs/design/exploration/menu-desktop (zdanie-*, lista-*, kadr-*).
