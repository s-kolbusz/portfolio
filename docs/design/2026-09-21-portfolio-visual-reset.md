# Portfolio visual exploration — correction after rejected studies

> **ZASTĄPIONE 2026-09-24** przez [decyzje redesignu](./2026-09-24-redesign-decyzje.md). Archiwum. Lista usterek z audytu (A1–A9) nadal obowiązuje, ale kierunek wizualny, założenia o ograniczaniu ruchu, pozycjonowanie i mapa strony z tego dokumentu już nie.

Date: 2026-09-21
Status: Owner feedback recorded. Both initial studies rejected. Task 2 remains open.

## What went wrong

The owner described the studies as losing the IT/technology character of the
existing site: its cold artificial greens and clean, distinguished developer
identity. The result felt like a health-related SaaS product. Typography was the
only element considered potentially worth exploring further.

This was an identity failure, not a request to polish either proposed direction.
The studies replaced core visual properties that the discovery brief explicitly
said to preserve. Their labels and descriptions must not be treated as approved
design rules. The comparison board is retained as rejected reference material.

## Observable departures from the existing implementation

| Element             | Existing source                                                                         | Rejected study                                                                  | Correction                                                                                |
| ------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Interface green     | Primary hue 162 in OKLCH; emerald accent system                                         | Olive/sage-leaning `#386b43`, yellow-green gradient                             | Use the actual theme tokens as the baseline; preserve the owner's cold synthetic reading  |
| Neutral surfaces    | Very low chroma light background `oklch(0.985 0.005 85)` and dark `oklch(0.15 0.01 65)` | Stronger cream `#f5f3e9` and forest-tinted text/surfaces                        | Preserve the original near-neutral contrast; do not amplify warmth                        |
| Blob                | WebGL field with smooth merging, noise, pointer attraction, depth and scroll response   | Fixed SVG shape with yellow-green radial shading and a rotation/scale animation | Use the actual material and behaviour as the identity reference; no decorative substitute |
| Typography          | Serif display, sans supporting copy, monospace role and actions                         | Serif/sans with most monospace character removed                                | Clarify the roles of all three, retaining purposeful technical details                    |
| Interface character | Technical cues, cursor interaction and restrained utility controls                      | Generic soft controls and a warmer studio/wellness mood                         | Refine the site's own controls and feedback rather than import a preset aesthetic         |

The source comments call the neutrals warm; that does not override the owner's
description of the complete experience. The mistake was increasing warmth and
changing the relationships between colors, material, typography and interaction.

The shader uses separate `--primary-rgb` values from the interface's `--primary`
token. A faithful baseline must preserve that distinction. Recoloring everything
with a single emerald swatch would also change the current rendering.

Source references:
[theme tokens](../../src/app/globals.css),
[shader](../../src/components/canvas/viscous-puddle/shaders.ts),
[blob behaviour](../../src/components/canvas/viscous-puddle.tsx),
[hero typography](../../src/components/sections/hero.tsx).

## Keep fixed in the next study

- The cold, artificial, technological impression of the existing identity.
- Actual existing light/dark theme values as the initial baseline.
- The existing blob's material and responsive behaviour.
- Developer character, including meaningful monospace details and cursor feedback.
- The owner’s cinematic, living-experience ambition.
- Both languages and the five viewport anchors, including 3440 × 1440.

## What may change

- Content order and how quickly visitors reach visible project work.
- Typographic hierarchy, line lengths and spacing within the existing font system.
- Image placement and project storytelling, while preserving the portfolio shell.
- Navigation clarity and consistency between routes.
- Animation pacing and interruption behaviour, grounded in the existing system.
- Responsive composition, with explicit layouts for all five agreed formats.

Technical identity does not require dense specification lists everywhere. Reduce
repetitive content while keeping the visual language that expresses the craft.
Customer scenes can use their own materials without recoloring the entire portfolio.

## Next bounded comparison

Start with the current homepage as the control. Produce one close refinement of
the opening-to-first-project sequence using its real theme tokens, blob and font
roles. Annotate exactly what changed in hierarchy, work visibility and spacing.
Compare against the current site at the five sizes before expanding to case and
Contact scenes. Do not produce another set of unrelated aesthetic directions.

Acceptance question: does this unmistakably feel like the same developer portfolio,
with stronger composition and clearer access to the work?

The rejected board was interrupted during its first browser review. Its controls,
responsive matrix and form presentation were not fully validated. It is neither a
completed Task 2 deliverable nor a connected prototype ready for implementation.
