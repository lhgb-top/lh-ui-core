---
title: "Windows 產物"
---

**路徑**：`dist/windows/Tokens/LhTokens.cs` 與 `LhDarkTokens.cs`，存在投影令牌時額外生成 `LhShadow.cs`，存在貝茲令牌時額外生成 `LhEasing.cs`

**命名空間**：`Top.Lhgb.Ui.Tokens`（反域名，總綱 D20）

## 結構

巢狀 `public static class` 表達令牌層級，成員為 `public static readonly`：

```csharp
public static class LhTokens {
  public static class Button {
    public static readonly double BorderRadius = 2.0;  // 按鈕圓角跟隨全域圓角
    public static class Height {
      public static readonly double Large = 48.0;  // 大號按鈕高度
      public static readonly double Medium = 40.0;  // 中號按鈕高度（預設）
      public static readonly double Small = 32.0;  // 小號按鈕高度
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

## 成員命名規則

`csMemberName(name)`：轉 **PascalCase**（`default → Default`、`extraLarge → ExtraLarge`），順帶規避 `default` / `base` 等 C# 上下文關鍵字。分組名同樣走 PascalCase。

## 單位與字面值

| 令牌類型 | C# 字面值 | 欄位類型 |
| --- | --- | --- |
| 顏色 | `Windows.UI.Color.FromArgb(0xFF, 0x2B, 0x4C, 0x7C)` | `Windows.UI.Color` |
| 尺寸（整數） | `40.0` | `double` |
| 尺寸（小數） | `0.5` | `double` |
| 百分數 | `0.5  // 50%（分數，由容器尺寸換算）` | `double` |
| 時長 | `200  // 200ms（毫秒）` | `int` |
| 貝茲 | `new LhEasing(0.4, 0, 0.2, 1)` | `LhEasing` |
| 投影 | `new LhShadow(0xFF..., 0.0, 2.0, 8.0)` | `LhShadow` |
| 字串 | `"'Source Code Pro', ..."` | `string` |

單位約定：**尺寸為 epx（邏輯像素，數值直接可用）**、**時長為毫秒**（元件側 `TimeSpan.FromMilliseconds(...)`）、**顏色為 ARGB**。

### 為什麼是 Windows.UI.Color

Windows App SDK 1.6 及以下**不存在** `Microsoft.UI.Color` 結構體；`Microsoft.UI.Colors` 顏色表的屬性傳回的也是 `Windows.UI.Color`。因此令牌側一律用 `Windows.UI.Color`——自帶 `FromArgb` 工廠，且與 Colors 表類型一致。元件側若要引用 Colors 表，需 `using Microsoft.UI;`（Colors）+ `using Windows.UI;`（Color）。

## 暗色：並列物件

`LhDarkTokens` 是與 `LhTokens` 並列的獨立物件，**只含 `Color` 子類別**：

```csharp
public static class LhDarkTokens {
  public static class Color {
    public static readonly Windows.UI.Color Focus = Windows.UI.Color.FromArgb(0xFF, 0x7F, 0xA6, 0xD9);
    // ...
  }
}
```

暗色只覆蓋顏色，**尺寸 / 動效 / 圓角暗色不變**——元件需要暗色尺寸時取明色物件的值。這與 android / ios / harmony 三端的形態完全一致。

## 載體結構

`LhShadow.cs` 與 `LhEasing.cs` 都是 `readonly record struct`（WinUI 無複合投影與貝茲的直接對應類型）：

```csharp
public readonly record struct LhShadow(Windows.UI.Color Color, double OffsetX, double OffsetY, double BlurRadius);
public readonly record struct LhEasing(double X1, double Y1, double X2, double Y2);
```

投影的 `spread`（擴展量）在所有端都被忽略並註解說明（WinUI DropShadow 不支援），如 `// 扩展量 0px WinUI DropShadow 不支持，已忽略`。

## 消費方式

Windows 倉（`lh-ui-windows`）的 `pnpm link:tokens` 把 `dist/windows/` 整樹拷入 `src/Tokens/`（落地是源根下的 `Tokens/` 子目錄），元件側 `using Top.Lhgb.Ui.Tokens;` 即指向此處。三級存在性守衛（本地 dist → npm `@lh-ui/core` → 報錯）見 [本地連動](../guide/local-linking)。
