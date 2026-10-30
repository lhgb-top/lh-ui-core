---
title: "Reference Mechanism"
---

## What `ref` is

A leaf may declare `ref` instead of `value`, pointing at the **full path** of another token:

```json
"selected": { "ref": "color.primary.active", "description": "Selected-state text color; follows the pressed variant of the primary color" }
```

At build time `ref` is **statically resolved and baked into a literal value** — every target's artifact contains the already-resolved value, with **zero indirection at runtime**.

## Resolution algorithm

The inline function `resolveRef(path, chain)` in `resolve.ts`:

1. The target path does not exist → throws `Referenced token does not exist: <path>`
2. The target is itself a ref → **recurses** down the chain (indirection chains of any length are supported)
3. The chain already contains the current path → throws `Token reference cycle detected: a -> b -> a`
4. Reaches a literal value → returns `{ value, type }`

## Indirection chains

```json
"a": { "ref": "b" },
"b": { "ref": "c" },
"c": { "value": "#2B4C7C" }
```

`a` resolves along the chain to `c`'s literal value.

## Cycle detection

```json
"a": { "ref": "b" },
"b": { "ref": "a" }
```

At resolve time `chain.includes(path)` hits and `Token reference cycle detected: a -> b -> a` is thrown, failing codegen outright.

## Baked result

The resolved value is written into `token.value`, and the `refChain` is recorded (`ResolvedToken.refChain`, e.g. `["color.primary.active"]`). Every target's artifact contains only the literal value; no ref is visible:

```kotlin
// button.borderRadius referenced radius.base (2px); after baking:
val borderRadius = 2.dp  // The button's corner radius follows the global radius
```

## The type follows the source of truth

When a ref leaf does not declare its own `type`, **the type is taken from the ref's target** (level 2 of the three-level precedence; see [Type System](./type-system)).

## refMap

The `refMap` returned by `resolveTokens` records every resolved reference (`path -> the original ref string`; dark keys carry a `dark:` prefix) for use by the documentation and `pnpm verify:tokens`.

## Typical usage

The typical `ref` scenarios in `tokens/`:

| Scenario | Example |
| --- | --- |
| A component follows a global value | `button.borderRadius` → `radius.base` |
| A state follows a semantic color | `color.selected` → `color.primary.active` |
| A component's font size follows typography | `button.fontSize.small` → `typography.fontSize.small` |

**Every reference must use the full path** (namespace + nested path); see [Namespaces & Dot Paths](./namespace).
