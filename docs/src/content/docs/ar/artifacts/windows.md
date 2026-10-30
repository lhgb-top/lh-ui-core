---
title: "منتجات Windows"
---

**المسار**: `dist/windows/Tokens/LhTokens.cs` و`LhDarkTokens.cs`، ويُضاف `LhShadow.cs` عند وجود رموز ظلال، ويُضاف `LhEasing.cs` عند وجود رموز بيزيه

**مساحة الأسماء**: `Top.Lhgb.Ui.Tokens` (نطاق عكسي، الخطة الرئيسية D20)

## البنية

استخدام `public static class` متداخل للتعبير عن هرمية الرموز، والأعضاء `public static readonly`:

```csharp
public static class LhTokens {
  public static class Button {
    public static readonly double BorderRadius = 2.0;  // زاوية انحناء الزر تتبع زاوية الانحناء العامة
    public static class Height {
      public static readonly double Large = 48.0;  // ارتفاع الزر الكبير
      public static readonly double Medium = 40.0;  // ارتفاع الزر المتوسط (الافتراضي)
      public static readonly double Small = 32.0;  // ارتفاع الزر الصغير
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

## قواعد تسمية الأعضاء

`csMemberName(name)`: التحويل إلى **PascalCase** (`default` ← `Default`، `extraLarge` ← `ExtraLarge`)، مع تجاوز الكلمات المفتاحية السياقية في C# مثل `default` / `base`. وتمر أسماء المجموعات كذلك عبر `pascalCase`.

## الوحدات والقيم الحرفية

| نوع الرمز | القيمة الحرفية في C# | نوع الحقل |
| --- | --- | --- |
| اللون | `Windows.UI.Color.FromArgb(0xFF, 0x2B, 0x4C, 0x7C)` | `Windows.UI.Color` |
| البعد (عدد صحيح) | `40.0` | `double` |
| البعد (عدد عشري) | `0.5` | `double` |
| النسبة المئوية | `0.5  // 50% (كسر، يُحوَّل وفق حجم الحاوية)` | `double` |
| المدة | `200  // 200ms (ملي ثانية)` | `int` |
| بيزيه | `new LhEasing(0.4, 0, 0.2, 1)` | `LhEasing` |
| الظل | `new LhShadow(0xFF..., 0.0, 2.0, 8.0)` | `LhShadow` |
| السلسلة | `"'Source Code Pro', ..."` | `string` |

اصطلاحات الوحدات: **الأبعاد بـ epx (البكسل المنطقي، القيمة صالحة مباشرة)**، و**المدد بالملي ثانية** (على جانب المكوّن `TimeSpan.FromMilliseconds(...)`)، و**الألوان ARGB**.

### لماذا Windows.UI.Color

لا وجود للبنية `Microsoft.UI.Color` في Windows App SDK 1.6 وما دونه؛ والخصائص التي يعيدها جدول الألوان `Microsoft.UI.Colors` هي أيضًا من النوع `Windows.UI.Color`. ولذلك تستخدم رموز `Windows.UI.Color` حصرًا — فهي تملك المصنع `FromArgb`، ونوعها يتطابق مع جدول Colors. وعلى جانب المكوّن، للإشارة إلى جدول Colors يلزم `using Microsoft.UI;` (Colors) + `using Windows.UI;` (Color).

## الوضع الداكن: كائنات متجاورة

`LhDarkTokens` كائن مستقل يجاور `LhTokens`، **ولا يحتوي إلا على الصنف الفرعي `Color`**:

```csharp
public static class LhDarkTokens {
  public static class Color {
    public static readonly Windows.UI.Color Focus = Windows.UI.Color.FromArgb(0xFF, 0x7F, 0xA6, 0xD9);
    // ...
  }
}
```

لا يغطي الوضع الداكن سوى الألوان، **أما الأبعاد / الحركة / الزوايا فتبقى ثابتة في الوضع الداكن** — وعندما يحتاج المكوّن أبعادًا في الوضع الداكن يأخذها من كائن الوضع الفاتح. وهذا متطابق تمامًا مع شكل الأطراف الثلاثة android / ios / harmony.

## البنى الحاملة

كلًا من `LhShadow.cs` و`LhEasing.cs` هو `readonly record struct` (فـ WinUI لا يملك نوعًا مقابًلاً مباشرًا للظل المركب وبيزيه):

```csharp
public readonly record struct LhShadow(Windows.UI.Color Color, double OffsetX, double OffsetY, double BlurRadius);
public readonly record struct LhEasing(double X1, double Y1, double X2, double Y2);
```

يُهمَل `spread` (مقدار الانتشار) للظل ويُوضَّح بتعليق في جميع الأطراف (لأن DropShadow في WinUI لا يدعمه)، مثل `// مقدار الانتشار 0px، DropShadow في WinUI لا يدعمه، وقد تُجوهل`.

## طريقة الاستهلاك

ينسخ `pnpm link:tokens` الخاص بمستودع Windows (`lh-ui-windows`) شجرة `dist/windows/` بالكامل إلى `src/Tokens/` (موقع الهبوط هو الدليل الفرعي `Tokens/` تحت جذر المصدر)، ويشير `using Top.Lhgb.Ui.Tokens;` على جانب المكوّن إلى هذا الموقع. للحصول على حراسة الوجود ثلاثية المستويات (dist محلي ← npm `@lh-ui/core` ← خطأ) راجع [الربط المحلي](../guide/local-linking).
