# @lh-ui/core

> lh-ui 原生血脉的构建期中心。设计令牌（JSON 真源）+ 组件契约 + 黄金用例 + 跨端 codegen。

本仓 **不是** 运行时依赖。它只在构建期工作：把平台无关的令牌与组件契约，生成到
Android（Kotlin）/ iOS（Swift）/ 鸿蒙（ArkTS）/ C 四个原生端的语言骨架，再由各端 UI 库
手写实现。原生端运行时零 JavaScript。

## 与 web 血脉的关系

家族有两条**互相独立、不得关联**的血脉：

```
lh-ui 家族
├── web 血脉（现有）：lh-ui-share(TS core + SCSS) → plus / vue2 / react / uniapp
└── 原生血脉（本仓）：lh-ui-core(JSON 令牌 + 规范 + codegen) → android / ios / harmony / c
```

本仓与 `lh-ui-share` 无任何代码依赖。品牌与视觉统一靠 `docs/设计语言基线.md` 人工对齐。

## 目录

```
tokens/      设计令牌唯一真源（JSON 中性源，含 schema）
specs/       组件契约（props / 枚举 / 默认值 / 事件 / 行为）
cases/       黄金用例（可跨端翻译的行为级断言）
codegen/     TS/Node 代码生成器（src/ + templates/）
dist/        生成产物（禁止手改）
scripts/     校验与发包脚本
tests/       快照测试
```

## 命令

```bash
pnpm install
pnpm codegen        # 跑一次生成，写 dist/
pnpm verify         # 令牌 + 规范校验
pnpm test           # 快照测试
```

详细规范见 [AGENTS.md](./AGENTS.md)。
