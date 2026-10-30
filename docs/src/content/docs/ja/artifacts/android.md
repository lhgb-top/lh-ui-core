---
title: "Android 生成物"
---

**パス**：`dist/android/top/lhgb/ui/tokens/LhTokens.kt` と `LhDarkTokens.kt`

**パッケージ名**：`top.lhgb.ui.tokens`（リバースドメイン規範、マスタープラン D20）

## 構造

トークンはパスの階層に沿って**ネストした `object`** として組織され、メンバーは `val` です：

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
    val borderRadius = 2.dp  // ボタンの角丸はグローバルの角丸に追随
    val borderWidth = 1.dp
    object FontSize {
      val large = 16.sp
      val medium = 14.sp
    }
    object Height {
      val medium = 40.dp  // 中サイズのボタンの高さ（デフォルト）
      val small = 32.dp  // 小サイズのボタンの高さ
    }
  }
  object Color {
    val focus = ComposeColor(0xFF2B4C7C)
  }
}
```

## 命名マッピング

| トークンパス | Kotlin メンバー |
| --- | --- |
| `button.height.medium` | `LhTokens.Button.Height.medium` |
| `color.primary.default` | `LhTokens.Color.Primary.default` |
| `zIndex.modal` | `LhTokens.ZIndex.modal` |

グループ名は `pascalCase`（先頭の文字だけ大文字）を通し、メンバー名は元のまま保ちます。

## 単位とリテラル

| トークン型 | Kotlin リテラル |
| --- | --- |
| 色 | `ComposeColor(0xFF2B4C7C)`（ARGB Int） |
| 寸法 | `40.dp`。**フォントサイズ系のトークン（パスに `fontsize` を含む）は `.sp`**、それ以外は `.dp` |
| 百分率 | `0.50f  // 50%（分数。コンテナサイズから換算）` |
| 時間 | `200  // 200ms（ミリ秒）`（Int） |
| ベジェ | `CubicBezierEasing(0.4f, 0f, 0.2f, 1f)` |
| 投影 | `Shadow(color = ..., offset = Offset(0f, 2f), blurRadius = 8f)` |
| 数値 / 文字列 | そのまま / `JSON.stringify` |

dp / sp の判定は `format.ts` の `usesSp()`（`/fontsize/i`）を参照してください。

## import は必要に応じて生成

import 一覧は**実際に使われるランタイム型**で決まり（`importsFor(features)`）、使われない型は import しません：

| 機能 | import |
| --- | --- |
| 色 | `androidx.compose.ui.graphics.Color as ComposeColor` |
| 寸法 | `androidx.compose.ui.unit.dp` + `.sp` |
| 投影 | `androidx.compose.ui.graphics.Shadow` + `androidx.compose.ui.geometry.Offset` |
| ベジェ | `androidx.compose.animation.core.CubicBezierEasing` |

## ダーク

独立した `object LhDarkTokens` で、**名前空間の構造はライトと同じ**です：

```kotlin
object LhDarkTokens {
  object Color {
    val focus = ComposeColor(0xFF7FA6D9)  // キーボードフォーカスリングの色。デフォルトで主色に追随
    val selected = ComposeColor(0xFFB1C1D8)  // 選択状態の文字色。主色の押下バリアントに追随
    object Background {
      ...
    }
  }
}
```

ダークが含むのはオーバーライドされたキーだけ（現在は `color.*` のみ）で、オーバーライドされていないキーはダークでも `LhTokens` の値を引き継ぎます。

## 消費方法

Android リポジトリは `dist/android/` ディレクトリを Gradle のソースセットまたはローカル maven 依存として取り込み、`import top.lhgb.ui.tokens.LhTokens` ですぐ使えます。ローカル連携は [ローカル連携](../guide/local-linking) を参照してください。
