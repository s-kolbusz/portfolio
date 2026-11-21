---
title: "The aspect-preview demo on the site uses the real plugin editor, not a copy of it"
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 30, tokens: 344862 }
id: l-1d559378
scope: repo
status: active
src: agent
touches:
  - cook/akt3/index.html
---

## Decided
In act 3 the owner wants a working, interactive demo of payload-plugin-aspect-preview that a visitor can try without installing Payload. It is both a showcase of his open-source work and a showroom for the plugin. The site imports the real editor from the published npm package and only themes it.

## Tried and ruled out
- A look-alike rebuilt in the site's own HTML/JS (the cook/akt3 still with f=1). The owner rejected it: he wants the plugin itself, not a copy of it.
- A public Payload sandbox on a server: hosting, cleanup and abuse risk.

## Watch out
- The site has to install the published version (0.4.0+), so the demo scene waits for the npm release. Publishing needs the owner's explicit yes.
- Visitors' own photos stay in the browser (blob URLs). Zakofy photos need the client's consent.

In the code: import { AspectPreviewEditor } from 'payload-plugin-aspect-preview/playground' (controlled: value/onChange with { crop?, focal }); theme it through the --apv-* CSS variables on a class passed via className. In the plugin repo the editor split is on the branch feat/playground-editor.
