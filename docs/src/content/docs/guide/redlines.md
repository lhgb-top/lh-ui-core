---
title: "红线与命名规范"
---

## 六条红线

### 1. 只生骨架，不生实现

codegen 只产出**令牌绑定**、props 枚举与类型、默认值常量。**禁止生成任何 UI 实现**——不生成 Composable 体、SwiftUI View 体、ArkUI 组件体、C 组件函数体。UI 实现全部留在各原生仓手写。

这条红线写在 `codegen/src/index.ts` 的文件头注释里，是工具链的自我声明。

### 2. 令牌唯一源是 `tokens/*.json`

任何平台、任何组件不得绕过本仓另定令牌值。各原生仓只能消费 `dist/` 产物或对应平台的已发包，**禁止手写色值 / 间距 / 字号**。

### 3. 运行时零 JS

本仓的 TS 代码只存在于构建期工具链，**产物中不得出现任何 JavaScript**。

### 4. 不得依赖 `lh-ui-share`

两血脉互相独立，不得 import 对方任何内容。令牌的初始值是一次性人工搬运的种子，不建立任何自动依赖。

### 5. JSON 不得含平台特有语法

令牌值只允许中性表达：十六进制色值 / `rgba()` / `number` 类型下的纯数值 / `dimension` / `duration` / `shadow` 的**带单位字符串**（`"12px"` / `"50%"` / `"200ms"`，由 `assertTypedValue` 强制，详见 [令牌格式](../tokens/token-format)）。禁止 `var()`、`rem`、`sp`、`dp` 等任何平台专属单位或引用。**平台单位换算由各 target 模板负责**（如 Android 的 dp/sp 判定、iOS 的秒换算）。

### 6. `dist/` 禁止手改

一切变更改 `tokens/` / `specs/` / `cases/` 或模板，再重跑 `pnpm codegen`。`dist/` 在 `.gitignore` 内，每次 codegen 先删后建。

## 命名规范（总纲 D20）

### 平台包名 / 标识符

平台包名一律反域名 `top.lhgb.ui`：

| 平台 | 包名 / 标识符 |
| --- | --- |
| Android | `package top.lhgb.ui.tokens`，产物目录 `dist/android/top/lhgb/ui/tokens/` |
| iOS | `Sources/LhUITokens/`（SwiftPM 目录约定） |
| 鸿蒙 | `tokens/`（ohpm 模块内） |
| C | `include/lh_ui/` |

### 自有常量 / 类 / 枚举前缀

一律 **LH 前缀**，按各语言惯例定大小写：

| 语言 | 约定 | 示例 |
| --- | --- | --- |
| Kotlin | `Lh*`（PascalCase） | `object LhTokens`、`object LhDarkTokens` |
| Swift | `Lh*`（PascalCase） | `public enum LhTokens`、`struct LhShadow` |
| ArkTS | `Lh*`（PascalCase） | `export class LhTokens`、`interface LhShadow` |
| C | `LH_*`（全大写蛇形） | `LH_COLOR_PRIMARY_DEFAULT`、`LH_Z_INDEX_MODAL` |

npm / ohpm 的 `@lh-ui/*` scope 不受此约束（npm 不使用反域名）。

### C 宏命名规则

`zIndex.modal` → `LH_Z_INDEX_MODAL`：先把 `.` 转下划线，再给每个大写字母前补下划线，最后全大写。详见 [C 产物](../artifacts/c)。

## JSON 命名约束

各层 schema 用正则强约束命名：

| 层 | 字段 | 规则 |
| --- | --- | --- |
| spec | `name` | kebab-case：`^[a-z][a-z0-9-]*$` |
| spec | `component` | PascalCase 带 Lh 前缀：`^Lh[A-Z][a-zA-Z0-9]*$` |
| spec | prop 名 | camelCase：`^[a-z][a-zA-Z0-9]*$` |
| spec | event 名 | `^on[A-Z][a-zA-Z0-9]*$` |
| case | `id` | kebab-case |
| case | `component` | 须与同名 spec 的 `name` 一致 |

## 注释与文档语言

注释、文档、提交信息一律**中文**（家族总纲要求）。
