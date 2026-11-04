---
'@lh-ui/core': patch
---

文档站换用家族新品牌 logo（AIGC 新标，母版存 docs/部署/favicon-src/masters/，机制见家族 docs/SEO提交与曝光指南.md「搜索结果图标」一节）：

- 旧品牌标（靛蓝印章 + lh 字标 SVG）废止，改用新品牌 logo 的 PNG 栅格体系：logo.png（浅底主标，真透明）/ logo-dark.png（暗底主标，浅色字标透明）/ logo-banner.png（首页横幅）/ favicon.ico 16/32/48 / apple-touch-icon 180 / og.png 512。
- 导航栏新增品牌 logo 展示（明暗双图自动切换）；favicon head 声明改指 logo.png；og:image / apple-touch-icon 换用新品牌深色方版。
- 首页 hero 区新增家族统一横幅。
- empty 组件文档 demo 的占位图随品牌资产迁移（logo.svg → logo.png）。
