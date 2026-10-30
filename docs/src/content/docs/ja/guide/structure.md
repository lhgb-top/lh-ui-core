---
title: "ディレクトリ構造"
---

```
lh-ui-core/
├── tokens/       デザイントークンの唯一真源（JSON 中性ソース、schema を含む）
├── specs/        コンポーネント契約（props / 列挙 / デフォルト値 / イベント / スロット / 振る舞い）
├── cases/        ゴールデンケース（クロスプラットフォームで翻訳可能な振る舞いレベルのアサーション）
├── codegen/      codegen ツール（TS/Node）：src/ + templates/
├── dist/         codegen 生成物（ビルド時に生成、手変更禁止）
├── scripts/      校验・リリーススクリプト
├── tests/        スナップショットテストとトークンのメタテスト
└── docs/         開発者用ドキュメントサイトのソース（Astro Starlight、このサイト）
```

## 各ディレクトリの責務

### `tokens/` —— トークンの唯一真源

プラットフォーム非依存の JSON 中性ソースで、形式は `tokens/schema.json` が厳格に制約します。データファイルは全部で 9 つです：

| ファイル | 名前空間 | 内容 |
| --- | --- | --- |
| `color.json` | `color` | カラーパレット：意味色は default/hover/active/bg/border で整理 |
| `color-dark.json` | `color`（ライトと同名） | ダーク増分カバー（ライトと異なるキーのみ宣言） |
| `components.json` | `""`（空文字） | コンポーネントレベルのトークン：`button.*`、`input.*` など |
| `typography.json` | `typography` | フォントファミリー / フォントサイズ / フォントの太さ / 行高 |
| `spacing.json` | `spacing` | 間隔のスケール xs–xxl |
| `radius.json` | `radius` | 角丸 |
| `shadow.json` | `shadow` | 投影 |
| `motion.json` | `motion` | 所要時間 + イージング（ベジェ） |
| `z-index.json` | `zIndex` | 階層 |

各ファイルの正確な葉トークン数はバージョンによって変動します。[トークンリファレンス](../tokens/reference) ページを基準にしてください——本文中に固定の数字を書くと必ず古くなります。

詳しくは [トークンフォーマット](../tokens/token-format) と [名前空間とドットパス](../tokens/namespace) を参照してください。

### `specs/` —— コンポーネント契約

コンポーネントごとに 1 つの JSON：props 名 / 型 / 列挙 / デフォルト値 / イベント / スロット / 振る舞いの説明 / 消費するトークンのリスト。形式は `specs/schema.json` が厳格に制約します。詳しくは [契約フォーマット](../specs/spec-format) を参照してください。

### `cases/` —— ゴールデンケース

コンポーネントごとに 1 つの JSON：クロスプラットフォームで翻訳可能な振る舞いレベルのアサーション（given/when/then）。各端のテストリポジトリはこれに従ってローカルテストへ手動で翻訳します。形式は `cases/schema.json` が厳格に制約します。詳しくは [ケースフォーマット](../cases/case-format) を参照してください。

### `codegen/` —— 生成ツール

```
codegen/
├── src/
│   ├── index.ts      CLI の编排エントリ（pnpm codegen の実体）
│   ├── types.ts      すべての型定義（ランタイム生成物には入らない）
│   ├── load.ts       JSON 読み込み + Ajv schema 校验 + フラット化
│   ├── resolve.ts    ref の解決 + ダークモードのマージ
│   ├── format.ts     中性値の解析 / 各端のフォーマット
│   ├── tree.ts       フラット path → ネストされたツリー
│   ├── render.ts     Handlebars のラッパー
│   └── targets/      android / ios / harmony / windows / docs の 5 つの target
└── templates/        各端の handlebars テンプレート（7 つの .hbs）
```

詳しくは [パイプライン概要](../codegen/pipeline) を参照してください。

### `dist/` —— 生成物

**手変更禁止**（`.gitignore` 対象）。レイアウト：

```
dist/
├── android/top/lhgb/ui/tokens/   LhTokens.kt, LhDarkTokens.kt
├── ios/Sources/LhUITokens/       LhTokens.swift, LhDarkTokens.swift, LhShadow.swift
├── harmony/tokens/               LhTokens.ets, LhDarkTokens.ets, LhShadow.ets
├── c/include/lh_ui/              lh_tokens.h, lh_dark_tokens.h
└── docs/                         tokens.md, tokens.light.json, tokens.dark.json
```

詳しくは [Android 生成物](../artifacts/android) を参照してください。

### `scripts/` —— 校验・リリーススクリプト

`verify-tokens.mts`（トークンの校验：schema + 参照の整合性 + 孤児ダークパスの報告）、`verify-specs.mts`（spec と cases の整合性）、`resolve-local-tokens.mjs`（ローカル連携のガード）。リリースは changesets を経由します（[コマンド一覧](./commands) を参照）。

### `tests/` —— スナップショットテスト

`codegen-snapshot.spec.ts` は `dist/` の全生成物を鏡像として保持し（スナップショットファイルはバージョン管理に含める）、`tokens.spec.ts` がトークンのメタテストを行います。

### `docs/` —— このサイト

Astro Starlight サイトのソース（設定は `docs/astro.config.mjs`、内容は `docs/src/content/docs/`）。3 つのリファレンスページ（トークン / 契約 / 用例）は `docs/src/pages/` の下の `.astro` ページで、ビルド時に codegen の読み込み関数と解決関数を直接呼び出して JSON 真源からレンダリングするため、表の手動メンテナンスは不要です。デプロイについては [デプロイメント](../deployment) を参照してください。
