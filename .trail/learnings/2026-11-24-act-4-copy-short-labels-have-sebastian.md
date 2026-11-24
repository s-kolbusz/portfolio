---
title: "Act 4 copy: short labels have hard widths the character limits did not catch"
author: Sebastian
date: 2026-11-24
branch: redesign/decyzje
cost: { minutes: 15, tokens: 228569 }
id: l-4774f4ed
scope: repo
status: active
src: agent
touches:
  - src/components/sections/how-i-work-relay.tsx
---

## Decided
Act 4 copy (2026-11-24) went through Codex as two calls: English review with the current text per field, then Polish from scratch with each section's English only as one run-on background paragraph. Approved sentences (relay.line, roleProofs.code, fixed, and the owner's Polish shelf and vision) were left out of both briefs.

## Watch out
- Team names under the four stage segments on a 390 px phone: a single long word cannot wrap and runs into its neighbour. "Administratorzy" collided with the next label; keep each to about 11 characters, all in one form.
- Fact labels in the price cards (letter-spaced mono caps) have a narrow column: English "LOCATION" and "WORKFLOW" touched their values at 1600. Keep labels to about 6 characters.
- Codex fell back to "na start" and "na własność" for the stronypodhale.pl price lines even when told they were calques; name them as forbidden in the brief.
- A DOM edge/clip scan reported nothing for the label collision; only the screenshot showed it.

In the code: src/i18n/messages/{en,pl}.json howIWork.relay.teams, howIWork.offer.more, howIWork.estimate.studioPrices; layout in src/components/sections/how-i-work-relay.tsx (.rl-holder) and how-i-work-end.tsx (.cl-d).
