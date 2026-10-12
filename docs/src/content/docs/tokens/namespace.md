---
title: "命名空间与点路径"
---

## 规则

**令牌的全局点路径 = `$namespace` + 文件内嵌套路径。**

```
tokens/color.json        "$namespace": "color"
                         primary.default.value = "#2B4C7C"
                         → 全路径 color.primary.default

tokens/z-index.json      "$namespace": "zIndex"
                         modal.value = 1050
                         → 全路径 zIndex.modal
```

所有跨文件引用（`ref`、spec 的 `tokenRefs`、cases 的 `then.tokens`）**都必须写全路径**。

## 三种命名空间情形

### 1. 缺省：由文件名推导

不声明 `$namespace` 时，由文件名按 `-` 切分推导（`namespaceFromFileName`）：首段原样，其余段首字母大写。

| 文件名 | 推导结果 |
| --- | --- |
| `color.json` | `color` |
| `z-index.json` | `zIndex` |
| `typography.json` | `typography` |
| `color-dark.json` | `colorDark`（**推导值，但实际不使用**） |

推导只是**兜底**——暗色文件都会显式声明 `$namespace` 与明色对齐（见下）。

### 2. 显式声明

`$namespace` 直接写：

```json
{ "$namespace": "zIndex", "modal": { "value": 1050 } }
```

**暗色文件必须显式声明与明色文件相同的 `$namespace`**，否则覆盖键落不到同一路径：

```json
// color-dark.json
{ "$namespace": "color", "$dark": true, "primary": { "default": { "value": "#3D649E" } } }
```

这样 `color.primary.default` 的暗色覆盖才能正确合并到明色的同一路径上。

### 3. 空串：顶层键即命名空间

`components.json` 声明 `"$namespace": ""`，于是**顶层键就是组件命名空间**，全路径直接是 `button.height.medium`、`input.borderRadius`：

```json
{
  "$namespace": "",
  "$type": "dimension",
  "button": {
    "height": { "medium": { "value": "40px" } }
  }
}
```

## 命名空间的实际影响

- **`dist/docs/tokens.md`** 按顶级命名空间分 `##` 小节（button / color / motion / zIndex …）
- **resolve 阶段**按全路径做重复检测：两个明色文件出现同一路径直接抛错
- **暗色合并**按全路径匹配覆盖键
- **各端 target** 按路径的段切分构建嵌套结构（Android `object Color`、Swift `enum Color`、C `LH_COLOR_*`）

## 完整示例

```
color.primary.active          ← color.json
button.height.medium          ← components.json（空串命名空间）
typography.fontSize.base      ← typography.json
zIndex.modal                  ← z-index.json（显式）
motion.easing.easeInOut       ← motion.json（分组嵌套）
```

在 [令牌参考](./reference) 页可以直接按命名空间浏览全部令牌。
