---
title: "型定義 types.ts"
---

> すべての codegen モジュールが共有する型定義。いかなるプラットフォーム API にも依存せず、ビルド期のツールチェーン内部で使われ、ランタイム生成物には入りません。

[パイプライン概要](./pipeline) では 4 つの中核インターフェース（`CodegenTarget` / `CodegenInput` / `GeneratedFile` / `TokenSet`）を紹介しました。本ページは完全なリファレンスです。

## トークン側

### `TokenType`

```ts
type TokenType =
  | 'color'
  | 'dimension'
  | 'number'
  | 'string'
  | 'shadow'
  | 'duration'
  | 'cubicBezier'
```

`tokens/schema.json` の `$type` / `type` の列挙と 1 対 1 で対応します。各型の中性値の制約は [トークンフォーマット](../tokens/token-format)、解析は [フォーマット層](./format) を参照してください。

### `TokenValue`

```ts
type TokenValue = string | number | number[]
```

トークンの中性値：16 進数の色値 / `rgba()` / 単位付き文字列（`"12px"`、`"50%"`、`"0.3s"`）/ 純粋な数値（`number` 型）/ ベジェの 4 要素配列。あらゆるプラットフォーム固有の構文を禁止します。

### `RawToken`

```ts
interface RawToken {
  value?: TokenValue       // リテラル値（ref と二者択一）
  ref?: string             // 別のトークンのドットパスを参照。ビルド期に静的に解決してベイクする
  type?: TokenType         // 宣言しない場合はファイル / グループレベルの $type を継承
  description?: string
  nativeOnly?: boolean     // ネイティブ血脈での新規追加（web 血脈との対応項目ではない）を表す
}
```

JSON ソースファイル内のリーフトークンで、schema の `token` ノードの直接のマッピングです。`value` と `ref` は排他です（schema の `anyOf` が二者択一を強制）。

### `ResolvedToken`

```ts
interface ResolvedToken {
  path: string             // ドットパス（例 color.primary.default）
  type: TokenType
  value: TokenValue        // ベイク後のリテラル値（ref は展開済み）
  refChain?: string[]      // ref から解決された場合、元の参照パス（間接チェーンを含む）を記録
  description?: string
  nativeOnly?: boolean
}
```

`resolveTokens` の生成物です。`refChain` はトークンが参照を経由してきた場合にのみ存在し、ドキュメントとデバッグで元の参照チェーンをたどるために使います。

### `DarkOverrides`

```ts
type DarkOverrides = Map<string, TokenValue>
```

解析済みのダークオーバーライド：path -> 値。キーはライトの同名パスです（`color-dark.json` の `$namespace` をライトと揃えることで、オーバーライドキーが同じパスに落ちます）。

### `TokenSet`

```ts
interface TokenSet {
  tokens: ResolvedToken[]              // ライトトークン
  byPath: Map<string, ResolvedToken>   // パスによる高速検索
  dark: DarkOverrides                  // path -> ダークオーバーライド値
}
```

`resolveTokens` が返す `ResolveResult.tokenSet` で、すべての target の入力です。`byPath` はダークオーバーライドがライトトークンの型と説明を引くために使います。

## 契約側（specs）

### `ComponentSpec`

```ts
interface ComponentSpec {
  name: string             // 契約の識別子（kebab-case、例 'button'）
  component: string        // 表示名（例 'Button ボタン'）
  since?: string           // 導入バージョン
  description: string
  props: SpecProp[]
  events?: SpecEvent[]
  slots?: SpecSlot[]
  behaviors?: string[]
  tokenRefs?: string[]     // 本コンポーネントが消費するトークンのフルパス
}
```

`specs/<name>.json` の型マッピングで、`loadSpecs()` がロードして schema 検証を行います。

### `SpecProp`

```ts
interface SpecProp {
  name: string
  type: 'string' | 'number' | 'boolean' | 'enum' | 'tokenRef' | 'node' | 'array'
  values?: string[]        // enum のみ：列挙値の集合
  default?: unknown        // デフォルト値（ない場合は省略）
  required?: boolean
  description: string
}
```

`type` は `specs/schema.json` の 7 値の列挙と一致します。うち `tokenRef`（トークンのドットパス）と `node`（ノード参照）は予約値で、現在の 15 契約はいずれも使用していません。

### `SpecEvent`

```ts
interface SpecEvent {
  name: string
  payload?: { name: string; type: SpecProp['type']; description?: string }[]
  description: string
}
```

### `SpecSlot`

```ts
interface SpecSlot {
  name: string
  description: string
}
```

## 用例側（cases）

### `ComponentCases`

```ts
interface ComponentCases {
  component: string        // コンポーネント名。ComponentSpec.name に対応
  cases: GoldenCase[]      // 少なくとも 1 件（schema が minItems: 1 を強制）
}
```

### `GoldenCase`

```ts
interface GoldenCase {
  id: string               // 用例 id（kebab-case、リポジトリ全体で一意）
  name: string             // 人間が読める一文の説明
  given: { props?: Record<string, unknown>; state?: Record<string, unknown> }
  when: {
    action: 'render' | 'click' | 'input' | 'focus' | 'blur' | 'custom'
    target?: string
    payload?: unknown
  }
  then: {
    events?: { name: string; assertion: 'emitted' | 'notEmitted'; times?: number; payload?: unknown }[]
    tokens?: { path: string; applied: boolean }[]
    visible?: boolean
    enabled?: boolean
    text?: string
    notes?: string
  }
}
```

given / when / then の三段構成の型マッピングです。`when.action` の `blur` は予約値で、現在の用例はいずれも使用していません。フィールドの意味は [ケースフォーマット](../cases/case-format) を参照してください。

## codegen の入力と生成物

### `CodegenInput`

```ts
interface CodegenInput {
  tokens: TokenSet
  specs: ComponentSpec[]
  cases: ComponentCases[]
  version: string          // package.json のバージョン番号。各生成物のヘッダーコメントに書き込む
}
```

`main()` が組み立てて各 target の `generate()` に渡します。現在の各 target は `input.tokens` のみを消費し、`specs` / `cases` は将来のコンポーネントドキュメント / 型スケルトン / テスト生成のために予約されています。

### `CodegenTarget`

```ts
interface CodegenTarget {
  name: string             // ログのプレフィックス（例 'android'）
  outDir: string           // dist 配下のサブディレクトリ名
  generate(input: CodegenInput): GeneratedFile[]
}
```

各プラットフォーム target がこのインターフェースを実装します。プラットフォームの追加 = target を 1 つ追加し、`index.ts` の `targets` 配列に加えることです。

### `GeneratedFile`

```ts
interface GeneratedFile {
  relativePath: string     // dist/<outDir>/ からの相対出力パス
  content: string
}
```

## 関連モジュール

| モジュール | 責務 |
| --- | --- |
| [パイプライン概要](./pipeline) | `index.ts` の編成と中核インターフェースの概観 |
| [読み込み層 load.ts](./load) | `RawToken` / `ComponentSpec` / `ComponentCases` を生成 |
| [解析層 resolve.ts](./resolve) | `TokenSet`（`ResolvedToken` + `DarkOverrides`）を生成 |
| [5 つの target](./targets) | `CodegenInput` を消費し、`GeneratedFile` を生成 |
