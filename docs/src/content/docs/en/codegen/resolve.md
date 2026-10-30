---
title: "Resolve Layer — resolve.ts"
---

> Reference resolution and dark-mode merging.

`resolveTokens(files: LoadedTokenFile[]): ResolveResult` is the core function, in three parts.

## Return value

```ts
interface ResolveResult {
  tokenSet: TokenSet                    // The light token set + the dark override map
  orphanDarkPaths: string[]             // Orphan dark paths (for the verify report)
  refMap: Map<string, string>           // path -> the original ref string (dark keys carry a dark: prefix)
}
```

## Part one: the light collapse

Merge the `flat` maps of all non-dark files into a single `rawMap`:

```ts
if (rawMap.has(path)) throw new Error(`Duplicate token path definition: ${path} (file ${file.fileName})`)
```

Each entry carries three values:

| Field | Meaning |
| --- | --- |
| `token` | The `ResolvedToken` being assembled (the type first falls back to `raw.type ?? file.defaultType`) |
| `raw` / `ref` | The original value and the reference string |
| `ownType` | **The leaf's own declared type**, kept specifically to distinguish "declared by the leaf itself" from "inherited from the file-level default" |

`ownType` is the key to the three-level type precedence: after ref resolution, the ref target's type is applied **only when `ownType === undefined`**.

## Part two: ref resolution

The inline function `resolveRef(path, chain): { value, type? }`:

1. `rawMap.get(path)` does not exist → throws `Referenced token does not exist: <path>`
2. The target is itself a ref → recurses `resolveRef(entry.ref, [...chain, path])`
3. `chain.includes(path)` → throws `Token reference cycle detected: a -> b -> a`
4. Reaches a literal → returns `{ value, type }`

The main loop handles every entry that has a ref:

```ts
refMap.set(path, entry.ref)                    // Record the reference
const resolved = resolveRef(entry.ref, [path])
entry.token.value = resolved.value             // Bake into a literal
entry.token.refChain = [entry.ref]             // Record the reference chain
if (entry.ownType === undefined && resolved.type !== undefined) {
  entry.token.type = resolved.type             // The type follows the source of truth
}
```

Finally:

```ts
if (entry.token.type === undefined) {
  throw new Error(`Token ${path} is missing a type (neither its own type nor a file-level $type)`)
}
assertTypedValue(entry.token.type, value)      // Semantic validation
```

The results are sorted by path lexicographically, and a `byPath` index is built.

## Part three: dark overrides

Dark files only declare **the keys that need overriding**.

**The dark namespace view**: first collapse the `flat` maps of all dark files once more into a `darkRawMap` (`path -> { value, ref }`).

**The inline function `resolveDarkRef(path, chain): TokenValue`** — nearest-first resolution for dark refs:

| Case | Behavior |
| --- | --- |
| The target is in `darkRawMap` and is a ref | Recurse down the chain **inside the dark namespace** (a dark reference to dark is the same-theme lookup), with cycle detection as well |
| The target is in `darkRawMap` and is a literal | Return the dark value |
| The target is **not** in `darkRawMap` | **Fall back to the light namespace**, `resolveRef(path, chain).value` |

**Iterating the dark entries**:

```ts
if (raw.ref) {
  // The target must exist in one of byPath / rawMap / darkRawMap
  if (!byPath.has(raw.ref) && !rawMap.has(raw.ref) && !darkRawMap.has(raw.ref)) {
    throw new Error(`Dark token ${path} references a non-existent token: ${raw.ref}`)
  }
  value = resolveDarkRef(raw.ref, [path])
  refMap.set(`dark:${path}`, raw.ref)    // Dark keys carry a prefix
}
const type = raw.type ?? byPath.get(path)?.type
if (!type) { orphanDarkPaths.push(path); continue }   // Missing type → skip this key
assertTypedValue(type, value)
if (!byPath.has(path)) orphanDarkPaths.push(path)     // Orphan → still written to the override map
dark.set(path, value)
```

## Orphan dark paths

Two kinds of anomaly **do not interrupt codegen**; they are only recorded in `orphanDarkPaths` for `pnpm verify:tokens` to report:

- A dark key **missing a type** (neither its own type nor an identically-named light key to inherit from) → **the key is skipped and not written to the override map**
- A dark key that **does not exist** in the light set (orphan) → **still written to the override map**, but reported

See [Dark Mode Merging](../tokens/dark-mode).

## How each target consumes `dark`

`dark` is a flat `Map<path, TokenValue>`; each target decides how to emit it (Kotlin / Swift / ArkTS use a separate `LhDarkTokens` namespace; C uses same-name macro redefinition). See [The Five Targets](./targets).
