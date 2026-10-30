---
title: "Token Format"
---

Every `tokens/*.json` file is a platform-neutral source, strictly constrained by `tokens/schema.json`.

## File-level meta properties

Keys starting with `$` are meta properties and produce no tokens:

| Property | Purpose |
| --- | --- |
| `$schema` | Points at `./schema.json` (editor auto-completion + validation) |
| `$description` | File description; appears in the docs target and the baseline document |
| `$type` | **File-level default type**; leaf literals without their own `type` inherit it |
| `$dark` | `true` marks this file as a dark-mode override file (only declares the keys to override) |
| `$namespace` | Namespace prefix; determines the global dot path (see [Namespaces & Dot Paths](./namespace)) |

```json
{
  "$schema": "./schema.json",
  "$namespace": "color",
  "$type": "color",
  "$description": "Color palette and semantic colors",
  "primary": { "default": { "value": "#2B4C7C" } }
}
```

## The five fields of a leaf token

| Field | Required | Purpose |
| --- | --- | --- |
| `value` | **one of** `value` / `ref` | The literal value |
| `ref` | **one of** `value` / `ref` | Full path referencing another token (statically resolved and baked at build time) |
| `type` | optional | Token type; inherits the file-level `$type` when not declared |
| `description` | optional | Description; rendered into the comments and doc tables of every target's artifacts |
| `nativeOnly` | optional | `true` = added by the native bloodline, with no web-bloodline counterpart |

The schema uses `anyOf: [{required: [value]}, {required: [ref]}]` + `additionalProperties: false` to guarantee every leaf has **exactly one** of `value` or `ref`, with no extra fields allowed.

## The seven types

`type` / `$type` only accepts these seven values:

| Type | Value shape | Example |
| --- | --- | --- |
| `color` | `#RGB` / `#RRGGBB` / `#AARRGGBB` / `rgba(r,g,b,a)` | `"#2B4C7C"`, `"rgba(61, 100, 158, 0.25)"` |
| `dimension` | **unit-carrying string only** `"12px"` / `"50%"` (`assertTypedValue` enforces a string; a bare number is only legal under the `number` type) | `"40px"`, `"50%"` |
| `number` | A plain number | `400`, `1000` |
| `string` | A string | `"PingFang SC"` |
| `shadow` | Space-separated shadow string (`x y blur [spread] color`) | `"0px 2px 12px 0px rgba(26, 26, 26, 0.08)"` |
| `duration` | `"200ms"` / `"0.2s"` (normalized to milliseconds) | `"200ms"` |
| `cubicBezier` | A four-element array | `[0.4, 0, 0.2, 1]` |

A type mismatch (e.g. `type: color` with `40px`) is rejected by `assertTypedValue` in the resolve stage; see [Type System](./type-system).

## Neutral-value constraint (red line 5)

Token values **only allow neutral expressions**:

- ✅ hexadecimal colors, `rgba()`, unit-carrying strings `"12px"` / `"50%"`, plain numbers under the `number` type
- ❌ platform-specific units or references such as `var()`, `rem`, `sp`, `dp`

Platform unit conversion is the responsibility of each target's templates:

| Platform | Conversion |
| --- | --- |
| Android | `usesSp()` decides `sp` for font sizes, `dp` for everything else |
| iOS | Dimensions as `CGFloat`, durations **converted to seconds** (`(ms/1000)`, since SwiftUI animations are in seconds) |
| HarmonyOS | Dimensions as plain `vp` numbers |
| C | Plain numbers with the unit stated in comments (colors as `0xAARRGGBB`, dimensions in logical pixels, durations in milliseconds) |

## Grouping and nesting

Groups can nest at any level, and a group may declare its own `$type` to override the default type for the whole group:

```json
"fontSize": {
  "$type": "dimension",
  "base": { "value": "14px" },
  "small": { "value": "13px" }
}
```

`typography.json` has no file-level `$type`; its group-level `$type` declarations and per-leaf `type` declarations each apply on their own.

## The `nativeOnly` flag

Marks tokens added by the native bloodline with no web-bloodline counterpart (mostly new mobile-only dimensions). Effects:

- The description column of `dist/docs/tokens.md` is annotated "native-only addition"
- The family baseline document uses it to filter out the "native-only tokens" list
- **Every native target generates it as-is without filtering**

## File inventory

| File | `$namespace` | `$type` | Description |
| --- | --- | --- | --- |
| `color.json` | `color` (derived from the file name) | `color` | Color palette and semantic colors |
| `color-dark.json` | `color` (explicit; must match the light file's namespace) | `color` | Dark-mode incremental overrides |
| `components.json` | `""` | `dimension` | Component-level tokens |
| `typography.json` | `typography` | none (declared per group/leaf) | Typography |
| `spacing.json` | `spacing` | `dimension` | Spacing scale |
| `radius.json` | `radius` | `dimension` | Corner radii |
| `shadow.json` | `shadow` | `shadow` | Shadows |
| `motion.json` | `motion` | none (declared per group/leaf) | Durations and easing |
| `z-index.json` | `zIndex` (explicit) | `number` | Elevation |
