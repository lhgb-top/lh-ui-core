---
title: "暗色合并"
---

## 增量覆盖

暗色文件（`"$dark": true`）**只声明与明色不同的键**，未覆盖的键沿用明色值：

```json
// color-dark.json
{
  "$namespace": "color",
  "$dark": true,
  "$description": "仅声明与明色不同的键，未覆盖键沿用 color.json",
  "primary": { "default": { "value": "#3D649E" } }
}
```

`color.primary.hover`、`.active` 等未列出的键在暗色下沿用明色值。裁剪原则是**逐键比对**：与明色值完全相同的键一律删除（例如 `onPrimary` 两主题都是 `#FFFFFF`，`disabled.*` 两主题都是同一组 ref，因此都不出现在暗色文件里）。

## 命名空间必须对齐

暗色文件必须声明与明色文件**相同的 `$namespace`**（`color-dark.json` 显式写 `"$namespace": "color"`），覆盖键才能落到同一路径。

## 暗色 ref 就近解析

暗色文件里的 `ref` 用 `resolveDarkRef` 解析，规则与明色不同：

1. 目标在**暗色命名空间内**且是 ref → 在暗色内沿链递归（暗色引用暗色才是同主题取值）
2. 目标在暗色命名空间内且是字面值 → 返回暗色值
3. 目标**不在**暗色命名空间内 → **回落到明色命名空间**取值

```json
// 暗色引用暗色：取暗色的 primary.active
"selectedDark": { "ref": "color.primary.active" }
```

暗色 ref 还做了环检测（`检测到暗色令牌引用环`），且目标必须在明色集 / 暗色集任一中存在，否则抛 `暗色令牌 X 引用不存在`。

## color-mix 预计算

web 血脉的暗色大量使用 `color-mix()`，**原生端没有这个运行时能力**，所以在构建期**预计算为字面色值**，并把计算依据写进 description：

```json
"selected": {
  "value": "#B1C1D8",
  "description": "预计算自 color-mix(primary 40%, #fff)，暗色面板对比度 5.2:1"
},
"primary": {
  "bg": {
    "value": "rgba(61, 100, 158, 0.25)",
    "description": "预计算自 color-mix(primary 25%, transparent)"
  }
}
```

## 产物形态

`resolveTokens` 产出 `TokenSet.dark`：扁平的 `Map<path, TokenValue>`，只含被覆盖的键。各端 target 再各自决定如何发射：

| 平台 | 暗色机制 |
| --- | --- |
| Android | 独立 `object LhDarkTokens` |
| iOS | 独立 `public enum LhDarkTokens` |
| 鸿蒙 | 独立 `export class LhDarkTokens` |
| **C** | **同名宏重定义**——暗色头文件在明色之后 include，直接覆盖同名 `#define` |

## 孤儿暗色路径

两类异常被记入 `orphanDarkPaths`（**不中断 codegen**，由 `pnpm verify:tokens` 报告）：

- 暗色键**缺类型**（既无自身 type，明色集也没有同名键可继承）→ 跳过该键，不写入覆盖表
- 暗色键在明色集**不存在**（孤儿）→ 仍写入覆盖表，但报告出来

## 暗色覆盖范围

当前暗色只覆盖 `color.*` 命名空间（精确键数随版本变化，见 [令牌参考](./reference) 页的暗色列）。非颜色命名空间（间距、圆角、字号等）在暗色下沿用明色值——这也是 `dist/docs/tokens.md` 里非颜色行的暗色列是 `—` 的原因。

在 [令牌参考](./reference) 页可以同时看到每个令牌的明色与暗色值。
