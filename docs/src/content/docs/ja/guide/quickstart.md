---
title: "クイックスタート"
---

## 環境要件

- Node.js `>= 22.12`（ドキュメントサイトは Astro 7 を使用、これは必須条件）
- pnpm `10.x`（リポジトリは `pnpm@10.34.5` にロック）

## インストール

```bash
pnpm install
```

このリポジトリは**ランタイムの依存関係がゼロ**（`dependencies` が空）で、インストールされるものはすべてビルド時のツールチェーン（tsx、ajv、handlebars、vitest、astro など）です。

## codegen を一度実行する

```bash
pnpm codegen
```

このコマンドは `tsx codegen/src/index.ts` を実行します。完全な流れは以下の通りです：

1. `package.json` のバージョン番号を読み取る
2. `tokens/*.json` を読み込み、校驗する（Ajv による構造校驗）
3. ref を解決し、ダークモードをマージする（意味的校驗：型と値の一致、参照の整合性、循環検出）
4. `specs/*.json` と `cases/*.json` を読み込み、校驗する
5. **`dist/` 全体を削除して再構築する**
6. 5 つの target を順に実行する（android → ios → harmony → c → docs）

出力は `dist/` にあります：

```
  [android] android/top/lhgb/ui/tokens/LhTokens.kt
  [android] android/top/lhgb/ui/tokens/LhDarkTokens.kt
  ...
codegen 完成：5 つの target、N 個のファイル、バージョン v0.0.1
```

ファイル数はトークンの内容によって変動します（シャドウトークンが存在する場合、ios / harmony はそれぞれ投影キャリアファイルを 1 つ多く出力します）。実際の出力を基準にしてください。

## 校验

```bash
pnpm verify          # = pnpm verify:tokens && pnpm verify:specs
```

- `verify:tokens`：トークン schema + 参照の整合性 + **重要文字色 / 背景色のコントラスト比 ≥4.5:1（WCAG AA）** + **プラットフォーム固有構文の巡回检查（`var()` / `rem` / `sp` / `dp`）**。さらに**孤児ダークパス**（ダークファイルには宣言されているが、ライトセットに存在しないキー）と、型が欠落しているダークキーを報告する。
- `verify:specs`：spec と cases の整合性（case が参照する prop / event が spec に存在するかなど）。

## テスト

```bash
pnpm test
```

スナップショットテストは `dist/` の全生成物を鏡像として保持します。トークンやテンプレートを変更するとスナップショットは失敗します。内容に問題がなければ `pnpm test -- -u` でスナップショットを更新してください。

## ドキュメントサイト

```bash
pnpm docs:dev        # ローカルプレビュー http://localhost:5185/lhui/core/
pnpm docs:build      # 本番ビルド（base は /lhui/core/）
pnpm docs:preview    # 本番ビルドをプレビュー
```

ドキュメントサイトの 3 つのリファレンスページ（トークン / 契約 / 用例）は、ビルド時に `tokens/` `specs/` `cases/` の真源を直接読み取るため、**先に codegen を走らせる必要はありません**。

## よくある組み合わせ

| 場面 | コマンド |
| --- | --- |
| トークンを変更し、生成物が欲しい | `pnpm codegen` |
| トークンを変更し、生成物 + 校验が欲しい | `pnpm build`（= codegen + verify） |
| テンプレートを変更し、生成物 + スナップショットが欲しい | `pnpm codegen && pnpm test -- -u` |
| トークンの早見表を見たいだけ | `pnpm codegen` 後に `dist/docs/tokens.md` を見る |

## 生成物はどこで消費されるか

各ネイティブ端は `dist/` の下の対応プラットフォームの生成物を消費します：

- Android：`dist/android/` の下の Kotlin ファイル
- iOS：`dist/ios/` の下の Swift ファイル
- HarmonyOS：`dist/harmony/` の下の ArkTS ファイル
- Windows：`dist/windows/` の下の C# ファイル

ローカル連携（トークン変更が即時反映され、リリース不要）の仕組みについては [ローカル連携](./local-linking) を参照してください。
