# AGENTS.md — lh-ui-core 仓

> 原生血脉的构建期中心。本仓是 `lh-ui` 家族**原生分支**（android / ios / harmony / c）的
> 设计令牌真源、组件契约与黄金用例所在地，只做**构建期**的事，**不向任何原生端交付运行时代码**。

## 本仓在家族中的位置

家族有两条互相独立、不得关联的血脉：

- **web 血脉**：`lh-ui-share`（TS core + SCSS 唯一样式源）→ plus / vue2 / react / uniapp。
- **原生血脉**：**本仓**（JSON 令牌 + 规范 + codegen）→ android / ios / harmony / c。

本仓与 `lh-ui-share` **没有任何代码依赖关系**，两仓各自独立闭环、各自发版。品牌与视觉的统一靠
`docs/设计语言基线.md` 的人工对齐机制（见家族 AGENTS.md「双血脉」章节），不靠自动同步。

## 目录职责

| 路径 | 职责 |
| --- | --- |
| `tokens/` | **设计令牌唯一真源**（JSON 中性源）。`color.json` / `color-dark.json` / `spacing.json` / `typography.json` / `radius.json` / `shadow.json` / `motion.json` / `z-index.json` / `components.json`，格式由 `tokens/schema.json` 强约束 |
| `specs/` | **组件契约**（每组件一份 JSON）：props 名 / 类型 / 枚举 / 默认值 / 事件 / 行为说明，格式由 `specs/schema.json` 强约束 |
| `cases/` | **黄金用例**（每组件一份 JSON）：可跨端翻译的行为级断言，各端测试仓库照此翻译成本地测试，格式由 `cases/schema.json` 强约束 |
| `codegen/` | codegen 工具（TS/Node）：`src/load.ts` 装载校验、`src/resolve.ts` 引用解析与暗色合并、`src/render.ts` 模板渲染、`src/targets/<platform>.ts` 各端产物生成、`templates/` 各端 handlebars 模板 |
| `dist/` | codegen 产物（构建生成，**禁止手改**）。四平台令牌包 + `docs/tokens.md` |
| `scripts/` | 校验与发包脚本：`verify-tokens.mts` / `verify-specs.mts` / `resolve-local-tokens.mjs`（本地联动守卫） / `publish-*.mjs` |
| `tests/` | codegen 快照测试与令牌元测试 |

## 红线

1. **只生骨架，不生实现**：codegen 只产出令牌绑定、props 枚举与类型、默认值常量。
   **禁止生成任何 UI 实现**（不生成 Composable 体、SwiftUI View 体、ArkUI 组件体、C 组件函数体）。
   UI 实现全部留在各原生仓手写。越界即为违规。
2. **令牌唯一源是 `tokens/*.json`**：任何平台、任何组件不得绕过本仓另定令牌值。各原生仓只能
   消费 `dist/` 产物或对应平台的已发包，禁止手写色值 / 间距 / 字号。
3. **运行时零 JS**：本仓的 TS 代码只存在于构建期工具链，**产物中不得出现任何 JavaScript**。
4. **不得依赖 `lh-ui-share`**：两血脉互相独立，不得 import 对方任何内容。令牌的初始值是一次性
   人工搬运的种子（见下文「令牌种子」），不建立任何自动依赖。
5. **JSON 不得含平台特有语法**：令牌值只允许十六进制色值 / `rgba()` / 纯数字
   （数值或 `"12px"` 形式的带单位字符串）等中性表达，禁止出现 `var()`、`rem`、`sp`、`dp` 等任何
   平台专属单位或引用。平台单位换算由各 target 模板负责。
6. **`dist/` 禁止手改**：一切变更改 `tokens/` / `specs/` / `cases/` 或模板，再重跑 codegen。

## 令牌路径与类型约定

- **全局点路径 = 命名空间 + 文件内嵌套路径**。命名空间取文件 `$namespace`，缺省由文件名推导
  （`z-index.json` → `zIndex`，见 `load.ts` 的 `namespaceFromFileName`）。故：
  - `color.json` 无需声明 → `color.primary.default`、`color.text.primary`
  - `z-index.json` 显式声明 `"$namespace": "zIndex"` → `zIndex.modal`
  - `color-dark.json` 显式声明 `"$namespace": "color"`（与明色对齐，覆盖键才能落到同一路径）
  - `components.json` 声明 `"$namespace": ""`（空串）→ 顶层键即组件命名空间：`button.height.medium`
- **任何引用（`ref` / spec 的 `tokenRefs` / cases 的 `then.tokens`）都必须写全路径**。
- **类型三层优先级**：叶子自身 `type` > `ref` 引用目标的类型 > 文件/分组级 `$type`。
  flatten 只把 `$type` 烤进**字面量**叶子的类型；`ref` 叶子的类型由 resolve 阶段向引用目标取，
  避免被所在文件的默认类型误导（如 `button.fontWeight` 引用 `typography.fontWeight.primary`，
  类型随目标取 `number`，而非 components.json 的文件级 `dimension`）。
- 分组（含文件根）可声明 `$type` 覆盖整组默认类型（如 typography.json 的 `fontSize` 组标 `$type: dimension`）。

## 令牌种子

本仓 `tokens/*.json` 的初始值是一次性从 `lh-ui-share/styles/theme/common/variables.scss`
与 `var-dark.scss` 人工抽取的对齐种子（2026-10-10，见 `docs/设计语言基线.md`）。此后两仓
各自演化，**不再同步**。品牌级令牌（色板、间距尺度）变更必须在该基线文档登记。

## 本地联动（家族统一机制）

家族布局下（各仓同父目录），原生仓本地开发时通过**带存在性守卫的本地解析**直接读本仓的 `dist/`
产物，改令牌重跑 `pnpm codegen` 即时生效，无需发包；本仓不存在时（如 CI 单仓 clone）自动回退
到各平台已发的包。守卫机制与 web 血脉的 `createLocalShareAliases` 同构：检查
`existsSync(<coreRoot>/dist)`，不存在则不注入本地路径。各平台的注入方式由各原生仓自行实现
（Android 走 Gradle 本地 maven 仓目录、iOS 走 SPM 本地 path 依赖、鸿蒙走 ohpm `file:` 依赖、
C 走 CMake `add_subdirectory` 或头文件路径），本仓不强制。

## 命令

| 任务 | 命令 |
| --- | --- |
| 跑一次 codegen（写 `dist/`） | `pnpm codegen` |
| 构建（codegen + 校验） | `pnpm build` |
| 令牌校验（schema + 引用完整性） | `pnpm verify:tokens` |
| 规范校验（spec 与 cases 一致性） | `pnpm verify:specs` |
| 单测（快照） | `pnpm test` |
| 类型 | `pnpm typecheck` |
| Lint | `pnpm lint` |

## 新增组件流程（原生血脉）

1. 在 `specs/` 加 `<name>.json` 契约（props / 枚举 / 默认值 / 事件 / 行为）。
2. 在 `cases/` 加 `<name>.json` 黄金用例。
3. 跑 `pnpm verify:specs` 通过校验。
4. 若组件引入了新的**组件级令牌**（如 `button.height`），在 `tokens/` 相应文件补键，
   并在 `docs/设计语言基线.md` 登记（若属品牌级令牌）。
5. 发 changeset，core 先发版，各原生端随后升令牌依赖版本并照 `cases/` 翻译测试。

## Verification is manual

单测、构建、typecheck、lint 由**用户**运行，AI 不自动执行。不要自行跑 `pnpm test*` /
`pnpm build*` / `pnpm codegen` / `pnpm verify*` / `pnpm typecheck` / `pnpm lint`，
除非用户在当次请求中明确授权。交付后列出命令清单，未经验证的门槛写「已交付（待手动验证）」，
不得标 ✅。

## Git 操作红线

未经用户在当前请求中明确同意，AI 不得执行任何改动 git 状态或历史的指令（commit / push /
add / reset / revert / restore / checkout -- / stash / merge / rebase / tag / rm --cached）。
只读指令（status / diff / log / show / branch 查看）不受限。本仓暂未 `git init`，
初始化与首次提交均需用户明确授权。
