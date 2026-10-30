---
title: "型システム"
---

## 7 つの型

`type` とファイルレベルの `$type` に許されるのは `color` / `dimension` / `number` / `string` / `shadow` / `duration` / `cubicBezier` のみです（`tokens/schema.json` の列挙と 1 対 1 で対応し、`codegen/src/types.ts` の `TokenType` を参照）。

各型の値として合法な形態は [トークンフォーマット](./token-format) を参照してください。

## 3 層の型の優先順位

リーフの型は次の順序で評価されます：

```
1. リーフ自身が宣言した type
2. ref 参照先の型（リーフが自身の type を宣言していない場合のみ）
3. ファイルレベル / グループレベルの $type
4. いずれもない → resolve 段階でエラーを投げる
```

この優先順位は **flatten と resolve の 2 段階の協調**によって実現されています。

### 段階 1：flatten（グループレベルの `$type` の受け渡し）

`load.ts` の `flatten` は、グループ（ファイルルートを含む）が宣言した `$type` をツリーに沿って下へ伝えますが、**リテラルリーフにのみベイクします**：

```ts
// リテラルトークンはグループ型を継承する。ref トークンは undefined のまま保ち、resolve が参照先から型を取る
if (node.type === undefined && node.ref === undefined && groupType !== undefined) {
  out.set(path, { ...node, type: groupType })
}
```

**ref リーフは意図的にベイクしません**——置かれているファイルのデフォルト型に引きずられないためです。

### 段階 2：resolve（ref 参照先の型がファイルレベルのデフォルトを上書き）

`resolve.ts` がライトのマップを組み立てるとき：

```ts
token: {
  type: raw.type ?? (file.defaultType as ResolvedToken['type']),  // まずファイルレベルの $type でフォールバック
  ...
},
ownType: raw.type,  // 「リーフ自身が宣言した型」と「ファイルレベルのデフォルト」を区別する専用フィールド
```

ref を解決した後：

```ts
// 自身が型を宣言していない場合、参照先の型を引き継ぐ（トークンの型は真源に追随する）
if (entry.ownType === undefined && resolved.type !== undefined) {
  entry.token.type = resolved.type
}
```

このステップが**第 2 層（ref 参照先の型）を第 3 層（ファイルレベルの `$type`）の上に載せます**。最後まで型が undefined の場合は `令牌 X 缺少类型`（トークン X に型がない）を投げます。

## なぜ 3 層が必要なのか

典型例：`button.fontWeight` が `typography.fontWeight.primary` を参照する場合：

```json
// components.json（ファイルレベルの $type: dimension）
"button": { "fontWeight": { "ref": "typography.fontWeight.primary" } }

// typography.json
"fontWeight": { "primary": { "value": 400, "type": "number" } }
```

ref リーフもファイルレベルの `dimension` を引き継いでしまうと、`button.fontWeight` の型が誤ってしまいます。3 層の優先順位がこれを**参照先に従って `number` を取る**よう保証します。

もう一つの例として、`typography.json` にはファイルレベルの `$type` がなく、グループレベルの `$type`（`fontSize` グループは `dimension` を指定）とリーフ自身の `type`（`fontWeight.primary` は `number` を持つ）がそれぞれを受け持ちます。

## 意味検証

schema が扱うのは構造だけです。**型と値が一致するか**は `format.ts` の `assertTypedValue` が resolve 段階で 1 つずつアサートし、実際に値を解析します：

- `color` → `parseColor` で解析できること（16 進数または rgba）
- `dimension` → `/^\d+(\.\d+)?(px|%)$/` に一致すること
- `duration` → `s` / `ms` をサポート
- `shadow` → 空白で区切り、4 番目のセグメントが `-?\d+(\.\d+)?px` に一致すれば spread、そうでなければ色
- `cubicBezier` → 4 要素配列

詳しくは [フォーマット層](../codegen/format) を参照してください。

## ダーク側の型推論

ダークのオーバーライドキーの型推論はより単純です：`raw.type ?? byPath.get(path)?.type`。型が欠落したダークキーは codegen を失敗させず、`orphanDarkPaths` に記録され、`pnpm verify:tokens` が報告します。詳しくは [ダークモードのマージ](./dark-mode) を参照してください。
