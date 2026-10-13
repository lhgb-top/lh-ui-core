---
'@lh-ui/core': patch
---

# 开源化与 GitHub 发包链路接入

- 新增 Apache License 2.0（LICENSE）
- `package.json` 补 `license` / `repository` / `bugs` / `homepage` 元数据
- 新增 `scripts/push-release.mjs`：打 `@lh-ui/core@<版本>` tag 并推 master + tag 到 GitHub（支持 `--dry-run` 自检）
- 新增 `scripts/release-notes.mjs`：从 CHANGELOG.md 提取指定版本发行版说明
- 新增 `.github/workflows/ci.yml`（lint / typecheck / test / codegen+verify / docs:build 全量门禁）
- 新增 `.github/workflows/release.yml`：tag 触发，打源码 zip 建 GitHub Release 并同步 Gitee
- `package.json` 补 `release:push` 脚本
- `.changeset/config.json` 的 `baseBranch` 由 `main` 改为 `master`（家族默认分支统一）
