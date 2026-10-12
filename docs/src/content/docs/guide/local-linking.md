---
title: "本地联动"
---

## 问题

原生端开发时，改一次令牌就要等 core 发版、再升级依赖，反馈链太长。

## 机制

家族布局下（各仓同父目录），原生仓本地开发时通过**带存在性守卫的本地解析**直接读本仓的 `dist/` 产物：改令牌后在本仓重跑 `pnpm codegen` 即时生效，**无需发包**。本仓不存在时（如 CI 单仓 clone）自动回退到各平台已发的包。

守卫机制与 web 血脉的 `createLocalShareAliases` 同构：检查 `existsSync(<coreRoot>/dist/android)`（android 产物存在才认为本仓已跑过 codegen），不存在则不注入本地路径。

## 各端注入方式

各原生仓自行实现，本仓不强制：

| 平台 | 注入方式 |
| --- | --- |
| Android | Gradle 本地 maven 仓目录 |
| iOS | SPM 本地 path 依赖 |
| 鸿蒙 | ohpm `file:` 依赖 |
| C | CMake `add_subdirectory` 或头文件路径 |

## 典型工作流

```
1. 在本仓改 tokens/*.json
2. pnpm codegen          → dist/ 立即更新
3. 在原生仓直接构建/运行  → 新令牌已生效
```

`scripts/resolve-local-tokens.mjs` 是这个守卫机制的实现脚本。

## 注意

- 本地联动只在**家族布局**（各仓同父目录）下可用。
- 联动读的是 `dist/`，所以改完令牌**必须先跑 codegen**。
- 发版后原生端应切回正式依赖版本，避免长期依赖本地路径。
