---
title: "منتجات HarmonyOS"
---

**المسار**: `dist/harmony/tokens/LhTokens.ets` و`LhDarkTokens.ets`، ويُضاف `LhShadow.ets` عند وجود رموز ظلال

**دليل الوحدة**: `tokens/` (ضمن وحدة ohpm)

## البنية

الجذر `export class`، و**الأصناف المتداخلة بلا export** (لا يسمح جسم الصنف في ArkTS بتصريحات export)، والأعضاء `static readonly`:

```ts
export class LhTokens {
  class Button {
    static readonly borderRadius: Dimension | number = 2  // زاوية انحناء الزر تتبع زاوية الانحناء العامة
    static readonly borderWidth: Dimension | number = 1
    class FontSize {
      static readonly large: Dimension | number = 16
      static readonly medium: Dimension | number = 14
    }
    class Height {
      static readonly medium: Dimension | number = 40  // ارتفاع الزر المتوسط (الافتراضي)
    }
  }
  class Color {
    static readonly focus: ResourceColor = '#FF2B4C7C'
  }
}
```

## مراسلات التسمية

| مسار الرمز | العضو في ArkTS |
| --- | --- |
| `button.height.medium` | `LhTokens.Button.Height.medium` |
| `color.primary.default` | `LhTokens.Color.Primary.default` |
| `zIndex.modal` | `LhTokens.ZIndex.modal` |

## المنصة الوحيدة التي تحمل تعليقات نوعية

ArkTS مكتوب بقوة، ولذلك يحمل كل عضو تعليقًا نوعيًا (`typeAnnotation()`):

| نوع الرمز | التعليق النوعي |
| --- | --- |
| color | `ResourceColor` |
| dimension | `Dimension \| number` |
| duration / number | `number` |
| shadow | `LhShadow` |
| cubicBezier | `number[]` |
| string | `string` |

تعتمد Kotlin / Swift / C على الاستنباط من القيم الحرفية، ولا يصرِّح ArkTS وحده بالأنواع صراحةً.

## الوحدات والقيم الحرفية

| نوع الرمز | القيمة الحرفية في ArkTS |
| --- | --- |
| اللون | `'#FF2B4C7C'` (يقبل ArkUI سلاسل `#AARRGGBB`، عبر `toArgbHash`) |
| البعد | قيمة `vp` صافية (`40` بلا وحدة) |
| النسبة المئوية | `0.500  // 50% (كسر، يُحوَّل وفق حجم الحاوية)` |
| المدة | `200  // 200ms (ملي ثانية)` |
| بيزيه | `[0.4, 0, 0.2, 1]  // نقطتا تحكم بيزيه، ويستهلكه المكوّن عبر curves.cubicBezierCurve` |
| الظل | `{ color: '#FF000000', radius: 8, offsetX: 0, offsetY: 2 }` |
| القيم / السلاسل | كما هي / `JSON.stringify` |

## LhShadow.ets

لا يملك ArkUI كذلك نوع ظل مركب، فيُحمَّل عبر **واجهة** (**قالب ثابت، بلا محتوى رموز**):

```ts
export interface LhShadow {
  color: ResourceColor
  /** نصف قطر التمويه */
  radius: number
  offsetX: number
  offsetY: number
}
```

وبالمقارنة مع `struct LhShadow` في iOS: يستخدم ArkTS واجهة، ويستخدم SwiftUI بنية، وكل منهما يلائم اصطلاحات لغته.

## الوضع الداكن

`export class LhDarkTokens` مستقل، وبنيته مثل الوضع الفاتح:

```ts
export class LhDarkTokens {
  class Color {
    static readonly focus: ResourceColor = '#FF7FA6D9'
    static readonly selected: ResourceColor = '#FFB1C1D8'
    // …بقية المفاتيح المغطاة
  }
}
```

تبقى المفاتيح غير المغطاة في الوضع الداكن تأخذ قيمها من `LhTokens`.

## طريقة الاستهلاك

يُدخل مستودع HarmonyOS الدليل `dist/harmony/` عبر تبعية `file:` من ohpm (ربط محلي)، أو يستهلك الحزمة المنشورة، ويكفي استيراد `import { LhTokens } from '...'`.
