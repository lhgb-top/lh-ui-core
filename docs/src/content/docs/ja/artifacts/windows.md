---
title: "Windows 生成物"
---

**パス**：`dist/windows/Tokens/LhTokens.cs` と `LhDarkTokens.cs`。投影トークンが存在する場合は `LhShadow.cs`、ベジェトークンが存在する場合は `LhEasing.cs` を追加生成

**名前空間**：`Top.Lhgb.Ui.Tokens`（リバースドメイン、マスタープラン D20）

## 構造

ネストした `public static class` でトークンの階層を表現し、メンバーは `public static readonly` です：

```csharp
public static class LhTokens {
  public static class Button {
    public static readonly double BorderRadius = 2.0;  // ボタンの角丸はグローバルの角丸に追随
    public static class Height {
      public static readonly double Large = 48.0;  // 大サイズのボタンの高さ
      public static readonly double Medium = 40.0;  // 中サイズのボタンの高さ（デフォルト）
      public static readonly double Small = 32.0;  // 小サイズのボタンの高さ
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

## メンバーの命名規則

`csMemberName(name)`：**PascalCase** に変換し（`default → Default`、`extraLarge → ExtraLarge`）、ついでに `default` / `base` などの C# コンテキストキーワードも回避します。グループ名も同様に PascalCase を通します。

## 単位とリテラル

| トークン型 | C# リテラル | フィールド型 |
| --- | --- | --- |
| 色 | `Windows.UI.Color.FromArgb(0xFF, 0x2B, 0x4C, 0x7C)` | `Windows.UI.Color` |
| 寸法（整数） | `40.0` | `double` |
| 寸法（小数） | `0.5` | `double` |
| 百分率 | `0.5  // 50%（分数。コンテナサイズから換算）` | `double` |
| 時間 | `200  // 200ms（ミリ秒）` | `int` |
| ベジェ | `new LhEasing(0.4, 0, 0.2, 1)` | `LhEasing` |
| 投影 | `new LhShadow(0xFF..., 0.0, 2.0, 8.0)` | `LhShadow` |
| 文字列 | `"'Source Code Pro', ..."` | `string` |

単位の約束：**寸法は epx（論理ピクセルで、数値をそのまま使える）**、**時間はミリ秒**（コンポーネント側は `TimeSpan.FromMilliseconds(...)`）、**色は ARGB**。

### なぜ Windows.UI.Color なのか

Windows App SDK 1.6 以下には `Microsoft.UI.Color` 構造体が**存在しません**。`Microsoft.UI.Colors` カラーテーブルのプロパティが返すのも `Windows.UI.Color` です。したがってトークン側は一律 `Windows.UI.Color` を使います——`FromArgb` ファクトリを備え、Colors テーブルとも型が一致します。コンポーネント側で Colors テーブルを参照するなら、`using Microsoft.UI;`（Colors）+ `using Windows.UI;`（Color）が必要です。

## ダーク：並列のオブジェクト

`LhDarkTokens` は `LhTokens` と並ぶ独立したオブジェクトで、**`Color` サブクラスのみを含みます**：

```csharp
public static class LhDarkTokens {
  public static class Color {
    public static readonly Windows.UI.Color Focus = Windows.UI.Color.FromArgb(0xFF, 0x7F, 0xA6, 0xD9);
    // ...
  }
}
```

ダークがオーバーライドするのは色だけで、**寸法 / モーション / 角丸はダークでも変わりません**——コンポーネントがダークの寸法を必要とするときはライトのオブジェクトの値を取ります。これは android / ios / harmony の 3 端とまったく同じ形態です。

## キャリア構造

`LhShadow.cs` と `LhEasing.cs` はいずれも `readonly record struct` です（WinUI に複合投影とベジェの直接対応型がないため）：

```csharp
public readonly record struct LhShadow(Windows.UI.Color Color, double OffsetX, double OffsetY, double BlurRadius);
public readonly record struct LhEasing(double X1, double Y1, double X2, double Y2);
```

投影の `spread`（拡張量）はすべての端で無視され、コメントで説明されます（WinUI DropShadow が対応していないため）。例：`// 拡張量 0px。WinUI DropShadow が対応していないため無視`。

## 消費方法

Windows リポジトリ（`lh-ui-windows`）の `pnpm link:tokens` が `dist/windows/` のツリー全体を `src/Tokens/` へコピーし（落とし先はソースルート配下の `Tokens/` サブディレクトリ）、コンポーネント側の `using Top.Lhgb.Ui.Tokens;` がここを指します。3 段の存在性ガード（ローカル dist → npm `@lh-ui/core` → エラー）は [ローカル連携](../guide/local-linking) を参照してください。
