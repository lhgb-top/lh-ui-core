---
title: "解析層 resolve.ts"
---

> 参照の解決とダークのマージ。

`resolveTokens(files: LoadedTokenFile[]): ResolveResult` が中核関数で、3 段構成です：

## 戻り値

```ts
interface ResolveResult {
  tokenSet: TokenSet                    // ライトトークンセット + ダークオーバーライド表
  orphanDarkPaths: string[]             // 孤児ダークパス（verify の報告用）
  refMap: Map<string, string>           // path -> 元の ref 文字列（ダークキーには dark: プレフィックスが付く）
}
```

## 第 1 段：ライトの折り畳み

すべての非ダークファイルの `flat` を単一の `rawMap` へマージします：

```ts
if (rawMap.has(path)) throw new Error(`令牌路径重复定义：${path}（文件 ${file.fileName}）`)
```

各レコードは 3 つの値を持ちます：

| フィールド | 意味 |
| --- | --- |
| `token` | 組み立て中の `ResolvedToken`（型はまず `raw.type ?? file.defaultType` でフォールバック） |
| `raw` / `ref` | 元の値と参照文字列 |
| `ownType` | **リーフ自身が宣言した type**。「リーフ自身が宣言したもの」と「ファイルレベルのデフォルト」を区別する専用フィールド |

`ownType` は 3 層の型優先順位の鍵です：ref を解決した後、**`ownType === undefined` のときのみ**参照先の型を引き継ぎます。

## 第 2 段：ref の解決

インライン関数 `resolveRef(path, chain): { value, type? }`：

1. `rawMap.get(path)` が存在しない → `引用的令牌不存在：<path>`（参照先のトークンが存在しない）を投げる
2. 対象自体も ref → 再帰的に `resolveRef(entry.ref, [...chain, path])`
3. `chain.includes(path)` → `检测到令牌引用环：a -> b -> a`（トークン参照の循環を検出）を投げる
4. リテラル値に到達 → `{ value, type }` を返す

メインループは ref を持つ各エントリに対して：

```ts
refMap.set(path, entry.ref)                    // 参照関係を記録
const resolved = resolveRef(entry.ref, [path])
entry.token.value = resolved.value             // リテラル値へベイク
entry.token.refChain = [entry.ref]             // 参照チェーンを記録
if (entry.ownType === undefined && resolved.type !== undefined) {
  entry.token.type = resolved.type             // 型は真源に追随する
}
```

最後に：

```ts
if (entry.token.type === undefined) {
  throw new Error(`令牌 ${path} 缺少类型（既无自身 type 也无文件级 $type）`)
}
assertTypedValue(entry.token.type, value)      // 意味検証
```

結果は path の辞書順にソートし、あわせて `byPath` インデックスを構築します。

## 第 3 段：ダークオーバーライド

ダークファイルは**オーバーライドが必要なキーだけを宣言**します。

**ダーク名前空間ビュー**：まずすべてのダークファイルの `flat` をもう一度折り畳んで `darkRawMap`（`path -> { value, ref }`）にします。

**インライン関数 `resolveDarkRef(path, chain): TokenValue`**——ダーク ref のローカル解決：

| 状況 | 振る舞い |
| --- | --- |
| 対象が `darkRawMap` にあり、かつ ref | **ダーク名前空間内**でチェーンを再帰的にたどる（ダークがダークを参照して初めて同一テーマの値になる）。同様に循環検出を行う |
| 対象が `darkRawMap` にあり、かつリテラル値 | ダーク値を返す |
| 対象が `darkRawMap` に**ない** | **ライト名前空間へフォールバック**して `resolveRef(path, chain).value` |

**ダークエントリの走査**：

```ts
if (raw.ref) {
  // 対象は byPath / rawMap / darkRawMap のいずれかに存在しなければならない
  if (!byPath.has(raw.ref) && !rawMap.has(raw.ref) && !darkRawMap.has(raw.ref)) {
    throw new Error(`暗色令牌 ${path} 引用不存在：${raw.ref}`)
  }
  value = resolveDarkRef(raw.ref, [path])
  refMap.set(`dark:${path}`, raw.ref)    // ダークキーにはプレフィックスが付く
}
const type = raw.type ?? byPath.get(path)?.type
if (!type) { orphanDarkPaths.push(path); continue }   // 型がない → そのキーをスキップ
assertTypedValue(type, value)
if (!byPath.has(path)) orphanDarkPaths.push(path)     // 孤児 → それでもオーバーライド表に書き込む
dark.set(path, value)
```

## 孤児ダークパス

2 種類の異常は **codegen を中断せず**、`orphanDarkPaths` に記録して `pnpm verify:tokens` に報告を委ねます：

- ダークキーに**型がない**（自身の type もなく、ライトセットに同名キーもなく継承できない）→ **そのキーをスキップし、オーバーライド表に書き込まない**
- ダークキーがライトセットに**存在しない**（孤児）→ **それでもオーバーライド表に書き込む**が、報告する

詳しくは [ダークモードのマージ](../tokens/dark-mode) を参照してください。

## 各端が `dark` をどう消費するか

`dark` はフラットな `Map<path, TokenValue>` で、各端の target がそれぞれの出し方を決めます（Kotlin / Swift / ArkTS は独立した `LhDarkTokens` 名前空間、C は同名マクロの再定義）。詳しくは [5 つの target](./targets) を参照してください。
