# i18n 目录

本站界面文案使用 Starlight 内置的 zh-CN 翻译（在 `astro.config.mjs` 用 root locale 声明）。

`index.json` 是一个空对象占位：Starlight 内部会 `getCollection("i18n")`，集合为空时
构建会告警，放一个空条目让集合非空即可。要覆盖内置翻译时，把翻译内容写进这个文件
（键为 BCP-47 语言标签，如 `"zh-CN"`，值为要覆盖的界面文案），详见 Starlight i18n 文档。
