---
title: "契約フォーマット"
---

各 `specs/<name>.json` はコンポーネントの**クロスプラットフォーム契約**です。形式は `specs/schema.json` が厳格に制約します。

## トップレベルの構造

```json
{
  "$schema": "./schema.json",
  "name": "button",
  "component": "LhButton",
  "since": "0.1.0",
  "description": "ボタン：即時の操作をトリガーし、タイプ、サイズ、読み込み、無効化、アイコン、紋様背景をサポートする。",
  "props": [ ... ],
  "events": [ ... ],
  "slots": [ ... ],
  "behaviors": [ ... ],
  "tokenRefs": [ ... ]
}
```

| フィールド | 必須 | 制約 |
| --- | --- | --- |
| `name` | はい | kebab-case：`^[a-z][a-z0-9-]*$`、ファイル名と一致 |
| `component` | はい | Lh プレフィックス付き PascalCase：`^Lh[A-Z][a-zA-Z0-9]*$` |
| `description` | はい | 中国語の説明 |
| `props` | はい | 配列で、少なくとも 1 項目（schema が `minItems: 1` で強制） |
| `since` | いいえ | 導入バージョン |
| `events` / `slots` / `behaviors` / `tokenRefs` | いいえ | 下記参照 |

`additionalProperties: false`——余分なフィールドは許可されません。

## props

```json
{ "name": "size", "type": "enum", "values": ["small", "medium", "large"], "default": "medium", "description": "ボタンサイズ" }
```

| フィールド | 必須 | 説明 |
| --- | --- | --- |
| `name` | はい | camelCase：`^[a-z][a-zA-Z0-9]*$`、**5 端で統一** |
| `type` | はい | 下の表を参照 |
| `description` | はい | 中国語の説明 |
| `values` | いいえ | `type: enum` のときの列挙値（文字列リテラルの配列） |
| `items` | `type: array` のとき**必須** | 配列要素の型（`string` / `number` / `boolean`）+ 説明 |
| `default` | いいえ | デフォルト値（任意の JSON 型）。省略するとデフォルト値なしを意味する |
| `required` | いいえ | ブール値、デフォルトは `false` |

**7 種類の prop 型**：

| 型 | 意味 | 各端のマッピング |
| --- | --- | --- |
| `string` | 文字列 | `String` / `String` / `string` / `const char*` |
| `number` | 数値 | `Int` / `Double` / `number` / `int` |
| `boolean` | ブール値 | `Boolean` / `Bool` / `boolean` / `bool` |
| `enum` | 列挙（`values` が必要） | 各端が対応する列挙型を生成 |
| `tokenRef` | トークンのドットパス | トークン参照。verify 時にパスの存在を検査（**予約済み、現在使用しているコンポーネントはない**） |
| `node` | スロット / 子ノードの内容 | Compose content、SwiftUI ViewBuilder、ArkUI Builder、C の子ノードハンドル（**予約済み、現在使用しているコンポーネントはない**） |
| `array` | 配列（`items` が必要） | ピッカーの候補項目など |

## events

```json
{
  "name": "onValueChange",
  "payload": [{ "name": "value", "type": "string", "description": "変更後のテキスト" }],
  "description": "テキストが変化したときに発火。disabled または readonly が true のときは発火しない"
}
```

- `name`：`^on[A-Z][a-zA-Z0-9]*$`、**5 端で統一**
- `payload`：フィールドの配列（各項目は `name` + `type` + 任意の `description`）。**空の配列はペイロードなしを意味する**
- `description`：必須

## slots

```json
{ "name": "prefix", "description": "入力欄のプレフィックス内容（左側の非入力領域）" }
```

`name` も同様に camelCase です。slot の**端側の実装**は `node` 型の prop か、各端のスロット機構が担います。

## behaviors

自然言語による振る舞いの説明の配列で、cases の抽出とドキュメント生成に使われます：

```json
"behaviors": [
  "disabled が true のとき：クリックに反応せず、無効スタイル（disabled.* トークン）を適用し、onClick を発火しない",
  "size のマッピング：small/medium/large はそれぞれ button.height.<size> などの寸法トークンを取る"
]
```

## tokenRefs

本コンポーネントが消費するトークンの**フルパス**のリストで、`pnpm verify:specs` が参照の整合性を検査します：

```json
"tokenRefs": ["button.height.medium", "color.primary.default", "color.onPrimary"]
```

## なぜ命名がこれほど厳格なのか

すべての命名正規表現は**クロスプラットフォームの位置合わせ**のためのものです：`name` はファイル名と各端のテスト命名を決め、`component` は各端のクラス名の基礎となり、prop 名とイベント名は 5 端で一致して初めて cases をそのまま翻訳できます。

## 現在のコンポーネント一覧

15 のコンポーネント：button、cell、checkbox、dialog、icon、input、loading、navbar、picker、radio、switch、tag、text、textarea、toast。すべての契約は [コンポーネント契約リファレンス](./reference) を参照してください。
