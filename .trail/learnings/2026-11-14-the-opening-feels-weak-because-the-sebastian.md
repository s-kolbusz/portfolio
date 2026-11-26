---
title: "The opening feels weak because the hero itself is boring, not because of the phone or the first transition"
author: Sebastian
date: 2026-11-14
branch: redesign/decyzje
cost: { minutes: 10, tokens: 66433 }
id: l-68dd4674
scope: repo
status: active
src: agent
touches:
  - docs/design/2026-11-14-otwarcie-diagnoza-telefon.md
  - docs/design/2026-11-14-historia-strony-koncept.md
  - src/components/sections/hero.tsx
---

## Decided
On 2026-11-14 the owner answered the plan A/B/C questions for the opening. A portrait screenshot of stronypodhale on phones is fine. Plan B (touch scroll stops on the finished frame) is a conditional yes, judged later on his own iPhone (Safari).

## Tried and ruled out
Plan A as written in the diagnosis (the screenshot surfaces edge to edge on phones) was not accepted: he does not want the portfolio replaced by a view of another site. The project should be presented creatively, and the emergence should have irregular, wavy, distorted edges, as on Lusion.
The whole phone diagnosis aimed beside the point. He rejected "screenshot too small / too fast / stutters" entirely. His complaint is the moment of loading and the hero: how name, blob and text appear, how they look and how they are laid out are all boring. The transition is "as creative as it can be with such a boring hero".

## Watch out
Do not treat device, browser or the hero-to-scene transition as the problem to solve first. The next step is 2-3 concrete direction candidates for the hero, for him to correct, before any code. His earlier limits still hold: do not reduce motion or replace the blob, colours or typography.

In the code: docs/design/2026-11-14-otwarcie-diagnoza-telefon.md section 5, docs/design/2026-11-14-historia-strony-koncept.md sections 0 and 12, src/components/sections/hero.tsx.
