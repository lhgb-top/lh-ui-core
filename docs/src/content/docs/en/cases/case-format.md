---
title: "Case Format"
---

Every `cases/<name>.json` is a component's set of **golden cases**: cross-platform translatable behavior-level assertions. The format is strictly constrained by `cases/schema.json`.

## Design philosophy

> Logic is not shared; behavior is.

The native targets **share no test code**; instead, each translates the same cases by hand into local tests (JUnit / XCTest / ohpm test / C unit tests). Cases only describe **behavior** (what conditions hold, what action is taken, what result is expected), with no target-specific API whatsoever.

## Top-level structure

```json
{
  "$schema": "./schema.json",
  "component": "button",
  "cases": [ ... ]
}
```

- `component`: kebab-case; **must match the `name` of the same-named spec**
- `cases`: at least one case

## The three-part structure

Every case requires `id` / `name` / `given` / `when` / `then`:

```json
{
  "id": "disabled-blocks-click",
  "name": "The disabled state does not fire onClick",
  "given": { "props": { "disabled": true } },
  "when": { "action": "click" },
  "then": {
    "events": [{ "name": "onClick", "assertion": "notEmitted" }],
    "enabled": false
  }
}
```

### given (preconditions)

| Field | Purpose |
| --- | --- |
| `props` | The initial props; **the keys must exist among the same-named spec's props** |
| `state` | The initial component state; **free-form keys** for target-specific scenarios (e.g. `{ "text": "Button" }`) |

### when (the action)

| Field | Purpose |
| --- | --- |
| `action` | **Required**; one of the six values (see below) |
| `target` | The action target (e.g. a slot name or a child component name) |
| `payload` | The action payload (e.g. the text of an input) |

**The six actions**: `render` (render) / `click` (click) / `input` (input) / `focus` (gain focus) / `blur` (lose focus, **reserved, currently unused**) / `custom` (custom, **must be described by `target`**).

### then (assertions)

| Field | Purpose |
| --- | --- |
| `events` | Event assertion array |
| `tokens` | Token application assertion array |
| `visible` | Whether the result is expected to be visible |
| `enabled` | Whether the result is expected to be interactive |
| `text` | The expected rendered text |
| `notes` | Target-agnostic supplementary assertion notes (natural language) |

**Event assertions**:

```json
{
  "name": "onValueChange",
  "assertion": "emitted",
  "times": 1,
  "payload": { "value": "青花瓷" }
}
```

- `name`: **must exist among the same-named spec's events**
- `assertion`: `emitted` (fired) or `notEmitted` (not fired)
- `times`: optional; the expected number of times fired
- `payload`: optional; the expected payload (**deep-compared**)

**Token assertions**:

```json
{ "path": "button.height.large", "applied": false }
```

`path` is the token's full path, and `applied` asserts whether the token **is** applied to the rendered result. A **negative assertion** of `applied: false` is used for size-exclusion regression checks (e.g. with the small size selected, `button.height.large` should not be consumed).

## Complete examples

```json
{
  "id": "small-size-uses-small-tokens",
  "name": "The small size consumes the small size tokens",
  "given": { "props": { "size": "small" } },
  "when": { "action": "render" },
  "then": {
    "tokens": [
      { "path": "button.height.small",   "applied": true },
      { "path": "button.fontSize.small", "applied": true },
      { "path": "button.height.large",   "applied": false }
    ]
  }
}
```

```json
{
  "id": "clearable-emits-empty-value",
  "name": "The clear button emits an empty value",
  "given": { "props": { "value": "Existing text", "clearable": true } },
  "when": { "action": "custom", "payload": { "call": "clear" } },
  "then": {
    "events": [{ "name": "onValueChange", "assertion": "emitted", "times": 1, "payload": { "value": "" } }]
  }
}
```

## Relationship with specs

`pnpm verify:specs` checks:

- whether every key of `given.props` is among the spec's props
- whether every `then.events[].name` is among the spec's events

So **when you rename a spec's props / events, you must update the cases in sync**.

## Current component inventory

15 components; the total number of cases changes between versions. All cases are in the [Golden Case Reference](./reference).
