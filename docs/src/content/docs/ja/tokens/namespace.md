---
title: "名前空間とドットパス"
---

## ルール

**トークンのグローバルなドットパス = `$namespace` + ファイル内のネストパス。**

```
tokens/color.json        "$namespace": "color"
                         primary.default.value = "#2B4C7C"
                         → フルパス color.primary.default

tokens/z-index.json      "$namespace": "zIndex"
                         modal.value = 1050
                         → フルパス zIndex.modal
```

ファイルをまたぐすべての参照（`ref`、spec の `tokenRefs`、cases の `then.tokens`）は**必ずフルパスで書く**必要があります。

## 名前空間の 3 つのケース

### 1. 省略時：ファイル名から導出

`$namespace` を宣言しない場合、ファイル名を `-` で区切って導出します（`namespaceFromFileName`）：先頭のセグメントはそのまま、残りのセグメントは先頭を大文字にします。

| ファイル名 | 導出結果 |
| --- | --- |
| `color.json` | `color` |
| `z-index.json` | `zIndex` |
| `typography.json` | `typography` |
| `color-dark.json` | `colorDark`（**導出値だが、実際には使われない**） |

導出はあくまで**フォールバック**です——ダークファイルは必ず `$namespace` を明示的に宣言してライトと揃えます（下記参照）。

### 2. 明示的な宣言

`$namespace` を直接書きます：

```json
{ "$namespace": "zIndex", "modal": { "value": 1050 } }
```

**ダークファイルはライトファイルと同じ `$namespace` を明示的に宣言しなければなりません**。そうでないと、オーバーライドするキーが同じパスに落ちません：

```json
// color-dark.json
{ "$namespace": "color", "$dark": true, "primary": { "default": { "value": "#3D649E" } } }
```

これにより `color.primary.default` のダークオーバーライドが、ライトの同じパスへ正しくマージされます。

### 3. 空文字列：トップレベルのキーがそのまま名前空間

`components.json` は `"$namespace": ""` を宣言しているため、**トップレベルのキーがコンポーネント名前空間**になり、フルパスはそのまま `button.height.medium`、`input.borderRadius` となります：

```json
{
  "$namespace": "",
  "$type": "dimension",
  "button": {
    "height": { "medium": { "value": "40px" } }
  }
}
```

## 名前空間が実際に及ぼす影響

- **`dist/docs/tokens.md`** がトップレベルの名前空間ごとに `##` の節（button / color / motion / zIndex …）を分ける
- **resolve 段階**がフルパスで重複を検出する：2 つのライトファイルに同じパスが現れたら即座にエラーを投げる
- **ダークのマージ**がフルパスでオーバーライドキーを照合する
- **各端の target** がパスのセグメントでネスト構造を組み立てる（Android `object Color`、Swift `enum Color`、C `LH_COLOR_*`）

## 完全な例

```
color.primary.active          ← color.json
button.height.medium          ← components.json（空文字列の名前空間）
typography.fontSize.base      ← typography.json
zIndex.modal                  ← z-index.json（明示）
motion.easing.easeInOut       ← motion.json（グループのネスト）
```

[トークンリファレンス](./reference) ページでは、名前空間ごとにすべてのトークンをそのまま閲覧できます。
