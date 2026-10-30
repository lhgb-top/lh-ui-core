---
'@lh-ui/core': patch
---

修复文档站 es 404 页 frontmatter：`hero.tagline` 明文标量含「冒号+空格」（`artefactos: puede haber`），Astro 使用的 YAML 解析器解析失败；给值加上双引号。
