# Feature-First Migration Notes (Epic 3 / WEB-12)

## Target Shape

- `src/features/work`
- `src/features/resume`
- `src/features/navigation`
- `src/shared/ui`
- `src/shared/hooks`
- `src/shared/lib`
- `src/shared/config`

## Migration Sequence

1. `WEB-25`: scaffold `features/shared` and enforce boundaries.
2. `WEB-26`: move work-domain modules into `src/features/work`.
3. `WEB-27`: move resume-domain modules into `src/features/resume`.
4. `WEB-28`: move navigation/overlay ownership into `src/features/navigation` and shared primitives into `src/shared/ui`.

## Boundary Guidance

- Feature modules are route-facing domain slices.
- Shared modules are cross-domain primitives/utilities.
- No cross-feature imports; promote shared contracts when reuse is required.
- Legacy `src/components`, `src/data`, `src/hooks`, and `src/lib` remain only as temporary migration sources.
