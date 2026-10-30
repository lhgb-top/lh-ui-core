---
title: "テンプレート一覧"
---

`codegen/templates/` の下に **8 つの Handlebars テンプレート**があり、**カスタム helper は一切登録していません**（組み込みの `{{#each}}` と三重波括弧 `{{{ }}}` のみ）。

## テンプレート → 生成物 → データフィールド

| テンプレート | レンダリングされる生成物 | データフィールド |
| --- | --- | --- |
| `android/LhTokens.kt.hbs` | `LhTokens.kt` **および** `LhDarkTokens.kt`（ライト / ダーク共用） | `{ version, source, package, imports[], body }` |
| `ios/LhTokens.swift.hbs` | `LhTokens.swift` と `LhDarkTokens.swift` | `{ version, source, body }` |
| `ios/LhShadow.swift.hbs` | `LhShadow.swift`（静的テンプレート、body スロットなし） | `{ version, source }` |
| `harmony/LhTokens.ets.hbs` | `LhTokens.ets` と `LhDarkTokens.ets` | `{ version, source, body }` |
| `harmony/LhShadow.ets.hbs` | `LhShadow.ets`（静的テンプレート） | `{ version, source }` |
| `windows/LhTokens.cs.hbs` | `LhTokens.cs` と `LhDarkTokens.cs` | `{ version, source, namespace, body }` |
| `windows/LhShadow.cs.hbs` | `LhShadow.cs`（静的テンプレート） | `{ version, source, namespace }` |
| `windows/LhEasing.cs.hbs` | `LhEasing.cs`（静的テンプレート） | `{ version, source, namespace }` |

## 統一されたヘッダーバナー

すべてのテンプレートの先頭に同じコメントブロックがあります：

```
// =====================================================================================
// このファイルは @lh-ui/core が自動生成したものです（ビルド期 codegen）。手で変更しないでください。
// 源：{{{source}}} @ v{{{version}}}
// 変更する場合は lh-ui-core リポジトリの tokens/*.json を編集し、pnpm codegen を再実行してください。
// =====================================================================================
```

これは `dist/` の手変更禁止（レッドライン 6）のコードレベルでの宣言です。

## ライト / ダーク共用テンプレート

**android / ios / harmony / windows のライトとダークの生成物は同じテンプレートを共有し**、違いは渡される `body` だけです（ルートの object / enum / class 名が異なります）。

## 静的テンプレート（キャリア構造）

`ios/LhShadow.swift.hbs`、`harmony/LhShadow.ets.hbs`、`windows/LhShadow.cs.hbs`、`windows/LhEasing.cs.hbs` には **body スロットがなく**、内容は完全に静的です：

```handlebars
{{!-- harmony/LhShadow.ets.hbs --}}
/// 投影トークンの構造
export interface LhShadow {
  color: ResourceColor
  /** ぼかし半径 */
  radius: number
  offsetX: number
  offsetY: number
}
```

SwiftUI / ArkUI / WinUI にはいずれも「複合投影」や「ベジェ」に直接対応する型がないため、端側のキャリアが必要になります。一方 Android の投影はプラットフォーム API なので、追加ファイルは不要です。Windows の 2 つのキャリアはいずれも `readonly record struct` です：

```handlebars
{{!-- windows/LhShadow.cs.hbs --}}
public readonly record struct LhShadow(Windows.UI.Color Color, double OffsetX, double OffsetY, double BlurRadius);
```

## テンプレートの例

```handlebars
{{!-- android/LhTokens.kt.hbs --}}
// ヘッダーバナー…

package {{{package}}}

{{#each imports}}
{{{this}}}
{{/each}}

{{{body}}}
```

```handlebars
{{!-- windows/LhTokens.cs.hbs --}}
// ヘッダーバナー…

namespace {{{namespace}}};

{{{body}}}
```

## 設計原則

- **薄いテンプレート**：担うのはファイルの骨組み（ヘッダーコメント、package / namespace、ガードの開閉）だけで、トークンごとのリテラルのフォーマットは target の TS 側で完了させて `body` としてテンプレートに渡します。詳しくは [レンダリング層](./render) を参照。
- **`noEscape: true`**：テンプレートには `<` `>` `#` などの文字（`#ifndef`、`#define`、ジェネリクスの山括弧）が含まれるため、HTML エスケープを必ず無効にします。
- **コンパイルキャッシュ**：`render.ts` の `loadTemplate` がコンパイル結果をキャッシュし、再コンパイルを避けます。

## テンプレートを追加するには

1. `codegen/templates/<platform>/` に `.hbs` ファイルを追加する
2. 対応する target でデータを組み立て、`render('<platform>/<name>.hbs', data)` を呼ぶ
3. `pnpm codegen` を実行して生成物を確認し、`pnpm test -- -u` でスナップショットを更新する
