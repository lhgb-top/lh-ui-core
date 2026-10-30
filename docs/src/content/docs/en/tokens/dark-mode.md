---
title: "Dark Mode Merging"
---

## Incremental overrides

A dark file (`"$dark": true`) **only declares the keys that differ from the light file**; keys that are not overridden keep their light values:

```json
// color-dark.json
{
  "$namespace": "color",
  "$dark": true,
  "$description": "Only declares the keys that differ from the light file; unoverridden keys are inherited from color.json",
  "primary": { "default": { "value": "#3D649E" } }
}
```

Keys not listed here — `color.primary.hover`, `.active`, and so on — keep their light values in dark mode. The trimming rule is a **key-by-key comparison**: any key whose value is identical to the light value is removed (for example `onPrimary` is `#FFFFFF` in both themes, and `disabled.*` is the same set of refs in both, so neither appears in the dark file).

## The namespace must align

The dark file must declare the **same `$namespace`** as its light file (`color-dark.json` explicitly writes `"$namespace": "color"`) so the override keys land on the same paths.

## Dark refs resolve nearest first

A `ref` inside a dark file is resolved by `resolveDarkRef`, with rules that differ from the light side:

1. The target is **inside the dark namespace** and is a ref → recurse down the chain within dark (a dark reference to dark is the same-theme lookup)
2. The target is inside the dark namespace and is a literal → return the dark value
3. The target is **not** inside the dark namespace → **fall back to the light namespace** for the value

```json
// Dark referencing dark: takes dark's primary.active
"selectedDark": { "ref": "color.primary.active" }
```

Dark refs also perform cycle detection (`Dark token reference cycle detected`), and the target must exist in either the light set or the dark set, otherwise `Dark token X references a non-existent token` is thrown.

## color-mix precomputation

The web bloodline's dark theme makes heavy use of `color-mix()`, but **the native targets have no such runtime capability**, so it is **precomputed into flat color values at build time**, with the computation basis written into the description:

```json
"selected": {
  "value": "#B1C1D8",
  "description": "Precomputed from color-mix(primary 40%, #fff); dark-panel contrast 5.2:1"
},
"primary": {
  "bg": {
    "value": "rgba(61, 100, 158, 0.25)",
    "description": "Precomputed from color-mix(primary 25%, transparent)"
  }
}
```

## Output shape

`resolveTokens` produces `TokenSet.dark`: a flat `Map<path, TokenValue>` containing only the overridden keys. Each target then decides how to emit it:

| Platform | Dark mechanism |
| --- | --- |
| Android | A separate `object LhDarkTokens` |
| iOS | A separate `public enum LhDarkTokens` |
| HarmonyOS | A separate `export class LhDarkTokens` |
| **C** | **Same-name macro redefinition** — the dark header is included after the light one, directly overriding the same `#define`s |

## Orphan dark paths

Two kinds of anomaly are recorded in `orphanDarkPaths` (**without interrupting codegen**; reported by `pnpm verify:tokens`):

- A dark key **missing a type** (neither its own type nor an identically-named light key to inherit from) → the key is skipped and not written to the override map
- A dark key that **does not exist** in the light set (orphan) → still written to the override map, but reported

## Dark override scope

Currently dark mode only overrides the `color.*` namespace (the exact key count changes between versions; see the dark column of the [Token Reference](./reference) page). Non-color namespaces (spacing, radii, font sizes, and so on) keep their light values in dark mode — which is why the dark column of a non-color row in `dist/docs/tokens.md` is `—`.

The [Token Reference](./reference) page shows both the light and dark values of every token.
