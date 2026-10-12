---
title: "命令清单"
---

## 构建

| 命令 | 作用 |
| --- | --- |
| `pnpm codegen` | 跑一次生成，写 `dist/`（先删后建） |
| `pnpm build` | `pnpm codegen && pnpm verify` |

## 校验

| 命令 | 作用 |
| --- | --- |
| `pnpm verify:tokens` | 令牌校验：schema + 引用完整性 + **关键文字/底色对比度 ≥4.5:1（WCAG AA，仅检查声明的配对，禁用态豁免）** + **平台专属语法巡检（拦截 `var()` / `rem` / `sp` / `dp` 等）** + 孤儿暗色报告 |
| `pnpm verify:specs` | spec 与 cases 一致性校验 |
| `pnpm verify` | 上面两条的合并 |

## 测试与静态检查

| 命令 | 作用 |
| --- | --- |
| `pnpm test` | 快照测试（vitest run） |
| `pnpm test:watch` | 快照测试监听模式 |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | eslint |
| `pnpm lint:fix` | eslint --fix |
| `pnpm format` | prettier 格式化 json/md/yml |

## 文档站

| 命令 | 作用 |
| --- | --- |
| `pnpm docs:dev` | 本地预览 `http://localhost:5185/lhui/core/`（base 与线上一致） |
| `pnpm docs:build` | 生产构建（base `/lhui/core/`） |
| `pnpm docs:preview` | 预览生产构建 |

## 发版

| 命令 | 作用 |
| --- | --- |
| `pnpm changeset` | 写一条 changeset |
| `pnpm changeset:status` | 查看 changeset 状态 |
| `pnpm changeset:version` | 按 changeset 改版本号 |

## 快照更新

改了令牌或模板后快照必然失败，确认无误后：

```bash
pnpm test -- -u
```

## 脚本一览

`scripts/` 下的脚本（不挂在 npm scripts 里的）：

| 脚本 | 作用 |
| --- | --- |
| `scripts/verify-tokens.mts` | 令牌校验真身 |
| `scripts/verify-specs.mts` | 规范校验真身 |
| `scripts/resolve-local-tokens.mjs` | 本地联动守卫 |

发包走 changesets（见上方「发版」），没有额外的发包脚本。
