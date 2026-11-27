---
title: "The How-I-work-with-agents page middle is one plate per rule, each told with its own material; the drop appears only in the sessions rule"
author: Sebastian
date: 2026-11-27
branch: redesign/decyzje
cost: { minutes: 1, tokens: 2806 }
id: l-aa16a5af
scope: repo
status: active
src: agent
touches:
  - docs/design/2026-11-14-jak-pracuje-z-agentami-szkic.md
  - docs/design/2026-11-15-how-i-work-with-agents-en.md
---

## Decided
On 2026-11-27 the owner approved the middle of "Jak pracuję z agentami" (How I work with agents), direction C of three by Fable, after one fix round (frame C2). One plate per rule, the material larger than the text, ground alternating ink / paper like the home page:
1. The first screen and rule 1 are one dark terminal run: "agent > gotowe" struck through, "ja > sprawdzam", then the seven checks lighting up one by one, a paper band "Wygląd i ruch oceniam sam…", and a huge green "Gotowe" only at the end.
2. The path pytania > specyfikacja > plan > wykonanie > weryfikacja as poster-size words darkening in order, short notes beside them.
3. "Decyzje żyją w plikach, nie w rozmowie." with the after-session note as a real sheet (Ustalono / Sprawdzono i odrzucono / Na co uważać).
4. The only liquid on the page: one big drop (the session that keeps direction), small drops split off and come back with a slip "wraca jako plik i kilka zdań", plus the brief sheet.
5. The screen cut in half: Plane shows only "agent >" and a cursor (nothing readable), Linear shows the full document; then 1 ▬ 2 ▬ 3 trail (loser tool names redacted).
6. The board (Praca / Pomysły with "nie ruszać" and "zablokowane" stamps), then the full-width sentence ending "decyduję ja.", then one line to Airchos.
Principles behind it (approved): each rule shows its own material; each rule has its own layout and scale; the drop only in the sessions rule; one tension (agent says "gotowe", I say "sprawdzam"); motion reveals in the order of the work.

## Tried and ruled out
Direction A (objects on paper, prose-led) was too close to the approved "Kim jestem" middle. Direction B (a dialogue: agent in mono, my reply in Mattone) needed invented agent quotes.
In C's first version the note sheet covered the word "rozmowie" and grey bars stood in for task titles; both read as bugs or skeleton UI and were fixed in C2.

## Watch out
On phones the small drops are hidden, so rule 4 loses its meaning; solve it when building. Rule 1 names the real tools (prettier, eslint, tsc, vitest, playwright, axe) from the project docs, not from the approved copy text. All copy is placeholder; real copy goes through Codex. In a frame, never name a class "where": the shared frame uses .bar .where for the top bar.

In the code: nothing built. Content source: docs/design/2026-11-14-jak-pracuje-z-agentami-szkic.md and docs/design/2026-11-15-how-i-work-with-agents-en.md; the page will live under src/app/v2/[locale]/. Frame agenci-c2.html (+ agenci-c2-1600.jpg, agenci-c2-390.jpg) and Fable's A/B/C live outside the repo in the session notes folder, podfolder podstrona-kadr.
