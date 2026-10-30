---
title: "Android 產物"
---

**路徑**：`dist/android/top/lhgb/ui/tokens/LhTokens.kt` 與 `LhDarkTokens.kt`

**套件名**：`top.lhgb.ui.tokens`（反域名規範，總綱 D20）

## 結構

令牌按路徑層級組織為**巢狀 `object`**，成員為 `val`：

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
    val borderRadius = 2.dp  // 按鈕圓角跟隨全域圓角
    val borderWidth = 1.dp
    object FontSize {
      val large = 16.sp
      val medium = 14.sp
    }
    object Height {
      val medium = 40.dp  // 中號按鈕高度（預設）
      val small = 32.dp  // 小號按鈕高度
    }
  }
  object Color {
    val focus = ComposeColor(0xFF2B4C7C)
  }
}
```

## 命名映射

| 令牌路徑 | Kotlin 成員 |
| --- | --- |
| `button.height.medium` | `LhTokens.Button.Height.medium` |
| `color.primary.default` | `LhTokens.Color.Primary.default` |
| `zIndex.modal` | `LhTokens.ZIndex.modal` |

分組名走 `pascalCase`（僅首字母大寫），成員名保持原樣。

## 單位與字面值

| 令牌類型 | Kotlin 字面值 |
| --- | --- |
| 顏色 | `ComposeColor(0xFF2B4C7C)`（ARGB Int） |
| 尺寸 | `40.dp`；**字級類令牌（路徑含 `fontsize`）用 `.sp`**，其餘 `.dp` |
| 百分數 | `0.50f  // 50%（分數，由容器尺寸換算）` |
| 時長 | `200  // 200ms（毫秒）`（Int） |
| 貝茲 | `CubicBezierEasing(0.4f, 0f, 0.2f, 1f)` |
| 投影 | `Shadow(color = ..., offset = Offset(0f, 2f), blurRadius = 8f)` |
| 數值 / 字串 | 原樣 / `JSON.stringify` |

dp/sp 判定見 `format.ts` 的 `usesSp()`（`/fontsize/i`）。

## import 按需生成

import 清單由**實際用到的執行時類型**決定（`importsFor(features)`），沒用到的類型不匯入：

| 特性 | import |
| --- | --- |
| 顏色 | `androidx.compose.ui.graphics.Color as ComposeColor` |
| 尺寸 | `androidx.compose.ui.unit.dp` + `.sp` |
| 投影 | `androidx.compose.ui.graphics.Shadow` + `androidx.compose.ui.geometry.Offset` |
| 貝茲 | `androidx.compose.animation.core.CubicBezierEasing` |

## 暗色

獨立的 `object LhDarkTokens`，**命名空間結構與明色一致**：

```kotlin
object LhDarkTokens {
  object Color {
    val focus = ComposeColor(0xFF7FA6D9)  // 鍵盤焦點環色，預設跟隨主色
    val selected = ComposeColor(0xFFB1C1D8)  // 選中態文字色，跟隨主色按壓變體
    object Background {
      ...
    }
  }
}
```

暗色只包含被覆蓋的鍵（當前僅 `color.*`），未覆蓋的鍵在暗色下沿用 `LhTokens` 的值。

## 消費方式

Android 倉把 `dist/android/` 目錄作為 Gradle 來源集或本地 maven 依賴引入，`import top.lhgb.ui.tokens.LhTokens` 即可使用。本地連動見 [本地連動](../guide/local-linking)。
