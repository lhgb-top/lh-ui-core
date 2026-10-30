---
title: "命名空間與點路徑"
---

## 規則

**令牌的全域點路徑 = `$namespace` + 檔案內巢狀路徑。**

```
tokens/color.json        "$namespace": "color"
                         primary.default.value = "#2B4C7C"
                         → 全路徑 color.primary.default

tokens/z-index.json      "$namespace": "zIndex"
                         modal.value = 1050
                         → 全路徑 zIndex.modal
```

所有跨檔案引用（`ref`、spec 的 `tokenRefs`、cases 的 `then.tokens`）**都必須寫全路徑**。

## 三種命名空間情形

### 1. 缺省：由檔名推導

不宣告 `$namespace` 時，由檔名按 `-` 切分推導（`namespaceFromFileName`）：首段原樣，其餘段首字母大寫。

| 檔名 | 推導結果 |
| --- | --- |
| `color.json` | `color` |
| `z-index.json` | `zIndex` |
| `typography.json` | `typography` |
| `color-dark.json` | `colorDark`（**推導值，但實際不使用**） |

推導只是**兜底**——暗色檔案都會顯式宣告 `$namespace` 與明色對齊（見下）。

### 2. 顯式宣告

`$namespace` 直接寫：

```json
{ "$namespace": "zIndex", "modal": { "value": 1050 } }
```

**暗色檔案必須顯式宣告與明色檔案相同的 `$namespace`**，否則覆蓋鍵落不到同一路徑：

```json
// color-dark.json
{ "$namespace": "color", "$dark": true, "primary": { "default": { "value": "#3D649E" } } }
```

這樣 `color.primary.default` 的暗色覆蓋才能正確合併到明色的同一路徑上。

### 3. 空串：頂層鍵即命名空間

`components.json` 宣告 `"$namespace": ""`，於是**頂層鍵就是元件命名空間**，全路徑直接是 `button.height.medium`、`input.borderRadius`：

```json
{
  "$namespace": "",
  "$type": "dimension",
  "button": {
    "height": { "medium": { "value": "40px" } }
  }
}
```

## 命名空間的實際影響

- **`dist/docs/tokens.md`** 按頂級命名空間分 `##` 小節（button / color / motion / zIndex …）
- **resolve 階段**按全路徑做重複檢測：兩個明色檔案出現同一路徑直接拋錯
- **暗色合併**按全路徑匹配覆蓋鍵
- **各端 target** 按路徑的段切分構建巢狀結構（Android `object Color`、Swift `enum Color`、C `LH_COLOR_*`）

## 完整範例

```
color.primary.active          ← color.json
button.height.medium          ← components.json（空串命名空間）
typography.fontSize.base      ← typography.json
zIndex.modal                  ← z-index.json（顯式）
motion.easing.easeInOut       ← motion.json（分組巢狀）
```

在 [令牌參考](./reference) 頁可以直接按命名空間瀏覽全部令牌。
