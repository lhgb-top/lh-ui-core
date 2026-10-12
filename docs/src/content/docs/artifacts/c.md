---
title: "C 产物"
---

**路径**：`dist/c/include/lh_ui/lh_tokens.h` 与 `lh_dark_tokens.h`

**目录约定**：`include/lh_ui/`（头文件目录）

## 结构

C 没有命名空间，用**扁平 `#define` 宏**，树只用来生成分节注释：

```c
#ifndef LH_UI_TOKENS_H
#define LH_UI_TOKENS_H

/* 色值为 0xAARRGGBB；尺寸为逻辑像素（整型或浮点）；时长为毫秒 */

/* --- button --- */
#define LH_BUTTON_BORDER_RADIUS 2  /* 按钮圆角跟随全局圆角 */
#define LH_BUTTON_FONT_WEIGHT 400
/* --- button.fontSize --- */
#define LH_BUTTON_FONT_SIZE_LARGE 16
#define LH_BUTTON_FONT_SIZE_MEDIUM 14
/* --- button.height --- */
#define LH_BUTTON_HEIGHT_LARGE 48  /* 大号按钮高度 */
#define LH_COLOR_DECORATION 0x1FB8860B
#endif /* LH_UI_TOKENS_H */
```

## 宏命名规则

`macroName(path)`：点路径转大写蛇形——先把 `.` 转下划线，再给每个**大写字母前补下划线**，最后全大写：

| 令牌路径 | 宏名 |
| --- | --- |
| `color.primary.default` | `LH_COLOR_PRIMARY_DEFAULT` |
| `zIndex.modal` | `LH_Z_INDEX_MODAL`（大写 Z 前补下划线） |
| `button.height.medium` | `LH_BUTTON_HEIGHT_MEDIUM` |

前缀统一 `LH_`（总纲 D20 的 C 宏约定）。

## 单位与字面量

| 令牌类型 | C 字面量 |
| --- | --- |
| 颜色 | `0xFF2B4C7C`（ARGB 十六进制整型） |
| 尺寸（整数） | `40` |
| 尺寸（小数） | `0.5f`（`floatLiteral` 给整数补 `.0f`，避免 `0f` 非法后缀） |
| 百分数 | `0.500f  /* 50% 分数 */` |
| 时长 | `200  /* 200ms 毫秒 */` |
| 贝塞尔 | `{ 0.4f, 0.0f, 0.2f, 1.0f }`（静态数组） |
| 投影 | `{ 0xFF000000, 0.0f, 2.0f, 8.0f }`（颜色 + x + y + blur） |

头文件注释明确了单位约定：**色值为 `0xAARRGGBB`、尺寸为逻辑像素、时长为毫秒**。

## 暗色：宏重定义

C 端的暗色机制与其它三端**完全不同**——不用独立命名空间，而是**同名宏重定义**：

```c
/* lh_dark_tokens.h */
/* 暗色覆盖：以下宏在明色令牌之后包含，覆盖同名定义 */
#define LH_COLOR_FOCUS 0xFF7FA6D9
#define LH_COLOR_SELECTED 0xFFB1C1D8
```

使用方在包含明色头文件**之后**再包含暗色头文件，同名宏即被覆盖：

```c
#include "lh_ui/lh_tokens.h"
#include "lh_ui/lh_dark_tokens.h"   /* 暗色覆盖生效 */
```

暗色产物连树都不构（`buildDarkCBody` 直接扁平输出），因为分节注释对覆盖场景没意义。

## 投影的 spread

所有端的投影都忽略 `spread`（扩展量）并注释说明，C 端同样如此：`/* 扩展量 0px 已忽略 */`。

## 消费方式

C 仓通过 CMake `add_subdirectory` 或直接把 `dist/c/include/` 加入头文件搜索路径，`#include "lh_ui/lh_tokens.h"` 即可使用。
