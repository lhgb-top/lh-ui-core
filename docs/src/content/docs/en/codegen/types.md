---
title: "Type Definitions — types.ts"
---

> The type definitions shared by every codegen module. They depend on no platform API, are internal to the build-time toolchain, and never enter any runtime artifact.

The [Pipeline Overview](./pipeline) introduces the four core interfaces (`CodegenTarget` / `CodegenInput` / `GeneratedFile` / `TokenSet`); this page is the complete reference.

## Token side

### `TokenType`

```ts
type TokenType =
  | 'color'
  | 'dimension'
  | 'number'
  | 'string'
  | 'shadow'
  | 'duration'
  | 'cubicBezier'
```

A one-to-one mapping with the `$type` / `type` enum in `tokens/schema.json`. For the neutral-value constraints of each type see [Token Format](../tokens/token-format); for the parsing see [Formatting Layer](./format).

### `TokenValue`

```ts
type TokenValue = string | number | number[]
```

A token's neutral value: a hexadecimal color / `rgba()` / a unit-carrying string (`"12px"`, `"50%"`, `"0.3s"`) / a plain number (the `number` type) / a four-element Bézier array. No platform-specific syntax is allowed.

### `RawToken`

```ts
interface RawToken {
  value?: TokenValue       // Literal value (one of value / ref)
  ref?: string             // A dot path referencing another token; statically resolved and baked at build time
  type?: TokenType         // Inherits the file / group-level $type when not declared
  description?: string
  nativeOnly?: boolean     // Marks an addition of the native bloodline (not a web-bloodline counterpart)
}
```

A leaf token in a JSON source file; a direct mapping of the `token` node in the schema. `value` and `ref` are mutually exclusive (the schema's `anyOf` enforces exactly one).

### `ResolvedToken`

```ts
interface ResolvedToken {
  path: string             // A dot path, e.g. color.primary.default
  type: TokenType
  value: TokenValue        // The baked literal value (refs already expanded)
  refChain?: string[]      // When resolved via a ref, records the original reference path (including indirection chains)
  description?: string
  nativeOnly?: boolean
}
```

The product of `resolveTokens`. `refChain` exists only when the token came in through a reference; it lets documentation and debugging trace back the original reference chain.

### `DarkOverrides`

```ts
type DarkOverrides = Map<string, TokenValue>
```

The resolved dark overrides: path -> value. The keys are the same-named light paths (`color-dark.json`'s `$namespace` aligns with the light file's, so the override keys land on the same paths).

### `TokenSet`

```ts
interface TokenSet {
  tokens: ResolvedToken[]              // Light tokens
  byPath: Map<string, ResolvedToken>   // Fast lookup by path
  dark: DarkOverrides                  // path -> dark override value
}
```

The `ResolveResult.tokenSet` returned by `resolveTokens`, and the input of every target. `byPath` lets the dark overrides look up the light token's type and description.

## Contract side (specs)

### `ComponentSpec`

```ts
interface ComponentSpec {
  name: string             // Contract identifier (kebab-case, e.g. 'button')
  component: string        // Display name (e.g. 'Button')
  since?: string           // The version it was introduced in
  description: string
  props: SpecProp[]
  events?: SpecEvent[]
  slots?: SpecSlot[]
  behaviors?: string[]
  tokenRefs?: string[]     // The full paths of the tokens this component consumes
}
```

The type mapping of `specs/<name>.json`, loaded and schema-validated by `loadSpecs()`.

### `SpecProp`

```ts
interface SpecProp {
  name: string
  type: 'string' | 'number' | 'boolean' | 'enum' | 'tokenRef' | 'node' | 'array'
  values?: string[]        // enum only: the set of enum values
  default?: unknown        // The default value (omitted when there is none)
  required?: boolean
  description: string
}
```

`type` matches the 7-value enum in `specs/schema.json`. Of those, `tokenRef` (a token dot path) and `node` (a node reference) are reserved values; none of the current 15 contracts uses them.

### `SpecEvent`

```ts
interface SpecEvent {
  name: string
  payload?: { name: string; type: SpecProp['type']; description?: string }[]
  description: string
}
```

### `SpecSlot`

```ts
interface SpecSlot {
  name: string
  description: string
}
```

## Case side (cases)

### `ComponentCases`

```ts
interface ComponentCases {
  component: string        // The component name; corresponds to ComponentSpec.name
  cases: GoldenCase[]      // At least one (the schema enforces minItems: 1)
}
```

### `GoldenCase`

```ts
interface GoldenCase {
  id: string               // The case id (kebab-case, unique repository-wide)
  name: string             // A human-readable one-line description
  given: { props?: Record<string, unknown>; state?: Record<string, unknown> }
  when: {
    action: 'render' | 'click' | 'input' | 'focus' | 'blur' | 'custom'
    target?: string
    payload?: unknown
  }
  then: {
    events?: { name: string; assertion: 'emitted' | 'notEmitted'; times?: number; payload?: unknown }[]
    tokens?: { path: string; applied: boolean }[]
    visible?: boolean
    enabled?: boolean
    text?: string
    notes?: string
  }
}
```

The type mapping of the given / when / then three-part structure. `blur` of `when.action` is a reserved value; none of the current cases uses it. For the field semantics see [Case Format](../cases/case-format).

## codegen input and artifacts

### `CodegenInput`

```ts
interface CodegenInput {
  tokens: TokenSet
  specs: ComponentSpec[]
  cases: ComponentCases[]
  version: string          // The package.json version number, written into the header comment of every artifact
}
```

Assembled by `main()` and passed to every target's `generate()`. Currently the targets consume only `input.tokens`; `specs` / `cases` are reserved for future component documentation / type skeletons / test generation.

### `CodegenTarget`

```ts
interface CodegenTarget {
  name: string             // Log prefix, e.g. 'android'
  outDir: string           // The subdirectory under dist/
  generate(input: CodegenInput): GeneratedFile[]
}
```

Every platform target implements this interface. Adding a platform = adding a target and appending it to the `targets` array in `index.ts`.

### `GeneratedFile`

```ts
interface GeneratedFile {
  relativePath: string     // The output path relative to dist/<outDir>/
  content: string
}
```

## Related modules

| Module | Responsibility |
| --- | --- |
| [Pipeline Overview](./pipeline) | `index.ts` orchestration and a quick look at the core interfaces |
| [Loading Layer — load.ts](./load) | Produces `RawToken` / `ComponentSpec` / `ComponentCases` |
| [Resolve Layer — resolve.ts](./resolve) | Produces the `TokenSet` (`ResolvedToken` + `DarkOverrides`) |
| [The Five Targets](./targets) | Consume `CodegenInput` and produce `GeneratedFile`s |
