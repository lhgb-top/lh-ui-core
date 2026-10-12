---
title: "目录结构"
---

```
lh-ui-core/
├── tokens/       设计令牌唯一真源（JSON 中性源，含 schema）
├── specs/        组件契约（props / 枚举 / 默认值 / 事件 / 插槽 / 行为）
├── cases/        黄金用例（可跨端翻译的行为级断言）
├── codegen/      codegen 工具（TS/Node）：src/ + templates/
├── dist/         codegen 产物（构建生成，禁止手改）
├── scripts/      校验与发包脚本
├── tests/        快照测试与令牌元测试
└── docs/         开发者文档站源码（Astro Starlight，本站）
```

## 各目录职责

### `tokens/` —— 令牌唯一真源

平台无关的 JSON 中性源，格式由 `tokens/schema.json` 强约束。共 9 个数据文件：

| 文件 | 命名空间 | 内容 |
| --- | --- | --- |
| `color.json` | `color` | 色板：语义色按 default/hover/active/bg/border 组织 |
| `color-dark.json` | `color`（与明色同名） | 暗色增量覆盖（只声明与明色不同的键） |
| `components.json` | `""`（空串） | 组件级令牌：`button.*`、`input.*` 等 |
| `typography.json` | `typography` | 字体族 / 字号 / 字重 / 行高 |
| `spacing.json` | `spacing` | 间距尺度 xs–xxl |
| `radius.json` | `radius` | 圆角 |
| `shadow.json` | `shadow` | 投影 |
| `motion.json` | `motion` | 时长 + 缓动（贝塞尔） |
| `z-index.json` | `zIndex` | 层级 |

各文件的精确叶子数随版本变化，以 [令牌参考](../tokens/reference) 页为准——prose 里写死数字必然过时。

详见 [令牌格式](../tokens/token-format) 与 [命名空间与点路径](../tokens/namespace)。

### `specs/` —— 组件契约

每组件一份 JSON：props 名 / 类型 / 枚举 / 默认值 / 事件 / 插槽 / 行为说明 / 消费的令牌列表。格式由 `specs/schema.json` 强约束。详见 [契约格式](../specs/spec-format)。

### `cases/` —— 黄金用例

每组件一份 JSON：可跨端翻译的行为级断言（given/when/then），各端测试仓库照此人工翻译成本地测试。格式由 `cases/schema.json` 强约束。详见 [用例格式](../cases/case-format)。

### `codegen/` —— 生成工具

```
codegen/
├── src/
│   ├── index.ts      CLI 编排入口（pnpm codegen 的真身）
│   ├── types.ts      全部类型定义（不进运行时产物）
│   ├── load.ts       JSON 装载 + Ajv schema 校验 + 扁平化
│   ├── resolve.ts    ref 解析 + 暗色合并
│   ├── format.ts     中性值解析 / 各端格式化
│   ├── tree.ts       扁平 path → 嵌套树
│   ├── render.ts     Handlebars 封装
│   └── targets/      android / ios / harmony / c / docs 五个 target
└── templates/        各端 handlebars 模板（7 个 .hbs）
```

详见 [管线总览](../codegen/pipeline)。

### `dist/` —— 生成产物

**禁止手改**（在 `.gitignore` 内）。布局：

```
dist/
├── android/top/lhgb/ui/tokens/   LhTokens.kt, LhDarkTokens.kt
├── ios/Sources/LhUITokens/       LhTokens.swift, LhDarkTokens.swift, LhShadow.swift
├── harmony/tokens/               LhTokens.ets, LhDarkTokens.ets, LhShadow.ets
├── c/include/lh_ui/              lh_tokens.h, lh_dark_tokens.h
└── docs/                         tokens.md, tokens.light.json, tokens.dark.json
```

详见 [产物](../artifacts/android)。

### `scripts/` —— 校验与发包脚本

`verify-tokens.mts`（令牌校验：schema + 引用完整性 + 孤儿暗色报告）、`verify-specs.mts`（spec 与 cases 一致性）、`resolve-local-tokens.mjs`（本地联动守卫）。发包走 changesets（见 [命令](./commands)）。

### `tests/` —— 快照测试

`codegen-snapshot.spec.ts` 镜像 `dist/` 全部产物（快照文件入版本库），`tokens.spec.ts` 做令牌元测试。

### `docs/` —— 本站

Astro Starlight 站点源码（配置在 `docs/astro.config.mjs`，内容在 `docs/src/content/docs/`）。三个参考页（令牌 / 契约 / 用例）是 `docs/src/pages/` 下的 `.astro` 页面，在构建期直接调用 codegen 的装载与解析函数从 JSON 真源渲染，不需要手动维护表格。部署说明见 [部署说明](../deployment)。
