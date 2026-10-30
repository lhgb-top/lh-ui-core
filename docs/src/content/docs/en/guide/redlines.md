---
title: "Red Lines & Naming Conventions"
---

## Six red lines

### 1. Skeletons only, never implementations

codegen only emits **token bindings**, prop enums and types, and default-value constants. **Generating any UI implementation is forbidden** — no Composable bodies, no SwiftUI View bodies, no ArkUI component bodies, no C component function bodies. All UI implementation is hand-written in the native repositories.

This red line is declared in the file-header comment of `codegen/src/index.ts` — the toolchain's self-declaration.

### 2. The single token source of truth is `tokens/*.json`

No platform and no component may define token values outside this repository. Native repositories may only consume `dist/` artifacts or published packages for their platform — **hand-writing color values / spacing / font sizes is forbidden**.

### 3. Zero JS at runtime

The TypeScript code of this repository exists only in the build-time toolchain; **no JavaScript may appear in the artifacts**.

### 4. No dependency on `lh-ui-share`

The two bloodlines are independent and must never import anything from each other. The token seed was carried over by hand once; no automatic dependency was ever established.

### 5. JSON must not contain platform-specific syntax

Token values only allow neutral expressions: hexadecimal colors / `rgba()` / plain numbers under the `number` type / **unit-carrying strings** for `dimension` / `duration` / `shadow` (`"12px"` / `"50%"` / `"200ms"`, enforced by `assertTypedValue`; see [Token Format](../tokens/token-format)). Platform-specific units or references such as `var()`, `rem`, `sp`, and `dp` are forbidden. **Platform unit conversion is the responsibility of each target's templates** (e.g. Android's dp/sp decision, iOS's conversion to seconds).

### 6. `dist/` must not be hand-edited

Every change goes into `tokens/` / `specs/` / `cases/` or the templates, followed by re-running `pnpm codegen`. `dist/` is in `.gitignore`; every codegen run deletes it first and rebuilds.

## Naming conventions (master plan D20)

### Platform package names / identifiers

Platform package names always use the reverse domain name `top.lhgb.ui`:

| Platform | Package name / identifier |
| --- | --- |
| Android | `package top.lhgb.ui.tokens`, output directory `dist/android/top/lhgb/ui/tokens/` |
| iOS | `Sources/LhUITokens/` (SwiftPM directory convention) |
| HarmonyOS | `tokens/` (inside the ohpm module) |
| C | `include/lh_ui/` |

### Own constants / classes / enum prefixes

Always an **LH prefix**, capitalized per each language's conventions:

| Language | Convention | Examples |
| --- | --- | --- |
| Kotlin | `Lh*` (PascalCase) | `object LhTokens`, `object LhDarkTokens` |
| Swift | `Lh*` (PascalCase) | `public enum LhTokens`, `struct LhShadow` |
| ArkTS | `Lh*` (PascalCase) | `export class LhTokens`, `interface LhShadow` |
| C | `LH_*` (UPPER_SNAKE_CASE) | `LH_COLOR_PRIMARY_DEFAULT`, `LH_Z_INDEX_MODAL` |

The `@lh-ui/*` scope on npm / ohpm is not subject to this constraint (npm does not use reverse domain names).

### C macro naming rule

`zIndex.modal` → `LH_Z_INDEX_MODAL`: first convert every `.` to an underscore, then prepend an underscore before each uppercase letter, then uppercase everything. See [C artifacts](../artifacts/c).

## JSON naming constraints

Every layer's schema enforces naming with regular expressions:

| Layer | Field | Rule |
| --- | --- | --- |
| spec | `name` | kebab-case: `^[a-z][a-z0-9-]*$` |
| spec | `component` | PascalCase with an Lh prefix: `^Lh[A-Z][a-zA-Z0-9]*$` |
| spec | prop name | camelCase: `^[a-z][a-zA-Z0-9]*$` |
| spec | event name | `^on[A-Z][a-zA-Z0-9]*$` |
| case | `id` | kebab-case |
| case | `component` | must match the `name` of the same-named spec |

## Comment and documentation language

Comments, documentation, and commit messages are always in **Chinese** (a family master-plan requirement).
