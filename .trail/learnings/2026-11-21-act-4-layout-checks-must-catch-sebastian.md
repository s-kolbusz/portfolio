---
title: "Act 4 layout checks must catch squeezed text, not only overlaps"
author: Sebastian
date: 2026-11-21
branch: redesign/decyzje
cost: { minutes: 1, tokens: 1004 }
id: l-bf46e778
scope: repo
status: active
src: agent
---

## Decided
The act 4 layout checks (website/cook/akt4/stock-check.mjs, relay-check.mjs) also fail when a heading wraps into too many lines, not only when parts overlap or leave the screen. The owner found the template hero in website/src/components/sections/how-i-work-stock.css squeezed into one word per line on a 3440x1440 ultrawide, and the overlap check had passed it.

## Watch out
A percentage padding is a share of the containing block's width, not of the element. A centered 1140px container with padding-right: 52% got 52% of the 3440px stage, more than the container itself. To split a fixed container, give its children a max-width in percent.

In the code: stock-check.mjs counts lines of .st-tpl-h and .st-line; how-i-work-stock.css uses `.st-stage[data-wide] .st-tpl > * { max-width: 46% }`.
