---
title: "Theming the aspect-preview editor on the site: set its variables on both the editor and the preview grid"
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 13, tokens: 147323 }
id: l-e7150e68
scope: repo
status: active
src: agent
touches:
  - package.json
  - pnpm-lock.yaml
  - public/images/demo/bacowka.jpg
  - public/images/demo/giewont.jpg
  - public/images/demo/pleso-2.jpg
  - public/images/demo/pleso.jpg
  - "src/app/[locale]/page.tsx"
  - src/components/sections/aspect-demo.css
  - src/components/sections/aspect-demo.tsx
  - src/components/ui/site-nav/stops.test.ts
---

## Decided
The act 3 demo themes the published plugin editor only through its --apv-* CSS variables plus a few surface rules (no panel box, ink badges, cards that do not lift). Its layout and behaviour stay as they ship, because the scene's point is that this is the real plugin.

## Watch out
- The preview grid's root element declares its own --apv-* defaults, so variables set only on the editor never reach the cards. Set them on both: `.apd :is(.focal-editor, .focal-preview)`.
- The plugin hard-codes teal and orange for the CSS/CROP badges (not variables), so they need direct overrides.
- Below 900 px the plugin stacks its columns and makes the left column position: relative. A sticky `top` override then shifts it down by that amount, so keep it inside a min-width: 901px query. Stacked, the preview column also shrinks to about half width unless given width: 100%.
- A portrait photo makes the editor taller than the screen. Cap the image wrapper's width from the photo's shape (--apd-ratio, measured on load).
- When the browser pane is hidden it stops drawing frames, so IntersectionObserver never fires and the editor seems not to mount. Take screenshots with headless Playwright instead.
- `pnpm build` sometimes exits 1 after generating every page. That is Next.js's security-advisory reminder for 16.4.1, not a build failure.

In the code: src/components/sections/aspect-demo.tsx and aspect-demo.css; editor import 'payload-plugin-aspect-preview/playground' (0.4.0).
