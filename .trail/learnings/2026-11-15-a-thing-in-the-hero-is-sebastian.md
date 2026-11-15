---
title: "A thing in the hero is built part by part from under the blob; the blob must first loosen to the thing's density"
author: Sebastian
date: 2026-11-15
branch: redesign/decyzje
cost: { minutes: 20, tokens: 381033 }
id: l-2bca8ff3
scope: repo
status: active
src: agent
touches:
  - src/components/canvas/hero-samples/matter-story.ts
  - src/components/canvas/hero-samples/things.ts
  - src/components/canvas/hero-samples/matter-moulds.ts
  - src/components/sections/hero-assembly.tsx
---

## Decided
On 2026-11-15 the owner approved building a thing in the order it is made in life (a page as it is read, a print from the bed up). The drawing opens part by part; the next part starts when about a third of the one before has set. The matter not yet in the thing stays one body and waits over what the thing still lacks. Before giving its matter the blob loosens to the thing's density. The return starts at the part made last; matter is no longer thrown outwards.

## Tried and ruled out
- Keeping the blob at its own density: it is denser than the page drawing, so parts lying under it took more than they hold, set with the surplus, and the last parts were left short.
- A cap on setting by local fill: details cut out of a part make the fill read 1.25 and more at rest, so a quarter of the matter never set.
- Taking the hold off surplus matter: loose liquid pulls itself back to the blob's density, so the surplus never drains.
- Releasing the rim of full parts: parts ended up less full, not more.
- Separate drops with necks flying to their places: the blob is nearly as large as the thing and lies where it will stand, so there is nowhere to fly.
- Starting the next part when the previous one merely has matter on it: matter lying there counts at once and all parts open together.

## Watch out
- About 15% of the matter always stays in the gaps between parts. Each part is given room for 85% of its nominal share; with more, the last part starves.
- Part centroids come from jittered sample points, so two parts at nearly the same height swap order between loads unless rows are compared with a tolerance.
- The page's last part still gets only 65 to 80% of its matter.

In the code: matter-story.ts (HELD, slack, opened, turn, pool, waiting, letGo), matter-moulds.ts (open, part, shares), things.ts (ids, order). Rig: cook/rig/story.mjs with masks from cook/rig/dump.mjs.
