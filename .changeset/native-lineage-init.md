---
'@lh-ui/core': minor
---

原生血脉构建期中心初始化：设计令牌 JSON 真源（9 份 + schema）、组件契约与黄金用例格式（含 button 示例）、四端 codegen（Kotlin / Swift / ArkTS / C 头文件）、令牌与规范校验脚本、快照测试、带存在性守卫的本地联动脚本。

本仓只在构建期工作，不向任何原生端交付运行时代码；与 web 血脉（@lh-ui/share）零依赖。令牌初始值一次性自 share 的 SCSS 令牌搬运，对齐对照表见 docs/设计语言基线.md。
