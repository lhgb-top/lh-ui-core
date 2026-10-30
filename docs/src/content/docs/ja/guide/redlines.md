---
title: "レッドラインと命名規則"
---

## 6 つのレッドライン

### 1. 骨組みのみを生成し、実装は生成しない

codegen は**トークンのバインディング**、props の列挙と型、デフォルト値の定数のみを生成します。**いかなる UI 実装の生成も禁止**——Composable の本体、SwiftUI View の本体、ArkUI コンポーネントの本体、C コンポーネント関数の本体は一切生成しません。UI 実装はすべて各ネイティブリポジトリで手書きします。

このレッドラインは `codegen/src/index.ts` のファイルヘッダーコメントに書かれており、ツールチェーンの自己宣言です。

### 2. トークンの唯一真源は `tokens/*.json`

いかなるプラットフォームも、いかなるコンポーネントも、このリポジトリを迂回して別のトークン値を定めてはなりません。各ネイティブリポジトリは `dist/` 生成物か対応プラットフォームの公開済みパッケージのみを消費でき、**色値 / 間隔 / フォントサイズの手書きは禁止**されます。

### 3. ランタイムの JS はゼロ

このリポジトリの TS コードはビルド時のツールチェーンにしか存在せず、**生成物の中に JavaScript が一つでもあってはなりません**。

### 4. `lh-ui-share` に依存してはならない

二つの血脈は互いに独立しており、相手のいかなる内容も import してはなりません。トークンの初期値は一回限りで手運搬されたシードであり、自動依存関係は一切構築しません。

### 5. JSON にプラットフォーム固有の構文を含めてはならない

トークン値が許されるのは中性な表現のみです：16 進数の色値 / `rgba()` / `number` 型の下での単なる数値 / `dimension` / `duration` / `shadow` の**単位付き文字列**（`"12px"` / `"50%"` / `"200ms"`、`assertTypedValue` が強制、詳しくは [トークンフォーマット](../tokens/token-format)）。`var()`、`rem`、`sp`、`dp` などのいかなるプラットフォーム固有の単位や参照も禁止します。**プラットフォームの単位換算は各 target のテンプレートが責任を負います**（Android の dp/sp 判定、iOS の秒への換算など）。

### 6. `dist/` の手変更禁止

一切の変更は `tokens/` / `specs/` `cases/` またはテンプレートに対して行い、それから `pnpm codegen` を再実行してください。`dist/` は `.gitignore` 対象で、codegen は毎回削除してから再構築します。

## 命名規則（マスタープラン D20）

### プラットフォームのパッケージ名 / 識別子

プラットフォームのパッケージ名は一律にリバースドメイン `top.lhgb.ui` です：

| プラットフォーム | パッケージ名 / 識別子 |
| --- | --- |
| Android | `package top.lhgb.ui.tokens`、生成物ディレクトリ `dist/android/top/lhgb/ui/tokens/` |
| iOS | `Sources/LhUITokens/`（SwiftPM のディレクトリ慣例） |
| HarmonyOS | `tokens/`（ohpm モジュール内） |
| C | `include/lh_ui/` |

### 自前の定数 / クラス / 列挙のプレフィックス

一律に **LH プレフィックス**。各言語の慣例に従って大文字小文字を決めます：

| 言語 | 慣例 | 例 |
| --- | --- | --- |
| Kotlin | `Lh*`（PascalCase） | `object LhTokens`、`object LhDarkTokens` |
| Swift | `Lh*`（PascalCase） | `public enum LhTokens`、`struct LhShadow` |
| ArkTS | `Lh*`（PascalCase） | `export class LhTokens`、`interface LhShadow` |
| C | `LH_*`（すべて大文字のスネークケース） | `LH_COLOR_PRIMARY_DEFAULT`、`LH_Z_INDEX_MODAL` |

npm / ohpm の `@lh-ui/*` scope はこの制約の対象外です（npm はリバースドメインを使いません）。

### C マクロの命名規則

`zIndex.modal` → `LH_Z_INDEX_MODAL`：まず `.` をアンダースコアに変え、次に各大文字の前にアンダースコアを補い、最後にすべて大文字にします。詳しくは [C 生成物](../artifacts/c) を参照してください。

## JSON の命名制約

各層の schema が正規表現で命名を厳格に制約します：

| 層 | フィールド | ルール |
| --- | --- | --- |
| spec | `name` | kebab-case：`^[a-z][a-z0-9-]*$` |
| spec | `component` | Lh プレフィックス付き PascalCase：`^Lh[A-Z][a-zA-Z0-9]*$` |
| spec | prop 名 | camelCase：`^[a-z][a-zA-Z0-9]*$` |
| spec | event 名 | `^on[A-Z][a-zA-Z0-9]*$` |
| case | `id` | kebab-case |
| case | `component` | 同名 spec の `name` と一致しなければならない |

## コメントとドキュメントの言語

コメント、ドキュメント、コミットメッセージは一律に**中国語**（ファミリーのマスタープランの要求による）。
