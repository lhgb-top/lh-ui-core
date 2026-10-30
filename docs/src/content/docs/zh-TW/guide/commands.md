---
title: "命令清單"
---

## 構建

| 命令 | 作用 |
| --- | --- |
| `pnpm codegen` | 跑一次生成，寫 `dist/`（先刪後建） |
| `pnpm build` | `pnpm codegen && pnpm verify` |

## 校驗

| 命令 | 作用 |
| --- | --- |
| `pnpm verify:tokens` | 令牌校驗：schema + 引用完整性 + **關鍵文字/底色對比度 ≥4.5:1（WCAG AA，僅檢查宣告的配對，停用狀態豁免）** + **平台專屬語法巡檢（攔截 `var()` / `rem` / `sp` / `dp` 等）** + 孤兒暗色路徑報告 |
| `pnpm verify:specs` | spec 與 cases 一致性校驗 |
| `pnpm verify` | 上面兩條的合併 |

## 測試與靜態檢查

| 命令 | 作用 |
| --- | --- |
| `pnpm test` | 快照測試（vitest run） |
| `pnpm test:watch` | 快照測試監聽模式 |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | eslint |
| `pnpm lint:fix` | eslint --fix |
| `pnpm format` | prettier 格式化 json/md/yml |

## 文件站

| 命令 | 作用 |
| --- | --- |
| `pnpm docs:dev` | 本地預覽 `http://localhost:5185/lhui/core/`（base 與線上一致） |
| `pnpm docs:build` | 生產構建（base `/lhui/core/`） |
| `pnpm docs:preview` | 預覽生產構建 |

## 發版

| 命令 | 作用 |
| --- | --- |
| `pnpm changeset` | 寫一條 changeset |
| `pnpm changeset:status` | 查看 changeset 狀態 |
| `pnpm changeset:version` | 按 changeset 改版本號 |

## 快照更新

改了令牌或模板後快照必然失敗，確認無誤後：

```bash
pnpm test -- -u
```

## 腳本一覽

`scripts/` 下的腳本（不掛在 npm scripts 裡的）：

| 腳本 | 作用 |
| --- | --- |
| `scripts/verify-tokens.mts` | 令牌校驗真身 |
| `scripts/verify-specs.mts` | 規範校驗真身 |
| `scripts/resolve-local-tokens.mjs` | 本地連動守衛 |

發包走 changesets（見上方「發版」），沒有額外的發包腳本。
