---
title: "The hero is one gesture named by three lines; three still frames differ in what is biggest: the name, the words or the matter"
author: Sebastian
date: 2026-11-15
branch: redesign/decyzje
cost: { minutes: 13, tokens: 202689 }
id: l-49e955a3
scope: repo
status: active
replaces: l-c9426e47
src: agent
touches:
  - docs/design/2026-11-15-drogi-drukarka-dom-szkic.md
  - docs/design/README.md
  - docs/design/2026-11-14-historia-strony-koncept.md
  - src/components/canvas/hero-samples/frame-shader.ts
  - src/components/sections/hero-frame.tsx
  - docs/design/2026-11-14-otwarcie-diagnoza-telefon.md
---

## Decided
On 2026-11-15 the owner settled what the hero says before any layout. One gesture: the visitor's drop pulls the blob apart into a few unequal pieces and the blob, the heavier matter, pulls itself back into one body. It stands for three things he picked about how he works: taking things apart, everything in one pair of hands, nothing assembled from kits. English copy he approved: a small line "I design and build websites and web apps." and three lines, one per moment: "I take things apart." / "I put them back together myself." / "Nothing off the shelf." All three stay visible, the current one in full ink. No job title in the hero. It should feel personal: "it is not a product page, it is my portfolio". Three still frames were then built for him to choose from, with no motion: the name biggest (his "name frames the object" skeleton), the words biggest (a poster, the name as a signature), the matter biggest (loose drops, drops running together, one body, top to bottom).
## Tried and ruled out
- A list of his things with their states as the hero's content: the proofs felt forced in; things stay for the scenes after the scroll.
- "By hand." as the third line: collides with the "How I work with agents" page and promises working "like a caveman". "No templates.": less meaning.
- The first Polish wording of the three lines: sounded badly off to him. Write the Polish fresh, do not translate.
- Pulled matter as a chain of plain circles joined by a smooth union: reads as stacked balls with creases. A tongue that tapers from the body to a thin tip, and a drop with a short tail, read as liquid being pulled.
## Watch out
- Small pieces of this blob go smoky: the soft edge has a fixed width (about 18 px), so a piece under roughly 60 px radius looks like a puff, not liquid. The pull-apart gesture will make such pieces; scaling the edge with size would change the blob's look and needs his consent.
- Pieces stacked on one axis read as a figure (a pawn, a bottle, a totem). Pull on a diagonal with a pinch, and do not stand the states of matter one above another.
- A faint fog appears where two bodies are almost close enough to join; keep them clearly apart or clearly overlapping.
- Facts he corrected: Piczura is built and live; Airchos does not belong in the hero; ready2order "not necessarily".
- Explain an idea as what the visitor does and sees before offering copy for it.

In the code: frames are `src/components/sections/hero-frame.tsx` with `src/components/canvas/hero-samples/frame-shader.ts`, on the samples route as `kadr-imie`, `kadr-slowa`, `kadr-materia`. `sdTaper` needs its guard for one end lying inside the other, or a hard wedge is drawn. Decisions are logged in `docs/design/2026-11-14-otwarcie-diagnoza-telefon.md`, section 5.
