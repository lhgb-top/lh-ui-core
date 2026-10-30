---
title: "قائمة القوالب"
---

يوجد **8 قوالب Handlebars** تحت `codegen/templates/`، **ولم تُسجَّل فيها أي مساعدات مخصصة** (لا تستخدم سوى `{{#each}}` المدمجة والأقواس الثلاثية `{{{ }}}`).

## القالب ← المنتج ← حقول البيانات

| القالب | المنتج المعروض | حقول البيانات |
| --- | --- | --- |
| `android/LhTokens.kt.hbs` | `LhTokens.kt` **و** `LhDarkTokens.kt` (مشتركة بين الوضعين) | `{ version, source, package, imports[], body }` |
| `ios/LhTokens.swift.hbs` | `LhTokens.swift` و`LhDarkTokens.swift` | `{ version, source, body }` |
| `ios/LhShadow.swift.hbs` | `LhShadow.swift` (قالب ثابت، بلا فتحة body) | `{ version, source }` |
| `harmony/LhTokens.ets.hbs` | `LhTokens.ets` و`LhDarkTokens.ets` | `{ version, source, body }` |
| `harmony/LhShadow.ets.hbs` | `LhShadow.ets` (قالب ثابت) | `{ version, source }` |
| `windows/LhTokens.cs.hbs` | `LhTokens.cs` و`LhDarkTokens.cs` | `{ version, source, namespace, body }` |
| `windows/LhShadow.cs.hbs` | `LhShadow.cs` (قالب ثابت) | `{ version, source, namespace }` |
| `windows/LhEasing.cs.hbs` | `LhEasing.cs` (قالب ثابت) | `{ version, source, namespace }` |

## اللافتة العلوية الموحَّدة

تحمل جميع القوالب في أعلاها كتلة التعليقات نفسها:

```
// =====================================================================================
// هذا الملف مُولَّد تلقائيًا بواسطة @lh-ui/core (codegen في وقت البناء)، يُمنع التعديل يدويًا.
// المصدر: {{{source}}} @ v{{{version}}}
// للتعديل، قم بتحرير tokens/*.json في مستودع lh-ui-core ثم إعادة تنفيذ pnpm codegen.
// =====================================================================================
```

وهذا التصريح على مستوى الكود بأن **تعديل `dist/` ممنوع (الخط الأحمر 6)**.

## قوالب مشتركة بين الوضعين

**تتشارك منتجات الوضع الفاتح والوضع الداكن في android / ios / harmony / windows القالب نفسه**، ولا يختلفان إلا في `body` الذي يُغذَّى به القالب (اسم الجذر object / enum / class مختلف).

## القوالب الثابتة (بنى حاملة)

لا تملك `ios/LhShadow.swift.hbs` و`harmony/LhShadow.ets.hbs` و`windows/LhShadow.cs.hbs` و`windows/LhEasing.cs.hbs` **فتحة body**، ومحتواها ثابت بالكامل:

```handlebars
{{!-- harmony/LhShadow.ets.hbs --}}
/// بنية رمز الظل
export interface LhShadow {
  color: ResourceColor
  /** نصف قطر التمويه */
  radius: number
  offsetX: number
  offsetY: number
}
```

لأن SwiftUI / ArkUI / WinUI لا تملك نوعًا مقابًلا مباشرًا لـ «الظل المركب» أو «بيزيه»، فهي تحتاج إلى بنية حاملة على جانب المنصة؛ أما ظل Android فهو واجهة برمجية من المنصة، ولا يحتاج إلى ملف إضافي. البنيتان الحاملتان في Windows كلاهما `readonly record struct`:

```handlebars
{{!-- windows/LhShadow.cs.hbs --}}
public readonly record struct LhShadow(Windows.UI.Color Color, double OffsetX, double OffsetY, double BlurRadius);
```

## مثال على القالب

```handlebars
{{!-- android/LhTokens.kt.hbs --}}
// لافتة الرأس…

package {{{package}}}

{{#each imports}}
{{{this}}}
{{/each}}

{{{body}}}
```

```handlebars
{{!-- windows/LhTokens.cs.hbs --}}
// لافتة الرأس…

namespace {{{namespace}}};

{{{body}}}
```

## مبادئ التصميم

- **قوالب رفيعة**: مسؤولة عن الهيكل العام للملف فقط (تعليقات الرأس، وpackage / namespace، وفتح/إغلاق الحماية)، أما تنسيق القيم الحرفية لكل رمز فيتم بالكامل في TS الخاص بالهدف ثم يُغذَّى به القالب كـ `body`. راجع [طبقة العرض](./render).
- **`noEscape: true`**: تحتوي القوالب على أحرف مثل `<` و`>` و`#` (`#ifndef`، `#define`، أقواس الأصناف العامة)، ولابد من إيقاف إلغاء HTML.
- **تخزين التجميع**: يخزِّن `loadTemplate` الخاص بـ `render.ts` نتيجة التجميع، تفاديًا لإعادة التجميع.

## كيفية إضافة قالب جديد

1. إضافة ملف `.hbs` إلى `codegen/templates/<platform>/`
2. تجميع البيانات في الهدف المقابل واستدعاء `render('<platform>/<name>.hbs', data)`
3. تشغيل `pnpm codegen` للاطلاع على المنتجات، و`pnpm test -- -u` لتحديث اللقطات
