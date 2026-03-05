# Code-Splitting Policy

## Decision

- Use App Router route boundaries as the default code-splitting mechanism.
- Keep static imports for primary route content, even when that content is client-rendered.
- Allow manual splitting only for documented heavy client-only or progressive-enhancement modules.
- Treat any new `next/dynamic` or `React.lazy` usage as a policy change that must be added to `scripts/code-splitting-policy.mjs`.

## Approved Manual Split Points

| Importer                                              | Target                                          | Strategy       | Why it is allowed                                                                             |
| ----------------------------------------------------- | ----------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------- |
| `src/components/sections/Hero.tsx`                    | `@/components/canvas/HeroScene`                 | `React.lazy`   | WebGL scene is the heaviest client-only visual module and is already gated by reduced motion. |
| `src/features/navigation/overlays/ClientOverlays.tsx` | `@/features/navigation/overlays/CustomCursor`   | `next/dynamic` | Pointer enhancement; non-critical and client-only.                                            |
| `src/features/navigation/overlays/ClientOverlays.tsx` | `@/shared/ui/SmoothScroller`                    | `next/dynamic` | Smooth-scroll enhancement; client-only and safe to defer.                                     |
| `src/features/navigation/overlays/ClientOverlays.tsx` | `@/features/navigation/components/DockNav`      | `next/dynamic` | Deferred home-page enhancement outside the critical path.                                     |
| `src/features/navigation/overlays/ClientOverlays.tsx` | `@/features/navigation/components/SettingsDock` | `next/dynamic` | Deferred home-page enhancement outside the critical path.                                     |

## Explicit Non-Goals

- Do not split route sections such as `About`, `Projects`, `Services`, `PrintCalculator`, or `Contact`.
- Do not use manual splitting as a default response to any client component.
- Do not add bundle-budget thresholds here; that lands in `WEB-35`.

## Hotspots For WEB-34

- `src/features/navigation/overlays/ClientOverlays.tsx` still contains ad-hoc `next/dynamic` calls.
- `src/components/sections/Hero.tsx` still contains an ad-hoc `React.lazy` boundary.
- `WEB-34` should replace those direct calls with shared helpers without changing runtime behavior.

## Enforcement

- `pnpm check:code-splitting` scans `src/**/*.ts(x)` for `next/dynamic` and `React.lazy`.
- CI now fails when a split point is introduced outside the approved list.
- Any intentional new split point requires a policy update and a matching rationale in this document.
