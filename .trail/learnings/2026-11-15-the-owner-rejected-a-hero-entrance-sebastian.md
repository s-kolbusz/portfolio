---
title: The owner rejected a hero entrance where the name and text stand still while only the blob moves; everything on the screen must arrive in one choreography
author: Sebastian
date: 2026-11-15
branch: redesign/decyzje
cost: { minutes: 7, tokens: 48472 }
id: l-a4c85b72
scope: repo
status: active
src: agent
touches:
  - docs/design/2026-11-14-otwarcie-diagnoza-telefon.md
  - docs/design/2026-11-16-hero-kadr-1-scenariusz-ruchu.md
  - docs/design/README.md
---

## Decided
On 2026-11-15 the owner read the motion scenario for hero frame 1 and rejected its entrance outright: the name and the text block standing from first paint while the blob arrives and assembles. His words: mixing stillness with creative animation is a bad idea, and this was the least creative and most boring entrance of all the ones tried, nowhere near award level. The other steps (rest, pull, return, exit) "seem sensible", with one demand: the interactions must convey the essence of what is happening, not be a random sample of skill or an effect that means nothing. He also said his trust is low after the failed sessions.

## Tried and ruled out
- A standing name and text as the frame, with only the matter moving: chosen by the agent so the page would appear fast and the blob would not look late. It traded away what he had already asked for: one choreography in which the name is part of the whole with the blob.
- Interaction rules that come from physics alone (how thick a tongue is, how long a piece hangs, how the body recoils): he reads them as showing off. Each rule has to be traceable to one of the three lines.

## Watch out
- Loading speed is not a reason to make part of the hero static. Solve it inside the choreography or raise it with him.
- He named two entrance ideas of his own earlier: a huge blob that falls, splashes and runs back together (never tried), and drops from beyond the frame that form the blob and the letters. Start from those before inventing a new one.

In the code: the rejected entrance is step 1 in `docs/design/2026-11-16-hero-kadr-1-scenariusz-ruchu.md`; his earlier wishes for the entrance are in `docs/design/2026-11-14-otwarcie-diagnoza-telefon.md`, section 5, "Wejście z choreografią ciążenia".
