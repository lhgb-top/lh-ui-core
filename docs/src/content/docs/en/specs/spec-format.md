---
title: "Contract Format"
---

Every `specs/<name>.json` is a component's **cross-platform contract**. Its format is strictly constrained by `specs/schema.json`.

## Top-level structure

```json
{
  "$schema": "./schema.json",
  "name": "button",
  "component": "LhButton",
  "since": "0.1.0",
  "description": "Button: triggers an immediate action; supports type, size, loading state, disabled state, icons, and a pattern background.",
  "props": [ ... ],
  "events": [ ... ],
  "slots": [ ... ],
  "behaviors": [ ... ],
  "tokenRefs": [ ... ]
}
```

| Field | Required | Constraint |
| --- | --- | --- |
| `name` | Yes | kebab-case: `^[a-z][a-z0-9-]*$`, matching the file name |
| `component` | Yes | PascalCase with the Lh prefix: `^Lh[A-Z][a-zA-Z0-9]*$` |
| `description` | Yes | A Chinese description |
| `props` | Yes | An array with at least one item (the schema enforces `minItems: 1`) |
| `since` | No | The version it was introduced in |
| `events` / `slots` / `behaviors` / `tokenRefs` | No | See below |

`additionalProperties: false` — no extra fields are allowed.

## props

```json
{ "name": "size", "type": "enum", "values": ["small", "medium", "large"], "default": "medium", "description": "Button size" }
```

| Field | Required | Purpose |
| --- | --- | --- |
| `name` | Yes | camelCase: `^[a-z][a-zA-Z0-9]*$`, **identical across all five targets** |
| `type` | Yes | See the table below |
| `description` | Yes | A Chinese description |
| `values` | No | Enum values when `type: enum` (an array of string literals) |
| `items` | **Required** when `type: array` | Element type (`string` / `number` / `boolean`) + description |
| `default` | No | Default value (any JSON type); omitted means no default |
| `required` | No | Boolean, defaults to `false` |

**The seven prop types**:

| Type | Meaning | Per-target mapping |
| --- | --- | --- |
| `string` | A string | `String` / `String` / `string` / `const char*` |
| `number` | A number | `Int` / `Double` / `number` / `int` |
| `boolean` | A boolean | `Boolean` / `Bool` / `boolean` / `bool` |
| `enum` | An enum (`values` required) | Each target generates its own enum type |
| `tokenRef` | A token dot path | Token reference; existence is checked by verify (**reserved, currently unused**) |
| `node` | Slot / child-node content | Compose content, SwiftUI ViewBuilder, ArkUI Builder, C child-node handle (**reserved, currently unused**) |
| `array` | An array (`items` required) | Picker candidates, and similar |

## events

```json
{
  "name": "onValueChange",
  "payload": [{ "name": "value", "type": "string", "description": "The text after the change" }],
  "description": "Fires when the text changes; not fired when disabled or readonly is true"
}
```

- `name`: `^on[A-Z][a-zA-Z0-9]*$`, **identical across all five targets**
- `payload`: an array of fields (each with `name` + `type` + an optional `description`); **an empty array means no payload**
- `description`: required

## slots

```json
{ "name": "prefix", "description": "Input prefix content (the non-input area on the left)" }
```

`name` is camelCase here as well. The **target-side implementation** of a slot is carried by a `node`-typed prop or each target's own slot mechanism.

## behaviors

An array of natural-language behavior descriptions, used for extracting cases and generating documentation:

```json
"behaviors": [
  "When disabled is true: clicks are not responded to, the disabled style is applied (disabled.* tokens), and onClick is not fired",
  "Size mapping: small/medium/large resolve to the button.height.<size> dimension tokens, and so on"
]
```

## tokenRefs

The list of **full paths** of the tokens this component consumes, checked for reference integrity by `pnpm verify:specs`:

```json
"tokenRefs": ["button.height.medium", "color.primary.default", "color.onPrimary"]
```

## Why the naming is so strict

Every naming regular expression exists for **cross-target alignment**: `name` determines the file name and each target's test naming, `component` is the basis of each target's class names, and prop and event names stay identical across the five targets so that cases can be translated against them.

## Current component inventory

15 components: button, cell, checkbox, dialog, icon, input, loading, navbar, picker, radio, switch, tag, text, textarea, toast. The full contracts are in the [Component Contract Reference](./reference).
