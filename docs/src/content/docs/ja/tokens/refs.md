---
title: "参照メカニズム"
---

## `ref` とは

リーフは `value` を書く代わりに `ref` を書き、別のトークンの**フルパス**を指せます：

```json
"selected": { "ref": "color.primary.active", "description": "選択状態の文字色。主色の押下バリアントに追随する" }
```

ビルド期に `ref` は**静的に解決され、リテラル値としてベイクされます**——各端の生成物に見えるのはすでに解決済みの値で、**ランタイムの間接参照はゼロ**です。

## 解決アルゴリズム

`resolve.ts` のインライン関数 `resolveRef(path, chain)`：

1. 対象パスが存在しない → `引用的令牌不存在：<path>`（参照先のトークンが存在しない）を投げる
2. 対象自体も ref → **再帰的に**チェーンを下る（任意の長さの間接チェーンに対応）
3. チェーンに現在のパスがすでに含まれている → `检测到令牌引用环：a -> b -> a`（トークン参照の循環を検出）を投げる
4. リテラル値に到達 → `{ value, type }` を返す

## 間接チェーン

```json
"a": { "ref": "b" },
"b": { "ref": "c" },
"c": { "value": "#2B4C7C" }
```

`a` はチェーンをたどって `c` のリテラル値まで解決されます。

## 循環検出

```json
"a": { "ref": "b" },
"b": { "ref": "a" }
```

resolve 時に `chain.includes(path)` がヒットし、`检测到令牌引用环：a -> b -> a` を投げて codegen は即座に失敗します。

## ベイク結果

解決結果は `token.value` に書き込まれ、あわせて `refChain`（`ResolvedToken.refChain`、例 `["color.primary.active"]`）が記録されます。各端の生成物にはリテラル値しかなく、ref は見えません：

```kotlin
// button.borderRadius は radius.base（2px）を参照。ベイク後：
val borderRadius = 2.dp  // ボタンの角丸はグローバルの角丸に追随
```

## 型は真源に追随する

ref リーフが自身の `type` を宣言していない場合、**型は参照先の型を取ります**（3 層優先順位の第 2 層。詳しくは [型システム](./type-system)）。

## refMap

`resolveTokens` が返す `refMap` は、解決されたすべての参照関係（`path -> 元の ref 文字列`、ダークキーには `dark:` プレフィックスが付く）を記録し、ドキュメントと `pnpm verify:tokens` に使われます。

## 実際の使い方

`tokens/` における ref の典型的な場面：

| 場面 | 例 |
| --- | --- |
| コンポーネントがグローバル量に追随 | `button.borderRadius` → `radius.base` |
| 状態がセマンティック色に追随 | `color.selected` → `color.primary.active` |
| コンポーネントのフォントサイズがタイポグラフィに追随 | `button.fontSize.small` → `typography.fontSize.small` |

**いかなる参照もフルパスで書く必要があります**（名前空間 + ネストパス）。詳しくは [名前空間](./namespace) を参照してください。
