---
title: "Windows 产物"
---

**路径**：`dist/windows/Tokens/LhTokens.cs` 与 `LhDarkTokens.cs`，存在投影令牌时额外生成 `LhShadow.cs`，存在贝塞尔令牌时额外生成 `LhEasing.cs`

**命名空间**：`Top.Lhgb.Ui.Tokens`（反域名，总纲 D20）

## 结构

嵌套 `public static class` 表达令牌层级，成员为 `public static readonly`：

```csharp
public static class LhTokens {
  public static class Button {
    public static readonly double BorderRadius = 2.0;  // 按钮圆角跟随全局圆角
    public static class Height {
      public static readonly double Large = 48.0;  // 大号按钮高度
      public static readonly double Medium = 40.0;  // 中号按钮高度（默认）
      public static readonly double Small = 32.0;  // 小号按钮高度
    }
    // ...
  }
  public static class Color {
    public static class Primary {
      public static readonly Windows.UI.Color Default = Windows.UI.Color.FromArgb(0xFF, 0x2B, 0x4C, 0x7C);
    }
  }
}
```

## 成员命名规则

`csMemberName(name)`：转 **PascalCase**（`default → Default`、`extraLarge → ExtraLarge`），顺带规避 `default` / `base` 等 C# 上下文关键字。分组名同样走 PascalCase。

## 单位与字面量

| 令牌类型 | C# 字面量 | 字段类型 |
| --- | --- | --- |
| 颜色 | `Windows.UI.Color.FromArgb(0xFF, 0x2B, 0x4C, 0x7C)` | `Windows.UI.Color` |
| 尺寸（整数） | `40.0` | `double` |
| 尺寸（小数） | `0.5` | `double` |
| 百分数 | `0.5  // 50%（分数，由容器尺寸换算）` | `double` |
| 时长 | `200  // 200ms（毫秒）` | `int` |
| 贝塞尔 | `new LhEasing(0.4, 0, 0.2, 1)` | `LhEasing` |
| 投影 | `new LhShadow(0xFF..., 0.0, 2.0, 8.0)` | `LhShadow` |
| 字符串 | `"'Source Code Pro', ..."` | `string` |

单位约定：**尺寸为 epx（逻辑像素，数值直接可用）**、**时长为毫秒**（组件侧 `TimeSpan.FromMilliseconds(...)`）、**颜色为 ARGB**。

### 为什么是 Windows.UI.Color

Windows App SDK 1.6 及以下**不存在** `Microsoft.UI.Color` 结构体；`Microsoft.UI.Colors` 颜色表的属性返回的也是 `Windows.UI.Color`。因此令牌侧一律用 `Windows.UI.Color`——自带 `FromArgb` 工厂，且与 Colors 表类型一致。组件侧若要引用 Colors 表，需 `using Microsoft.UI;`（Colors）+ `using Windows.UI;`（Color）。

## 暗色：并列对象

`LhDarkTokens` 是与 `LhTokens` 并列的独立对象，**只含 `Color` 子类**：

```csharp
public static class LhDarkTokens {
  public static class Color {
    public static readonly Windows.UI.Color Focus = Windows.UI.Color.FromArgb(0xFF, 0x7F, 0xA6, 0xD9);
    // ...
  }
}
```

暗色只覆盖颜色，**尺寸 / 动效 / 圆角暗色不变**——组件需要暗色尺寸时取明色对象的值。这与 android / ios / harmony 三端的形态完全一致。

## 载体结构

`LhShadow.cs` 与 `LhEasing.cs` 都是 `readonly record struct`（WinUI 无复合投影与贝塞尔的直接对应类型）：

```csharp
public readonly record struct LhShadow(Windows.UI.Color Color, double OffsetX, double OffsetY, double BlurRadius);
public readonly record struct LhEasing(double X1, double Y1, double X2, double Y2);
```

投影的 `spread`（扩展量）在所有端都被忽略并注释说明（WinUI DropShadow 不支持），如 `// 扩展量 0px WinUI DropShadow 不支持，已忽略`。

## 消费方式

Windows 仓（`lh-ui-windows`）的 `pnpm link:tokens` 把 `dist/windows/` 整树拷入 `src/Tokens/`（落点是源根下的 `Tokens/` 子目录），组件侧 `using Top.Lhgb.Ui.Tokens;` 即指向此处。三级存在性守卫（本地 dist → npm `@lh-ui/core` → 报错）见 [本地联动](../guide/local-linking)。
