---
title: "منتجات Android"
---

**المسار**: `dist/android/top/lhgb/ui/tokens/LhTokens.kt` و`LhDarkTokens.kt`

**اسم الحزمة**: `top.lhgb.ui.tokens` (اصطلاح النطاق العكسي، الخطة الرئيسية D20)

## البنية

الرموز منظَّمة وفق هرمية المسار على هيئة **`object` متداخل**، والأعضاء `val`:

```kotlin
package top.lhgb.ui.tokens

import androidx.compose.ui.graphics.Color as ComposeColor
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.graphics.Shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.animation.core.CubicBezierEasing

object LhTokens {
  object Button {
    val borderRadius = 2.dp  // زاوية انحناء الزر تتبع زاوية الانحناء العامة
    val borderWidth = 1.dp
    object FontSize {
      val large = 16.sp
      val medium = 14.sp
    }
    object Height {
      val medium = 40.dp  // ارتفاع الزر المتوسط (الافتراضي)
      val small = 32.dp  // ارتفاع الزر الصغير
    }
  }
  object Color {
    val focus = ComposeColor(0xFF2B4C7C)
  }
}
```

## مراسلات التسمية

| مسار الرمز | العضو في Kotlin |
| --- | --- |
| `button.height.medium` | `LhTokens.Button.Height.medium` |
| `color.primary.default` | `LhTokens.Color.Primary.default` |
| `zIndex.modal` | `LhTokens.ZIndex.modal` |

تمر أسماء المجموعات عبر `pascalCase` (تكبير الحرف الأول فقط)، وتُحفظ أسماء الأعضاء كما هي.

## الوحدات والقيم الحرفية

| نوع الرمز | القيمة الحرفية في Kotlin |
| --- | --- |
| اللون | `ComposeColor(0xFF2B4C7C)` (ARGB Int) |
| البعد | `40.dp`؛ **رموز أحجام الخطوط (المسار يحتوي fontsize) تستخدم `.sp`**، وما عداها `.dp` |
| النسبة المئوية | `0.50f  // 50% (كسر، يُحوَّل وفق حجم الحاوية)` |
| المدة | `200  // 200ms (ملي ثانية)` (Int) |
| بيزيه | `CubicBezierEasing(0.4f, 0f, 0.2f, 1f)` |
| الظل | `Shadow(color = ..., offset = Offset(0f, 2f), blurRadius = 8f)` |
| القيم / السلاسل | كما هي / `JSON.stringify` |

للحكم على dp/sp راجع `usesSp()` الخاصة بـ `format.ts` (`/fontsize/i`).

## الاستيرادات تُولَّد حسب الحاجة

تُحدَّد قائمة الاستيرادات وفق **أنواع وقت التشغيل المستخدمة فعليًا** (`importsFor(features)`)، وما لا يُستخدم منها لا يُستورد:

| الخاصية | import |
| --- | --- |
| اللون | `androidx.compose.ui.graphics.Color as ComposeColor` |
| البعد | `androidx.compose.ui.unit.dp` + `.sp` |
| الظل | `androidx.compose.ui.graphics.Shadow` + `androidx.compose.ui.geometry.Offset` |
| بيزيه | `androidx.compose.animation.core.CubicBezierEasing` |

## الوضع الداكن

`object LhDarkTokens` مستقل، **وبنية مساحة الأسماء متطابقة مع الوضع الفاتح**:

```kotlin
object LhDarkTokens {
  object Color {
    val focus = ComposeColor(0xFF7FA6D9)  // لون حلقة تركيز لوحة المفاتيح، يتبع اللون الأساسي افتراضيًا
    val selected = ComposeColor(0xFFB1C1D8)  // لون النص في الحالة المحددة، ويتبع نمط الضغط للون الأساسي
    object Background {
      ...
    }
  }
}
```

لا يحتوي الوضع الداكن إلا على المفاتيح المغطاة (حاليًا `color.*` فقط)، وتبقى المفاتيح غير المغطاة في الوضع الداكن تأخذ قيمها من `LhTokens`.

## طريقة الاستهلاك

يُدخل مستودع Android الدليل `dist/android/` كمجموعة مصادر Gradle أو تبعية Maven محلية، ويكفي استيراد `import top.lhgb.ui.tokens.LhTokens`. للاطلاع على الربط المحلي راجع [الربط المحلي](../guide/local-linking).
