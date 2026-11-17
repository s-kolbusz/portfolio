---
title: "The home hero is a straight port of the accepted liquid test page; change the test page's behaviour only with the owner, and copy goes through Codex"
author: Sebastian
date: 2026-11-17
branch: redesign/decyzje
cost: { minutes: 12, tokens: 51740 }
id: l-6547e1f6
scope: repo
status: active
src: agent
touches:
  - eslint.config.ts
  - public/fonts/cabinet/LICENSE-ITF-FFL.txt
  - public/fonts/cabinet/cabinet-grotesk-variable.woff2
  - public/fonts/mattone/LICENSE.txt
  - public/fonts/mattone/Mattone-Black.woff2
  - public/fonts/mattone/Mattone-Bold.woff2
  - public/fonts/mattone/Mattone-Regular.woff2
  - public/hero/terrain.json
  - "src/app/[locale]/page.tsx"
---

## Decided
- On 2026-11-17 the owner accepted the test page (loader, liquid hero, the flood into the stronypodhale sheet, the timed scene act with the wordmark and pins). It was ported 1:1 to the home page, replacing the old hero and the signature scene. The test page stays in cook/ as the reference.
- All site copy goes through Codex: English is reviewed there, and Polish is written there from scratch in Polish style. Until that happens, new Polish keys hold the English text.
- The redesign branch is never merged to main without the owner's explicit word.

## Tried and ruled out
- Fixed full-page canvas with a 400vh body (test page). On the real site it is a sticky stage inside a track 4 screens tall, so the sections after it scroll in normally.

## Watch out
- The site's docks (bottom icon dock, theme/language pill) cover the hero on phones. The owner doubts docks fit this design at all; navigation is open for redesign.
- The local Next image cache served an old screenshot under the same file name. Clear .next/cache/images after swapping the stronypodhale screenshot.
- Untracked scripts in cook/ broke `pnpm lint`, so cook/** is ignored by ESLint.

In the code:
- src/components/canvas/liquid-hero/: sim.ts, physics.worker.ts, shaders.ts, liquid-stage.ts, loader.ts, terrain.ts, hero-textures.ts.
- src/components/sections/hero.tsx renders the live and static versions.
- The terrain is public/hero/terrain.json; the fonts are in public/fonts/mattone and public/fonts/cabinet.
