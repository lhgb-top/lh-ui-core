---
title: "コマンド一覧"
---

## ビルド

| コマンド | 役割 |
| --- | --- |
| `pnpm codegen` | 生成を 1 回実行し、`dist/` に書き出す（削除してから再構築） |
| `pnpm build` | `pnpm codegen && pnpm verify` |

## 検証

| コマンド | 役割 |
| --- | --- |
| `pnpm verify:tokens` | トークン検証：schema + 参照の整合性 + **重要な文字色 / 背景色のコントラスト比 ≥4.5:1（WCAG AA。宣言済みのペアのみ検査し、無効状態は免除）** + **プラットフォーム固有構文の巡回チェック（`var()` / `rem` / `sp` / `dp` などを遮断）** + 孤児ダークの報告 |
| `pnpm verify:specs` | spec と cases の一貫性検証 |
| `pnpm verify` | 上記 2 つの統合 |

## テストと静的チェック

| コマンド | 役割 |
| --- | --- |
| `pnpm test` | スナップショットテスト（vitest run） |
| `pnpm test:watch` | スナップショットテストのウォッチモード |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | eslint |
| `pnpm lint:fix` | eslint --fix |
| `pnpm format` | json/md/yml の prettier フォーマット |

## ドキュメントサイト

| コマンド | 役割 |
| --- | --- |
| `pnpm docs:dev` | `http://localhost:5185/lhui/core/` のローカルプレビュー（base は本番と同じ） |
| `pnpm docs:build` | 本番ビルド（base `/lhui/core/`） |
| `pnpm docs:preview` | 本番ビルドをプレビュー |

## リリース

| コマンド | 役割 |
| --- | --- |
| `pnpm changeset` | changeset を 1 つ書く |
| `pnpm changeset:status` | changeset の状態を確認 |
| `pnpm changeset:version` | changeset に従ってバージョン番号を更新 |

## スナップショットの更新

トークンやテンプレートを変更するとスナップショットは必ず失敗します。内容に問題がないことを確認したら：

```bash
pnpm test -- -u
```

## スクリプト一覧

`scripts/` 配下のスクリプト（npm scripts には登録されていないもの）：

| スクリプト | 役割 |
| --- | --- |
| `scripts/verify-tokens.mts` | トークン検証の本体 |
| `scripts/verify-specs.mts` | spec 検証の本体 |
| `scripts/resolve-local-tokens.mjs` | ローカル連携のガード |

リリースは changesets を経由します（上記「リリース」を参照）。追加のリリーススクリプトはありません。
