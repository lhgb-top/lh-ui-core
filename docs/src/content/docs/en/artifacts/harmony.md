---
title: "HarmonyOS Artifacts"
---

**Paths**: `dist/harmony/tokens/LhTokens.ets` and `LhDarkTokens.ets`, plus an extra `LhShadow.ets` when shadow tokens exist

**Module directory**: `tokens/` (inside the ohpm module)

## Structure

The root is an `export class`; nested classes **are not exported** (ArkTS does not allow export declarations inside a class body), with `static readonly` members:

```ts
export class LhTokens {
  class Button {
    static readonly borderRadius: Dimension | number = 2  // The button's corner radius follows the global radius
    static readonly borderWidth: Dimension | number = 1
    class FontSize {
      static readonly large: Dimension | number = 16
      static readonly medium: Dimension | number = 14
    }
    class Height {
      static readonly medium: Dimension | number = 40  // Medium button height (default)
    }
  }
  class Color {
    static readonly focus: ResourceColor = '#FF2B4C7C'
  }
}
```

## Name mapping

| Token path | ArkTS member |
| --- | --- |
| `button.height.medium` | `LhTokens.Button.Height.medium` |
| `color.primary.default` | `LhTokens.Color.Primary.default` |
| `zIndex.modal` | `LhTokens.ZIndex.modal` |

## The only platform with type annotations

ArkTS is strongly typed, so every member carries a type annotation (`typeAnnotation()`):

| Token type | Type annotation |
| --- | --- |
| color | `ResourceColor` |
| dimension | `Dimension \| number` |
| duration / number | `number` |
| shadow | `LhShadow` |
| cubicBezier | `number[]` |
| string | `string` |

Kotlin / Swift / C all rely on literal inference; only ArkTS annotates explicitly.

## Units and literals

| Token type | ArkTS literal |
| --- | --- |
| Color | `'#FF2B4C7C'` (ArkUI accepts `#AARRGGBB` strings, via `toArgbHash`) |
| Dimension | a plain `vp` number (`40`, no unit appended) |
| Percentage | `0.500  // 50% (a fraction, converted against the container size)` |
| Duration | `200  // 200ms (milliseconds)` |
| Bézier | `[0.4, 0, 0.2, 1]  // Bézier control points; consumed as curves.cubicBezierCurve on the component side` |
| Shadow | `{ color: '#FF000000', radius: 8, offsetX: 0, offsetY: 2 }` |
| Number / string | as-is / `JSON.stringify` |

## LhShadow.ets

ArkUI also has no composite shadow type, so it is carried by an **interface** (**a static template, with no token content**):

```ts
export interface LhShadow {
  color: ResourceColor
  /** Blur radius */
  radius: number
  offsetX: number
  offsetY: number
}
```

Compare iOS's `struct LhShadow`: ArkTS uses an interface, SwiftUI a struct — each fitting its language's idiom.

## Dark mode

A separate `export class LhDarkTokens`, with the same structure as the light side:

```ts
export class LhDarkTokens {
  class Color {
    static readonly focus: ResourceColor = '#FF7FA6D9'
    static readonly selected: ResourceColor = '#FFB1C1D8'
    // …the rest of the overridden keys
  }
}
```

Keys that are not overridden keep the `LhTokens` value in dark mode.

## How it is consumed

The HarmonyOS repository includes `dist/harmony/` through an ohpm `file:` dependency (local linking) or consumes a published package; `import { LhTokens } from '...'` and use it.
