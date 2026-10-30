---
title: "Type System"
---

## The seven types

`type` and the file-level `$type` only accept: `color` / `dimension` / `number` / `string` / `shadow` / `duration` / `cubicBezier` (a one-to-one mapping with the enum in `tokens/schema.json`; see `TokenType` in `codegen/src/types.ts`).

For the legal value shapes of each type, see [Token Format](./token-format).

## The three-level type precedence

A leaf's type is resolved in this order:

```
1. The leaf's own declared type
2. The type of the ref's target (only when the leaf declares no type of its own)
3. The file-level / group-level $type
4. None of the above → the resolve stage throws
```

This precedence is implemented by **the flatten and resolve stages cooperating**.

### Stage one: flatten (group-level `$type` pushed down)

`load.ts`'s `flatten` propagates the `$type` declared by a group (including the file root) down the tree, but **only bakes it into literal leaves**:

```ts
// Literal tokens inherit the group type; ref tokens keep undefined and let
// resolve take the type from the ref's target
if (node.type === undefined && node.ref === undefined && groupType !== undefined) {
  out.set(path, { ...node, type: groupType })
}
```

**Ref leaves are deliberately left unbaked** — to avoid being misled by the default type of the file they happen to live in.

### Stage two: resolve (the ref target's type overrides the file-level default)

`resolve.ts` assembles the light map:

```ts
token: {
  type: raw.type ?? (file.defaultType as ResolvedToken['type']),  // fall back to the file-level $type first
  ...
},
ownType: raw.type,  // distinguishes "the leaf's own declared type" from "the file-level default"
```

After ref resolution:

```ts
// When the leaf declared no type of its own, take the ref target's type
// (a token's type follows the source of truth)
if (entry.ownType === undefined && resolved.type !== undefined) {
  entry.token.type = resolved.type
}
```

This step puts **level 2 (the ref target's type) above level 3 (the file-level `$type`)**. If the type is still undefined at the end, the `Token X is missing a type` error is thrown.

## Why three levels

A typical example: `button.fontWeight` references `typography.fontWeight.primary`:

```json
// components.json (file-level $type: dimension)
"button": { "fontWeight": { "ref": "typography.fontWeight.primary" } }

// typography.json
"fontWeight": { "primary": { "value": 400, "type": "number" } }
```

If the ref leaf also inherited the file-level `dimension`, `button.fontWeight`'s type would be wrong. The three-level precedence guarantees it **follows the ref target and resolves to `number`**.

Similarly, `typography.json` has no file-level `$type`: the group-level `$type` (the `fontSize` group declares `dimension`) and per-leaf `type` declarations (`fontWeight.primary` carries `number`) each manage their own.

## Semantic validation

The schema only covers structure. **Whether the type matches the value** is asserted one by one — and the value actually parsed — by `format.ts`'s `assertTypedValue` during the resolve stage:

- `color` → must be parseable by `parseColor` (hexadecimal or rgba)
- `dimension` → must match `/^\d+(\.\d+)?(px|%)$/`
- `duration` → supports `s` / `ms`
- `shadow` → split on spaces; if the 4th segment matches `-?\d+(\.\d+)?px` it is the spread, otherwise it is the color
- `cubicBezier` → a four-element array

See [Formatting Layer](../codegen/format).

## Type inference on the dark side

Type inference for dark override keys is simpler: `raw.type ?? byPath.get(path)?.type`. A dark key missing a type does not fail codegen; it is recorded in `orphanDarkPaths` and reported by `pnpm verify:tokens`. See [Dark Mode Merging](./dark-mode).
