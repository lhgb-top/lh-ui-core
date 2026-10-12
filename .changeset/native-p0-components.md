---
'@lh-ui/core': minor
---

补齐总纲 D17 原生 P0 剩余 13 个组件的契约层：specs/icon|tag|loading|cell|checkbox|radio|switch|input|textarea|dialog|toast|picker|navbar.json + 同名黄金用例 cases（每份 5–8 条，含 gate 类与 token 映射类），并新增对应组件级令牌命名空间（`nativeOnly`，不与 web 对齐）：

- 尺寸类：`icon.size`（16/20/24）、`tag.height`（20/24/28）、`loading.size`（16/20/24）+ `loading.strokeWidth`（2px）、`checkbox.size` / `radio.size`（16/20/24）、`switch.width`（36/44/52）× `switch.height`（20/24/28）+ `switch.gap`（2px）、`input.height`（32/40/48）× `input.paddingHorizontal`（12/16/20）、`textarea.minHeight`（72px）、`dialog.width`（320px）、`picker.height` / `picker.itemHeight` / `picker.toolbarHeight`（260/40/44）、`navbar.height`（44px）+ `navbar.iconSize`（20px）。
- 描边/比例类：`cell.borderWidth`（1px，分隔线）、`checkbox.checkWidth` / `checkbox.dashScale`（2px / 50%）、`radio.ringWidth` / `radio.dotScale`（2px / 50%）、`tag.borderWidth`、`input.borderWidth` / `input.focusRingWidth` / `input.clearIconSize`、`textarea.borderWidth` / `textarea.focusRingWidth`、`navbar.borderWidth`。
- 命名比例令牌（`*.dotScale` / `*.dashScale`）无 `type` 字段：schema 的 type 枚举不含 fraction，沿用 radio.dotScale 既有的无类型 `"50%"` 写法。
- 其余可复用全局尺度的令牌一律 `ref`（字号 / 圆角 / 间距 / 字重），未列出的键不代表缺失。

唯一色板改动：`color.ink` 增加暗色覆盖 `#4A4540`（明色 `#1A1A1A`）。toast 需要深色底，暗色下若沿用明色墨会和页面底 `#2A2520` 糊在一起；提亮后与白字对比度约 9.4:1，同时与页面底拉开层次。预计算记录已登记到 docs/设计语言基线.md §三。

修复 ios codegen 目标的一个真实 bug：`LhShadow` 模板缺少最外层右括号，生成的 Swift 不可编译（`LhShadow(color: ..., y: 0)` 少一个 `)`）。该 bug 自 button 打样起就存在，因 Windows 无 SwiftUI 一直未被编译捕获；本次由 `swiftc -parse` 暴露。已重跑四端 codegen 并更新快照。

另新增 `textarea.textInset`（6px，dimension，nativeOnly）：SwiftUI 的 `TextEditor` 自带约 6pt 文本内嵌，叠加占位文字与字数统计时需按此值对齐。此前端侧写死 `CGFloat = 6` 违反「组件实现禁止间距字面量」红线，已令牌化（登记于 docs/设计语言基线.md §四）。

四端校验状态：`pnpm verify:specs`（15 契约 / 15 用例）、`pnpm verify:tokens`（200 令牌 / 53 暗色覆盖）、`pnpm codegen`（5 目标）、`pnpm test`（18 快照）全部通过。

iOS 端 13 个组件实现、Previews、XCTest、文档站与端侧 bug 修复另见 lh-ui-ios 仓 changeset
（`native-ios-p0-components.md`）。
