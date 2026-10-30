---
title: "本地連動"
---

## 問題

原生端開發時，改一次令牌就要等 core 發版、再升級依賴，回饋鏈太長。

## 機制

家族布局下（各倉同父目錄），原生倉本地開發時透過**帶存在性守衛的本地解析**直接讀本倉的 `dist/` 產物：改令牌後在本倉重跑 `pnpm codegen` 即時生效，**無需發包**。本倉不存在時（如 CI 單倉 clone）自動回退到各平台已發的包。

守衛機制與 web 血脈的 `createLocalShareAliases` 同構：檢查 `existsSync(<coreRoot>/dist/android)`（android 產物存在才認為本倉已跑過 codegen），不存在則不注入本地路徑。

## 各端注入方式

各原生倉自行實作，本倉不強制：

| 平台 | 注入方式 |
| --- | --- |
| Android | Gradle 本地 maven 倉目錄 |
| iOS | SPM 本地 path 依賴 |
| 鴻蒙 | ohpm `file:` 依賴 |
| C | CMake `add_subdirectory` 或標頭檔路徑 |

## 典型工作流

```
1. 在本倉改 tokens/*.json
2. pnpm codegen          → dist/ 立即更新
3. 在原生倉直接構建/執行  → 新令牌已生效
```

`scripts/resolve-local-tokens.mjs` 是這個守衛機制的實作腳本。

## 注意

- 本地連動只在**家族布局**（各倉同父目錄）下可用。
- 連動讀的是 `dist/`，所以改完令牌**必須先跑 codegen**。
- 發版後原生端應切回正式依賴版本，避免長期依賴本地路徑。
