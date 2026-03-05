# Code-Splitting Policy

## Decision

- Use App Router route boundaries as the default code-splitting mechanism.
- Keep static imports for primary route content, even when that content is client-rendered.
- Allow manual splitting only for documented heavy client-only or progressive-enhancement modules.
- Route all manual split points through `src/shared/lib/loadable.ts`.
- Treat any new wrapper-based split point as a policy change that must be added to `scripts/code-splitting-policy.mjs`.

## Approved Manual Split Points

| Importer                                              | Target                                          | Strategy                 | Why it is allowed                                                                             |
| ----------------------------------------------------- | ----------------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------- |
| `src/components/sections/Hero.tsx`                    | `@/components/canvas/HeroScene`                 | `lazyClientOnly`         | WebGL scene is the heaviest client-only visual module and is already gated by reduced motion. |
| `src/features/navigation/overlays/ClientOverlays.tsx` | `@/features/navigation/overlays/CustomCursor`   | `dynamicClientOnly`      | Pointer enhancement; non-critical and client-only.                                            |
| `src/features/navigation/overlays/ClientOverlays.tsx` | `@/shared/ui/SmoothScroller`                    | `dynamicClientOnlyNamed` | Smooth-scroll enhancement; client-only and safe to defer.                                     |
| `src/features/navigation/overlays/ClientOverlays.tsx` | `@/features/navigation/components/DockNav`      | `dynamicClientOnlyNamed` | Deferred home-page enhancement outside the critical path.                                     |
| `src/features/navigation/overlays/ClientOverlays.tsx` | `@/features/navigation/components/SettingsDock` | `dynamicClientOnlyNamed` | Deferred home-page enhancement outside the critical path.                                     |

## Shared Wrapper Module

- `src/shared/lib/loadable.ts` is the only source module allowed to import `next/dynamic` or `React.lazy`.
- Use `dynamicClientOnly` for default-exported client-only modules.
- Use `dynamicClientOnlyNamed` for named exports that should stay client-only.
- Use `lazyClientOnly` for Suspense-driven heavy client modules such as the WebGL hero scene.

## Explicit Non-Goals

- Do not split route sections such as `About`, `Projects`, `Services`, `PrintCalculator`, or `Contact`.
- Do not use manual splitting as a default response to any client component.
- Do not add bundle-budget thresholds here; that lands in `WEB-35`.

## Follow-Up For WEB-35

- Add measurable bundle budgets now that split points are centralized and stable.
- Emit actionable CI output that shows which route or asset exceeded the threshold.

## Enforcement

- `pnpm check:code-splitting` scans `src/**/*.ts(x)` for approved wrapper-based split points.
- The same check rejects direct `next/dynamic` and `React.lazy` imports outside `src/shared/lib/loadable.ts`.
- CI now fails when a split point is introduced outside the approved list.
- Any intentional new split point requires a policy update and a matching rationale in this document.
