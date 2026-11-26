---
title: "English on the whole site is American spelling, and the story unit called droga is a path"
author: Sebastian
date: 2026-11-15
branch: redesign/decyzje
cost: { minutes: 12, tokens: 105004 }
id: l-8cbb6623
scope: repo
status: active
src: agent
touches:
  - docs/design/2026-11-15-how-i-work-with-agents-en.md
  - docs/design/README.md
  - src/components/canvas/hero-samples/matter-renderer.ts
  - src/components/canvas/hero-samples/matter-story.ts
  - src/i18n/messages/en.json
---

## Decided
On 2026-11-15 the owner chose two things for all English copy on the site, while approving the English text of the "How I work with agents" subpage: American spelling everywhere, and "path" as the English word for "droga" (a story that proves one of his definitions). The short decision texts are "Why" notes.

## Tried and ruled out
"Road" for "droga": literal and stiff. Following the old site's mix of "optimized" with "colour": he asked for one variant instead.

## Watch out
The older English files of the site were written before this choice and contain British forms; align them when touching them. The concept document uses only the Polish terms, so look here for the English ones.

In the code:
- `docs/design/2026-11-15-how-i-work-with-agents-en.md` (points 7 and 8 at the end)
- `src/i18n/messages/en.json` (British forms to align)
