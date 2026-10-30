---
title: "Android Artifacts"
---

**Paths**: `dist/android/top/lhgb/ui/tokens/LhTokens.kt` and `LhDarkTokens.kt`

**Package name**: `top.lhgb.ui.tokens` (the reverse-domain-name convention, master plan D20)

## Structure

Tokens are organized by path hierarchy into **nested `object`s**, with `val` members:

```kotlin
package top.lhgb.ui.tokens

import androidx.compose.ui.graphics.Color as ComposeColor
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.graphics.Shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.animation.core.CubicBezierEasing

object LhTokens {
  object Button {
    val borderRadius = 2.dp  // The button's corner radius follows the global radius
    val borderWidth = 1.dp
    object FontSize {
      val large = 16.sp
      val medium = 14.sp
    }
    object Height {
      val medium = 40.dp  // Medium button height (default)
      val small = 32.dp  // Small button height
    }
  }
  object Color {
    val focus = ComposeColor(0xFF2B4C7C)
  }
}
```

## Name mapping

| Token path | Kotlin member |
| --- | --- |
| `button.height.medium` | `LhTokens.Button.Height.medium` |
| `color.primary.default` | `LhTokens.Color.Primary.default` |
| `zIndex.modal` | `LhTokens.ZIndex.modal` |

Group names go through `pascalCase` (only the first letter capitalized); member names stay as-is.

## Units and literals

| Token type | Kotlin literal |
| --- | --- |
| Color | `ComposeColor(0xFF2B4C7C)` (an ARGB Int) |
| Dimension | `40.dp`; **font-size tokens (the path contains `fontsize`) use `.sp`**, everything else `.dp` |
| Percentage | `0.50f  // 50% (a fraction, converted against the container size)` |
| Duration | `200  // 200ms (milliseconds)` (an Int) |
| Bézier | `CubicBezierEasing(0.4f, 0f, 0.2f, 1f)` |
| Shadow | `Shadow(color = ..., offset = Offset(0f, 2f), blurRadius = 8f)` |
| Number / string | as-is / `JSON.stringify` |

For the dp/sp decision see `usesSp()` in `format.ts` (`/fontsize/i`).

## Imports generated on demand

The import list is decided by the **runtime types actually in use** (`importsFor(features)`); types that are not used are not imported:

| Feature | import |
| --- | --- |
| Color | `androidx.compose.ui.graphics.Color as ComposeColor` |
| Dimension | `androidx.compose.ui.unit.dp` + `.sp` |
| Shadow | `androidx.compose.ui.graphics.Shadow` + `androidx.compose.ui.geometry.Offset` |
| Bézier | `androidx.compose.animation.core.CubicBezierEasing` |

## Dark mode

A separate `object LhDarkTokens`, **with the same namespace structure as the light side**:

```kotlin
object LhDarkTokens {
  object Color {
    val focus = ComposeColor(0xFF7FA6D9)  // Keyboard focus ring color; follows the primary color by default
    val selected = ComposeColor(0xFFB1C1D8)  // Selected-state text color; follows the pressed variant of the primary color
    object Background {
      ...
    }
  }
}
```

Dark mode contains only the overridden keys (currently `color.*` only); keys that are not overridden keep the `LhTokens` value in dark mode.

## How it is consumed

The Android repository includes the `dist/android/` directory as a Gradle source set or a local maven dependency; `import top.lhgb.ui.tokens.LhTokens` and use it. For local linking see [Local Linking](../guide/local-linking).
