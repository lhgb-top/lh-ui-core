---
title: "Android 产物"
---

**路径**：`dist/android/top/lhgb/ui/tokens/LhTokens.kt` 与 `LhDarkTokens.kt`

**包名**：`top.lhgb.ui.tokens`（反域名规范，总纲 D20）

## 结构

令牌按路径层级组织为**嵌套 `object`**，成员为 `val`：

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
    val borderRadius = 2.dp  // 按钮圆角跟随全局圆角
    val borderWidth = 1.dp
    object FontSize {
      val large = 16.sp
      val medium = 14.sp
    }
    object Height {
      val medium = 40.dp  // 中号按钮高度（默认）
      val small = 32.dp  // 小号按钮高度
    }
  }
  object Color {
    val focus = ComposeColor(0xFF2B4C7C)
  }
}
```

## 命名映射

| 令牌路径 | Kotlin 成员 |
| --- | --- |
| `button.height.medium` | `LhTokens.Button.Height.medium` |
| `color.primary.default` | `LhTokens.Color.Primary.default` |
| `zIndex.modal` | `LhTokens.ZIndex.modal` |

分组名走 `pascalCase`（仅首字母大写），成员名保持原样。

## 单位与字面量

| 令牌类型 | Kotlin 字面量 |
| --- | --- |
| 颜色 | `ComposeColor(0xFF2B4C7C)`（ARGB Int） |
| 尺寸 | `40.dp`；**字号类令牌（路径含 `fontsize`）用 `.sp`**，其余 `.dp` |
| 百分数 | `0.50f  // 50%（分数，由容器尺寸换算）` |
| 时长 | `200  // 200ms（毫秒）`（Int） |
| 贝塞尔 | `CubicBezierEasing(0.4f, 0f, 0.2f, 1f)` |
| 投影 | `Shadow(color = ..., offset = Offset(0f, 2f), blurRadius = 8f)` |
| 数值 / 字符串 | 原样 / `JSON.stringify` |

dp/sp 判定见 `format.ts` 的 `usesSp()`（`/fontsize/i`）。

## import 按需生成

import 清单由**实际用到的运行时类型**决定（`importsFor(features)`），没用到的类型不导入：

| 特性 | import |
| --- | --- |
| 颜色 | `androidx.compose.ui.graphics.Color as ComposeColor` |
| 尺寸 | `androidx.compose.ui.unit.dp` + `.sp` |
| 投影 | `androidx.compose.ui.graphics.Shadow` + `androidx.compose.ui.geometry.Offset` |
| 贝塞尔 | `androidx.compose.animation.core.CubicBezierEasing` |

## 暗色

独立的 `object LhDarkTokens`，**命名空间结构与明色一致**：

```kotlin
object LhDarkTokens {
  object Color {
    val focus = ComposeColor(0xFF7FA6D9)  // 键盘焦点环色，默认跟随主色
    val selected = ComposeColor(0xFFB1C1D8)  // 选中态文字色，跟随主色按压变体
    object Background {
      ...
    }
  }
}
```

暗色只包含被覆盖的键（当前仅 `color.*`），未覆盖的键在暗色下沿用 `LhTokens` 的值。

## 消费方式

Android 仓把 `dist/android/` 目录作为 Gradle 源集或本地 maven 依赖引入，`import top.lhgb.ui.tokens.LhTokens` 即可使用。本地联动见 [本地联动](../guide/local-linking)。
