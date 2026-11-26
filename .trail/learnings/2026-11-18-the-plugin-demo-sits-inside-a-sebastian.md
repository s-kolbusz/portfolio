---
title: "The plugin demo sits inside a drawing of the Payload admin, with only the plugin live"
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 1, tokens: 1479 }
id: l-0ac47142
scope: repo
status: active
src: agent
touches:
  - src/components/sections/aspect-demo.tsx
  - src/components/sections/aspect-demo.css
---

## Decided
The owner wants the aspect-preview demo to read as a real preview of the Payload admin: a paper-and-ink wireframe of the media edit view around the plugin, where only the plugin can be clicked. The plugin keeps its own framed panel, drawn in full ink, so the live part stands out from the drawing.

## Tried and ruled out
The editor without its frame, placed straight on the page's margins (commit 3257d396). The owner found it clearer with the frame.

## Watch out
- The wireframe has to stay a drawing: inert and aria-hidden, with no hover states. Interactive-looking chrome that does nothing reads as broken.
- On phones only the path bar and title stay, so the plugin starts on the first screen.

In the code: src/components/sections/aspect-demo.tsx (the `.apd-admin` markup inside `AspectDemo`) and src/components/sections/aspect-demo.css.
