---
title: "Codex's first draft of a personal story pads it with inferred sentences; one correction round naming each sentence removes them"
author: Sebastian
date: 2026-11-15
branch: redesign/decyzje
cost: { minutes: 4, tokens: 125842 }
id: l-f9496b22
scope: repo
status: active
src: agent
touches:
  - docs/design/2026-11-15-drogi-drukarka-dom-szkic.md
  - docs/design/README.md
---

## Decided
On 2026-11-15 the first stories for the personal part of the site (3D printer, house) were written by ChatGPT through Codex from a brief of fixed facts. The first draft kept every fact but added sentences that were not in them: guessed motives ("the rebuild is behind me"), restating the order of steps that the list already showed, and a reworded owner quote ("I enjoyed going through the stages" for his "mega mi się podobało" about the whole thing). One correction round that quoted each bad sentence and said why fixed it without touching the rest.

## Tried and ruled out
Fixing the wording myself: the owner's rule is that Codex's Polish is taken verbatim, so faults go back to Codex as a list, never rewritten by Claude.

## Watch out
After the padding is removed the stories come out around 100-115 words, under the 120-200 asked for. Do not ask Codex to pad them back. Facts Claude added to the brief (for example "photovoltaic" panels, the house state "działa") must be listed for the owner to confirm.

In the code: brief for both rounds and the confirmation list are in docs/design/2026-11-15-drogi-drukarka-dom-szkic.md; command: codex exec -m gpt-6.1-sol -c model_reasoning_effort="medium" -s read-only --skip-git-repo-check "<brief>" < /dev/null
