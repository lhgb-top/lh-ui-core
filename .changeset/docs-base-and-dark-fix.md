---
'@lh-ui/core': patch
---

修复文档站两处问题：

- 首页 hero 按钮（快速开始 / 令牌参考）与正文 6 条卡片链接此前以 `/` 开头写成，Astro 的 `base` 不会作用于 hero CTA 与 markdown 正文链接，部署到 `/lhui/core/` 后跳到站点根路径。hero 按钮改为写完整前缀；正文链接由 `astro.config.mjs` 新增的 `basePrefixPlugin` 插件在构建期自动补 base，内容里仍可写绝对路径。
- deployment.md 补上「base 管不到 hero 按钮与正文链接」的警示与缺 base 的反向自检命令。
