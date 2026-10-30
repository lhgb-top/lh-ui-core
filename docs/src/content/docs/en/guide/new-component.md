---
title: "Adding a New Component"
---

Adding a component to the native bloodline takes five steps, in order.

## 1. Write the component contract `specs/<name>.json`

Declare props / enums / defaults / events / slots / behaviors / consumed tokens.

```json
{
  "$schema": "./schema.json",
  "name": "stepper",
  "component": "LhStepper",
  "since": "0.1.0",
  "description": "Stepper: increments or decrements a value by a fixed step within a given range.",
  "props": [
    { "name": "value", "type": "number", "default": 0, "description": "Current value (controlled)" },
    { "name": "step", "type": "number", "default": 1, "description": "Step size" },
    { "name": "disabled", "type": "boolean", "default":  false, "description": "Whether disabled" }
  ],
  "events": [
    { "name": "onChange", "payload": [{ "name": "value", "type": "number", "description": "The value after the change" }], "description": "Fires when the value changes" }
  ],
  "behaviors": [
    "When disabled is true: the increment/decrement buttons do not respond and onChange is not fired"
  ],
  "tokenRefs": ["stepper.height", "stepper.buttonSize"]
}
```

For field constraints see [Contract Format](../specs/spec-format).

## 2. Write the golden cases `cases/<name>.json`

Write one given/when/then assertion per behavior that needs a cross-platform guarantee:

```json
{
  "$schema": "./schema.json",
  "component": "stepper",
  "cases": [
    {
      "id": "disabled-blocks-change",
      "name": "The disabled state does not fire onChange",
      "given": { "props": { "disabled": true } },
      "when": { "action": "click", "target": "increment button" },
      "then": {
        "events": [{ "name": "onChange", "assertion": "notEmitted" }],
        "enabled": false
      }
    }
  ]
}
```

For the format see [Case Format](../cases/case-format).

## 3. Run verification

```bash
pnpm verify:specs
```

This checks case/spec consistency: whether the keys of a case's `given.props` are all among the spec's props, whether every `then.events[].name` is among the spec's events, and so on.

## 4. Add component-level tokens (if needed)

If the component introduces new **component-level tokens** (e.g. `stepper.height`), add the keys under the component's namespace in `tokens/components.json`:

```json
"stepper": {
  "height": { "value": "32px", "description": "Stepper height", "nativeOnly": true },
  "buttonSize": { "value": "24px", "description": "Increment/decrement button size" }
}
```

Then:

```bash
pnpm codegen      # regenerate dist/
pnpm verify:tokens
pnpm test -- -u   # update snapshots
```

If the new tokens are **brand-level** (global values such as the color palette or spacing scale rather than component dimensions), edit the corresponding `tokens/<category>.json` and register the change in the "变更登记" (change log) section of the family `docs/设计语言基线.md`.

## 5. Release

```bash
pnpm changeset    # write a changeset
pnpm changeset:version
```

core is released first, then each native target bumps its token dependency version and translates the cases from `cases/stepper.json` by hand into local tests (JUnit / XCTest / ohpm test / C unit tests).

## Checklist

- [ ] `specs/<name>.json` exists and `pnpm verify:specs` passes
- [ ] `cases/<name>.json` exists and is consistent with the spec
- [ ] New tokens were added to `tokens/` and `pnpm verify:tokens` passes
- [ ] `pnpm codegen` succeeds and `pnpm test` snapshots are updated
- [ ] A changeset was written
- [ ] (Brand-level tokens) The family baseline document is updated
