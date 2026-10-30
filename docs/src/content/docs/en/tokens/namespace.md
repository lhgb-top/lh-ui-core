---
title: "Namespaces & Dot Paths"
---

## The rule

**A token's global dot path = `$namespace` + its nested path inside the file.**

```
tokens/color.json        "$namespace": "color"
                         primary.default.value = "#2B4C7C"
                         → full path color.primary.default

tokens/z-index.json      "$namespace": "zIndex"
                         modal.value = 1050
                         → full path zIndex.modal
```

All cross-file references (`ref`, a spec's `tokenRefs`, a case's `then.tokens`) **must use the full path**.

## The three namespace cases

### 1. Default: derived from the file name

When `$namespace` is not declared, it is derived from the file name by splitting on `-` (`namespaceFromFileName`): the first segment stays as-is, and every other segment is capitalized.

| File name | Derived |
| --- | --- |
| `color.json` | `color` |
| `z-index.json` | `zIndex` |
| `typography.json` | `typography` |
| `color-dark.json` | `colorDark` (**derived value, but never actually used**) |

Derivation is just a **fallback** — dark files always declare `$namespace` explicitly to align with their light counterpart (see below).

### 2. Explicit declaration

Write `$namespace` directly:

```json
{ "$namespace": "zIndex", "modal": { "value": 1050 } }
```

**A dark file must declare the same `$namespace` as its light file**, otherwise the override keys never land on the same path:

```json
// color-dark.json
{ "$namespace": "color", "$dark": true, "primary": { "default": { "value": "#3D649E" } } }
```

Only then can the dark override for `color.primary.default` be merged onto the light token at the same path.

### 3. Empty string: the top-level keys are the namespaces

`components.json` declares `"$namespace": ""`, so the **top-level keys are component namespaces** and the full paths are simply `button.height.medium`, `input.borderRadius`:

```json
{
  "$namespace": "",
  "$type": "dimension",
  "button": {
    "height": { "medium": { "value": "40px" } }
  }
}
```

## Where namespaces take effect

- **`dist/docs/tokens.md`** splits into `##` sections by top-level namespace (button / color / motion / zIndex, ...)
- **The resolve stage** does duplicate detection on full paths: two light files declaring the same path is a hard error
- **Dark-mode merging** matches override keys by full path
- **Every target** builds nested structures by splitting the path segments (Android `object Color`, Swift `enum Color`, C `LH_COLOR_*`)

## Complete example

```
color.primary.active          ← color.json
button.height.medium          ← components.json (empty-string namespace)
typography.fontSize.base      ← typography.json
zIndex.modal                  ← z-index.json (explicit)
motion.easing.easeInOut       ← motion.json (grouped nesting)
```

The [Token Reference](./reference) page lets you browse every token by namespace.
