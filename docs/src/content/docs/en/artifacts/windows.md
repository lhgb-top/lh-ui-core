---
title: "Windows Artifacts"
---

**Paths**: `dist/windows/Tokens/LhTokens.cs` and `LhDarkTokens.cs`, plus an extra `LhShadow.cs` when shadow tokens exist and an extra `LhEasing.cs` when Bézier tokens exist

**Namespace**: `Top.Lhgb.Ui.Tokens` (reverse domain name, master plan D20)

## Structure

Nested `public static class` expresses the token hierarchy, with `public static readonly` members:

```csharp
public static class LhTokens {
  public static class Button {
    public static readonly double BorderRadius = 2.0;  // The button's corner radius follows the global radius
    public static class Height {
      public static readonly double Large = 48.0;  // Large button height
      public static readonly double Medium = 40.0;  // Medium button height (default)
      public static readonly double Small = 32.0;  // Small button height
    }
    // ...
  }
  public static class Color {
    public static class Primary {
      public static readonly Windows.UI.Color Default = Windows.UI.Color.FromArgb(0xFF, 0x2B, 0x4C, 0x7C);
    }
  }
}
```

## Member naming rules

`csMemberName(name)`: converts to **PascalCase** (`default → Default`, `extraLarge → ExtraLarge`) and steers around C# contextual keywords like `default` and `base`. Group names go through PascalCase as well.

## Units and literals

| Token type | C# literal | Field type |
| --- | --- | --- |
| Color | `Windows.UI.Color.FromArgb(0xFF, 0x2B, 0x4C, 0x7C)` | `Windows.UI.Color` |
| Dimension (integer) | `40.0` | `double` |
| Dimension (fractional) | `0.5` | `double` |
| Percentage | `0.5  // 50% (a fraction, converted against the container size)` | `double` |
| Duration | `200  // 200ms (milliseconds)` | `int` |
| Bézier | `new LhEasing(0.4, 0, 0.2, 1)` | `LhEasing` |
| Shadow | `new LhShadow(0xFF..., 0.0, 2.0, 8.0)` | `LhShadow` |
| String | `"'Source Code Pro', ..."` | `string` |

Unit conventions: **dimensions are epx (effective pixels; the values are used directly)**, **durations are milliseconds** (the component side uses `TimeSpan.FromMilliseconds(...)`), **colors are ARGB**.

### Why Windows.UI.Color

Windows App SDK 1.6 and below **does not have** a `Microsoft.UI.Color` struct; the properties of the `Microsoft.UI.Colors` color table return `Windows.UI.Color` too. So the token side always uses `Windows.UI.Color` — it ships its own `FromArgb` factory and matches the Colors table's type. On the component side, referencing the Colors table needs `using Microsoft.UI;` (Colors) + `using Windows.UI;` (Color).

## Dark mode: a sibling object

`LhDarkTokens` is an independent object sitting next to `LhTokens`, **containing only the `Color` subclass**:

```csharp
public static class LhDarkTokens {
  public static class Color {
    public static readonly Windows.UI.Color Focus = Windows.UI.Color.FromArgb(0xFF, 0x7F, 0xA6, 0xD9);
    // ...
  }
}
```

Dark mode only overrides colors; **dimensions / motion / radii are unchanged in dark mode** — a component that needs a dark-mode dimension takes the value from the light object. This is exactly consistent with the android / ios / harmony targets.

## Carrier structures

`LhShadow.cs` and `LhEasing.cs` are both `readonly record struct`s (WinUI has no direct equivalent for a composite shadow or a Bézier):

```csharp
public readonly record struct LhShadow(Windows.UI.Color Color, double OffsetX, double OffsetY, double BlurRadius);
public readonly record struct LhEasing(double X1, double Y1, double X2, double Y2);
```

A shadow's `spread` is ignored and documented on every target (the WinUI DropShadow does not support it), e.g. `// spread 0px — WinUI DropShadow does not support it, ignored`.

## How it is consumed

The Windows repository's (`lh-ui-windows`) `pnpm link:tokens` copies the `dist/windows/` tree into `src/Tokens/` (landing in a `Tokens/` subdirectory under the source root), and the component side's `using Top.Lhgb.Ui.Tokens;` points there. The three-level existence guard (local dist → npm `@lh-ui/core` → error) is described in [Local Linking](../guide/local-linking).
