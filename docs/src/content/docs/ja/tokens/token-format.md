---
title: "トークンフォーマット"
---

各 `tokens/*.json` ファイルはプラットフォーム非依存の中性ソースで、形式は `tokens/schema.json` が厳格に制約します。

## ファイルレベルのメタ属性

`$` で始まるキーはメタ属性であり、トークンを生成しません：

| 属性 | 役割 |
| --- | --- |
| `$schema` | `./schema.json` を指す（エディタの自動補完 + 検証） |
| `$description` | ファイルの説明。docs target とベースラインドキュメントに現れる |
| `$type` | **ファイルレベルのデフォルト型**。自身の `type` を宣言しないリテラルリーフが継承する |
| `$dark` | `true` はこのファイルがダークオーバーライドファイルであることを示す（オーバーライドが必要なキーのみを宣言する） |
| `$namespace` | 名前空間プレフィックス。グローバルのドットパスを決定する（詳しくは [名前空間](./namespace)） |

```json
{
  "$schema": "./schema.json",
  "$namespace": "color",
  "$type": "color",
  "$description": "カラーパレットとセマンティック色",
  "primary": { "default": { "value": "#2B4C7C" } }
}
```

## リーフトークンの 5 つのフィールド

| フィールド | 必須 | 役割 |
| --- | --- | --- |
| `value` | `ref` と**二者択一** | リテラル値 |
| `ref` | `value` と**二者択一** | 別のトークンのフルパスを参照（ビルド期に静的に解決してベイクする） |
| `type` | 任意 | トークンの型。宣言しない場合はファイルレベルの `$type` を継承する |
| `description` | 任意 | 説明。各端の生成物のコメントとドキュメント表にレンダリングされる |
| `nativeOnly` | 任意 | `true` = ネイティブ血脈で追加され、web 血脈に対応する項目がない |

schema は `anyOf: [{required: [value]}, {required: [ref]}]` + `additionalProperties: false` により、各リーフが `value` または `ref` の**いずれか一方のみ**を持ち、余分なフィールドを許さないことを保証します。

## 7 つの型

`type` / `$type` に許されるのはこの 7 つの値だけです：

| 型 | 値の形態 | 例 |
| --- | --- | --- |
| `color` | `#RGB` / `#RRGGBB` / `#AARRGGBB` / `rgba(r,g,b,a)` | `"#2B4C7C"`、`"rgba(61, 100, 158, 0.25)"` |
| `dimension` | **単位付き文字列のみ** `"12px"` / `"50%"`（`assertTypedValue` が文字列を強制する。生の数値は `number` 型でのみ有効） | `"40px"`、`"50%"` |
| `number` | 純粋な数値 | `400`、`1000` |
| `string` | 文字列 | `"PingFang SC"` |
| `shadow` | 空白区切りの投影文字列（`x y blur [spread] color`） | `"0px 2px 12px 0px rgba(26, 26, 26, 0.08)"` |
| `duration` | `"200ms"` / `"0.2s"`（ミリ秒に統一して正規化） | `"200ms"` |
| `cubicBezier` | 4 要素配列 | `[0.4, 0, 0.2, 1]` |

型と値の不一致（`type: color` に `40px` など）は resolve 段階で `assertTypedValue` に拒否されます。詳しくは [型システム](./type-system) を参照してください。

## 中性値の制約（レッドライン 5）

トークン値として**許されるのは中性な表現のみ**です：

- ✅ 16 進数の色値、`rgba()`、`"12px"` / `"50%"` の単位付き文字列、`number` 型での純粋な数値
- ❌ `var()`、`rem`、`sp`、`dp` などのあらゆるプラットフォーム固有の単位や参照

プラットフォーム単位の換算は各 target のテンプレートが担います：

| プラットフォーム | 換算 |
| --- | --- |
| Android | `usesSp()` でフォントサイズには `sp`、それ以外には `dp` を使うと判定 |
| iOS | 寸法は `CGFloat`、時間は**秒に換算**（`(ms/1000)`。SwiftUI のアニメーションは秒単位） |
| HarmonyOS | 寸法は純粋な `vp` の数値 |
| C | 純粋な数値で、コメントで単位を説明（色値 `0xAARRGGBB`、寸法は論理ピクセル、時間はミリ秒） |

## グループのネスト

任意の階層でグループをネストでき、グループも自身の `$type` を宣言してグループ全体のデフォルト型を上書きできます：

```json
"fontSize": {
  "$type": "dimension",
  "base": { "value": "14px" },
  "small": { "value": "13px" }
}
```

`typography.json` にはファイルレベルの `$type` がなく、グループレベルの `$type` かリーフ自身の `type` で個別に宣言します。

## `nativeOnly` マーク

ネイティブ血脈で新規追加され、web 血脈に対応がないトークン（多くはモバイル向けに追加された寸法）に付けます。役割：

- `dist/docs/tokens.md` の説明列に「ネイティブ追加」と注記する
- ファミリーのベースラインドキュメントがここから「ネイティブ新規トークン」の一覧を抽出する
- **各ネイティブ target はフィルタせず**、そのまま生成する

## ファイル一覧

| ファイル | `$namespace` | `$type` | 説明 |
| --- | --- | --- | --- |
| `color.json` | `color`（ファイル名から導出） | `color` | カラーパレットとセマンティック色 |
| `color-dark.json` | `color`（明示。ライトと同じ空間でなければならない） | `color` | ダークのインクリメンタルオーバーライド |
| `components.json` | `""` | `dimension` | コンポーネントレベルのトークン |
| `typography.json` | `typography` | なし（グループ / リーフが個別に宣言） | タイポグラフィ |
| `spacing.json` | `spacing` | `dimension` | 間隔スケール |
| `radius.json` | `radius` | `dimension` | 角丸 |
| `shadow.json` | `shadow` | `shadow` | 投影 |
| `motion.json` | `motion` | なし（グループ / リーフが個別に宣言） | 時間とイージング |
| `z-index.json` | `zIndex`（明示） | `number` | 階層 |
