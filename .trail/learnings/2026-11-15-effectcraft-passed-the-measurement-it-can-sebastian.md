---
title: "EffectCraft passed the measurement: it can be driven and read from the agent, and gives a crisp flat liquid"
author: Sebastian
date: 2026-11-15
branch: redesign/decyzje
cost: { minutes: 5, tokens: 55738 }
id: l-29f4236d
scope: repo
status: active
src: agent
touches:
  - src/components/sections/hero-assembly.tsx
---

## Decided
On 2026-11-15 the owner installed EffectCraft 0.24.1 (an After Effects analog from the ArtCraft family, notarized macOS app) and it was measured before entering the stack. All three checks passed: the project can be read and frames rendered back; the effects a flat liquid needs exist and render (Gaussian Blur, Levels on alpha, Turbulent Displace, also Simple Choker, Roughen Edges, Liquify, Liquid Particles); and it exports with transparency (PNG sequence with real alpha, WebM VP9 tagged with alpha). Two circles merging through a neck with a sharp flat edge took minutes; 8 preview frames render in 1 s, a 3 s clip at 1080 px in 6 s. Whether it is used for the hero is the owner's decision.

## Tried and ruled out
- The MCP route (`claude mcp add effectcraft -- effectcraft-cli mcp`): the DMG ships only the GUI binary, there is no `effectcraft-cli` on the machine, so that server cannot start. The app's own control channel does the same job.

## Watch out
- The control channel is the GUI started with `--control 9877`: TCP on 127.0.0.1, one JSON object per line, no authentication, so keep it open only while in use. Commands go through `engine.execute` with `{command, params}`; `command.list`, `effect.list` and `renderQueue.formats` are commands inside it, not top-level methods. `render.frame` is top-level.
- `renderQueue.setOutputModule` needs `index` or `item` once there is more than one queue item; without `channels: rgba` a PNG sequence comes out flattened on the comp background.
- Safari does not play VP9 with alpha; for the site, a flat one-colour shape can ship as a plain matte video or frames that the page tints.
- The merge is drawn, not simulated: an absorbed drop does not make the blob grow unless that is animated.
- The tool passing says nothing yet about whether the motion made in it reaches his bar.

In the code: nothing in `src/` uses it yet. The probe (client script, project file, frame sheet) is local only in `cook/effectcraft-probe/`; the hero it is meant for is `src/components/sections/hero-assembly.tsx`.
