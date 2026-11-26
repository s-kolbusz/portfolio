---
title: "The hero says how the owner works through one gesture: the visitor pulls the blob apart and it pulls itself back together; three short lines name it"
author: Sebastian
date: 2026-11-15
branch: redesign/decyzje
cost: { minutes: 4, tokens: 17473 }
id: l-c9426e47
scope: repo
status: active
src: agent
touches:
  - docs/design/2026-11-14-historia-strony-koncept.md
  - src/components/sections/hero.tsx
  - src/i18n/messages/en.json
  - src/components/canvas/viscous-puddle/shaders.ts
  - docs/design/2026-11-14-otwarcie-diagnoza-telefon.md
---

## Decided
On 2026-11-15, in a round of questions about what the hero says, the owner settled the content before any layout. The hero is one gesture: the visitor's drop pulls the blob apart into a few unequal pieces and the blob, being the heavier matter, pulls itself back into one body. The gesture stands for three things he picked about how he works: taking things apart, everything in one pair of hands, nothing assembled from kits. The text only names what the visitor just watched. English copy he approved: a small line "I design and build websites and web apps." and three big lines, one per moment of the blob: "I take things apart." / "I put them back together myself." / "Nothing off the shelf." All three lines stay visible; the current moment's line is in full ink. There is no job title in the hero ("Web Architect" goes; the title lives in metadata, the dock and the about page). It should feel personal: "it is not a product page, it is my portfolio".
## Tried and ruled out
- A list of his things with their states (works, in progress, understood and put aside) as the hero's content: he first liked "proof with play", then saw the proofs were being forced in and dropped the list. Things stay for the scenes after the scroll.
- Three traits each with its own effect: would split the hero; they are one gesture or nothing.
- "By hand." as the third line: it collides with the "How I work with agents" page, and he does not want to promise working "like a caveman" without modern tools. "No templates." was offered; he chose "Nothing off the shelf." as carrying the most meaning.
- The first Polish wording of the three lines: he said it sounded badly off and that he was missing the idea; the conversation moved to English and the idea landed. The Polish version is to be written fresh, not translated.
## Watch out
- Facts he corrected: Piczura is built and live (the concept doc still says in progress); Airchos does not belong in the hero; ready2order "not necessarily".
- Explain an idea as what the visitor does and sees, step by step, before offering copy for it. Copy options alone did not carry the idea.
- Choice dialogs worked for quick picks, but he answered the important ones in his own words, combining options. Treat the options as a starting point.

In the code: the hero is `src/components/sections/hero.tsx`; its texts are the `hero` keys in `src/i18n/messages/en.json` and `pl.json` (still "Web Architect" and the generic tagline, nothing changed yet). The production shader in `src/components/canvas/viscous-puddle/shaders.ts` draws one body and one ball, so pieces of a pulled-apart blob need more bodies in the same smooth union. Decisions are logged in `docs/design/2026-11-14-otwarcie-diagnoza-telefon.md`, section 5.
