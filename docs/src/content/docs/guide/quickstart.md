---
title: "快速开始"
---

## 环境要求

- Node.js `>= 22.12`（文档站用 Astro 7，硬性要求）
- pnpm `10.x`（仓库锁定 `pnpm@10.34.5`）

## 安装

```bash
pnpm install
```

本仓**运行时零依赖**（`dependencies` 为空），安装的全是构建期工具链（tsx、ajv、handlebars、vitest、astro 等）。

## 跑一次 codegen

```bash
pnpm codegen
```

这条命令执行 `tsx codegen/src/index.ts`，完整流程是：

1. 读取 `package.json` 版本号
2. 装载并校验 `tokens/*.json`（Ajv 结构校验）
3. 解析 ref、合并暗色（语义校验：类型匹配、引用完整性、环检测）
4. 装载并校验 `specs/*.json` 与 `cases/*.json`
5. **删掉整个 `dist/` 并重建**
6. 依次执行 5 个 target（android → ios → harmony → c → docs）

输出在 `dist/`：

```
  [android] android/top/lhgb/ui/tokens/LhTokens.kt
  [android] android/top/lhgb/ui/tokens/LhDarkTokens.kt
  ...
codegen 完成：5 个 target，N 个文件，版本 v0.0.1
```

文件数随令牌内容变化（投影令牌存在时 ios / harmony 会各多一个投影载体文件），以实际输出为准。

## 校验

```bash
pnpm verify          # = pnpm verify:tokens && pnpm verify:specs
```

- `verify:tokens`：令牌 schema + 引用完整性 + **关键文字/底色对比度 ≥4.5:1（WCAG AA）** + **平台专属语法巡检（`var()` / `rem` / `sp` / `dp`）**，并报告**孤儿暗色路径**（暗色文件声明了、明色集里不存在的键）与缺失类型的暗色键。
- `verify:specs`：spec 与 cases 的一致性（case 引用的 prop / event 是否在 spec 中存在等）。

## 测试

```bash
pnpm test
```

快照测试镜像 `dist/` 的全部产物。改了令牌或模板后，快照会失败，确认无误后用 `pnpm test -- -u` 更新快照。

## 文档站

```bash
pnpm docs:dev        # 本地预览 http://localhost:5185/lhui/core/
pnpm docs:build      # 生产构建（base 为 /lhui/core/）
pnpm docs:preview    # 预览生产构建
```

文档站的三个参考页（令牌 / 契约 / 用例）在构建期直接读 `tokens/` `specs/` `cases/` 真源，**不需要先跑 codegen**。

## 常见组合

| 场景 | 命令 |
| --- | --- |
| 改了令牌，要产物 | `pnpm codegen` |
| 改了令牌，要产物 + 校验 | `pnpm build`（= codegen + verify） |
| 改了模板，要产物 + 快照 | `pnpm codegen && pnpm test -- -u` |
| 只想看令牌速查表 | `pnpm codegen` 后看 `dist/docs/tokens.md` |

## 产物在哪消费

各原生端消费 `dist/` 下对应平台的产物：

- Android：`dist/android/` 下的 Kotlin 文件
- iOS：`dist/ios/` 下的 Swift 文件
- 鸿蒙：`dist/harmony/` 下的 ArkTS 文件
- C：`dist/c/` 下的头文件

本地联动（改令牌即时生效、不发版）的机制见 [本地联动](./local-linking)。
