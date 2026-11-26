---
title: "Act 4's off-the-shelf screen starts as a whole template that turns into the site, not parts swapped one by one"
author: Sebastian
date: 2026-11-21
branch: redesign/decyzje
cost: { minutes: 25, tokens: 54933 }
id: l-3c8c53d2
scope: repo
status: active
src: agent
touches:
  - src/components/canvas/liquid-hero/liquid-stage.ts
  - src/components/sections/aspect-demo.css
  - src/components/sections/how-i-work-relay.css
  - src/components/sections/how-i-work-relay.tsx
  - src/components/sections/how-i-work-stock.css
  - src/components/sections/how-i-work-stock.tsx
  - src/components/sections/how-i-work.tsx
  - src/components/ui/custom-cursor.tsx
  - src/hooks/use-visit.ts
  - src/i18n/messages/en.json
---

## Decided
On 2026-11-21 the owner accepted act 4 screen 2 ("wygląda super") in this form. The screen opens as a typical template: the same sentence centred in a system font, a grey image placeholder and a blue button. The page around it goes stock too: the real header shows a hamburger and the cursor is the system arrow. The liquid that left line 1 at the bottom rises from under the template and swallows the placeholder and the button. Then each word flies from the template's layout into Mattone at the site margin. Every step is scrubbed by the scroll, so the scroll always changes something. Holding the drop turns everything back into the template.

## Tried and ruled out
- A first version: the page shown with stock parts (a grey disc, a hamburger, the arrow), given back one at a time with a note each. The owner rejected it as flat and boring: an empty screen, inert scroll, no transition from line 1.
- A note that follows the cursor: it ran over the other text and made everything unreadable.

## Watch out
- The template container is a fixed 1320px inside the site margins. Never let the template's text sit closer to the edge than the SK mark.
- The physics field has a wall at the canvas top. Liquid can enter only from below (the field runs on under the canvas), never from above.

In the code: src/components/sections/how-i-work-stock.tsx (T beats, target(), place()); data-stock on <html> drives the header and cursor in how-i-work-stock.css; how-i-work-relay.tsx T.leave drains line 1's drop.
