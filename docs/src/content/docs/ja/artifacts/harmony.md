---
title: "HarmonyOS 生成物"
---

**パス**：`dist/harmony/tokens/LhTokens.ets` と `LhDarkTokens.ets`。投影トークンが存在する場合は `LhShadow.ets` を追加生成

**モジュールディレクトリ**：`tokens/`（ohpm モジュール内）

## 構造

ルートは `export class` で、ネストしたクラスに **export は付きません**（ArkTS のクラス本体では export 宣言が許可されていません）。メンバーは `static readonly` です：

```ts
export class LhTokens {
  class Button {
    static readonly borderRadius: Dimension | number = 2  // ボタンの角丸はグローバルの角丸に追随
    static readonly borderWidth: Dimension | number = 1
    class FontSize {
      static readonly large: Dimension | number = 16
      static readonly medium: Dimension | number = 14
    }
    class Height {
      static readonly medium: Dimension | number = 40  // 中サイズのボタンの高さ（デフォルト）
    }
  }
  class Color {
    static readonly focus: ResourceColor = '#FF2B4C7C'
  }
}
```

## 命名マッピング

| トークンパス | ArkTS メンバー |
| --- | --- |
| `button.height.medium` | `LhTokens.Button.Height.medium` |
| `color.primary.default` | `LhTokens.Color.Primary.default` |
| `zIndex.modal` | `LhTokens.ZIndex.modal` |

## 唯一、型注釈を伴うプラットフォーム

ArkTS は強い型付けなので、すべてのメンバーに型注釈が付きます（`typeAnnotation()`）：

| トークン型 | 型注釈 |
| --- | --- |
| color | `ResourceColor` |
| dimension | `Dimension \| number` |
| duration / number | `number` |
| shadow | `LhShadow` |
| cubicBezier | `number[]` |
| string | `string` |

Kotlin / Swift / C はリテラルから自明に型を導けますが、明示的に注記するのは ArkTS だけです。

## 単位とリテラル

| トークン型 | ArkTS リテラル |
| --- | --- |
| 色 | `'#FF2B4C7C'`（ArkUI は `#AARRGGBB` 文字列を受け付けるので `toArgbHash` を通す） |
| 寸法 | 純粋な `vp` の数値（`40`、単位は付けない） |
| 百分率 | `0.500  // 50%（分数。コンテナサイズから換算）` |
| 時間 | `200  // 200ms（ミリ秒）` |
| ベジェ | `[0.4, 0, 0.2, 1]  // ベジェの制御点。コンポーネント側が curves.cubicBezierCurve で消費する` |
| 投影 | `{ color: '#FF000000', radius: 8, offsetX: 0, offsetY: 2 }` |
| 数値 / 文字列 | そのまま / `JSON.stringify` |

## LhShadow.ets

ArkUI にも複合投影の型がないため、**インターフェース**で担います（**静的テンプレートで、トークンの内容は含みません**）：

```ts
export interface LhShadow {
  color: ResourceColor
  /** ぼかし半径 */
  radius: number
  offsetX: number
  offsetY: number
}
```

iOS の `struct LhShadow` と対比すると：ArkTS はインターフェース、SwiftUI は構造体で、それぞれ言語のイディオムに合わせています。

## ダーク

独立した `export class LhDarkTokens` で、構造はライトと同じです：

```ts
export class LhDarkTokens {
  class Color {
    static readonly focus: ResourceColor = '#FF7FA6D9'
    static readonly selected: ResourceColor = '#FFB1C1D8'
    // …オーバーライドされた残りのキー
  }
}
```

オーバーライドされていないキーはダークでも `LhTokens` を引き継ぎます。

## 消費方法

HarmonyOS リポジトリは ohpm の `file:` 依存で `dist/harmony/` を取り込むか（ローカル連携）、公開済みパッケージを消費し、`import { LhTokens } from '...'` ですぐ使えます。
