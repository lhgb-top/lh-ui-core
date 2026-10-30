---
title: "تنسيق الحالات"
---

كل ملف `cases/<name>.json` هو مجموعة **الحالات الذهبية** لمكوّن واحد: تأكيدات سلوكية قابلة للترجمة عبر الأطراف. يفرض التنسيقَ `cases/schema.json` بشدة.

## فكرة التصميم

> لا تُشارك البنية المنطقية، وإنما السلوك.

لا تشارك الأطراف الأصلية **أي كود اختبار**، بل تترجم الحالات نفسها يدويًا إلى اختبارات محلية (JUnit / XCTest / ohpm test / اختبارات C). تصف الحالات **السلوك** فقط (ما الشروط المعطاة، ما الفعل، ما النتيجة المتوقعة)، دون أي API خاص بطرف بعينه.

## البنية العلوية

```json
{
  "$schema": "./schema.json",
  "component": "button",
  "cases": [ ... ]
}
```

- `component`: kebab-case، **ويجب أن يتطابق مع `name` في المواصفات التي تحمل الاسم نفسه**
- `cases`: حالة واحدة على الأقل

## بنية الأجزاء الثلاثة

كل حالة تتطلب إلزاميًا `id` / `name` / `given` / `when` / `then`:

```json
{
  "id": "disabled-blocks-click",
  "name": "الحالة المعطَّلة لا تطلق onClick",
  "given": { "props": { "disabled": true } },
  "when": { "action": "click" },
  "then": {
    "events": [{ "name": "onClick", "assertion": "notEmitted" }],
    "enabled": false
  }
}
```

### given (المقدمات)

| الحقل | الوصف |
| --- | --- |
| `props` | props الابتدائية، **يجب أن تكون المفاتيح موجودة ضمن props في المواصفات التي تحمل الاسم نفسه** |
| `state` | حالة المكوّن الابتدائية، **مفاتيح حر**، تُستخدم للسيناريوهات الخاصة بطرف بعينه (مثل `{ "text": "زر" }`) |

### when (الفعل)

| الحقل | الوصف |
| --- | --- |
| `action` | **إلزامي**، إحدى ست قيم (راجع أدناه) |
| `target` | هدف الفعل (مثل اسم فتحة أو اسم مكوّن فرعي) |
| `payload` | حِمل الفعل (مثل نص في حالة input) |

**ستة أفعال**: `render` (عرض) / `click` (نقر) / `input` (إدخال) / `focus` (اكتساب التركيز) / `blur` (فقدان التركيز، **محجوز، لا يستخدمه أي مكوّن حاليًا**) / `custom` (مخصص، **يجب أن يوضحه `target`**).

### then (التأكيدات)

| الحقل | الوصف |
| --- | --- |
| `events` | مصفوفة تأكيدات الأحداث |
| `tokens` | مصفوفة تأكيدات تطبيق الرموز |
| `visible` | توقع الظهور من عدمه |
| `enabled` | توقع إمكانية التفاعل من عدمه |
| `text` | النص المتوقع عرضه |
| `notes` | شرح تأكيدات إضافي مستقل عن المنصات (لغة طبيعية) |

**تأكيد الأحداث**:

```json
{
  "name": "onValueChange",
  "assertion": "emitted",
  "times": 1,
  "payload": { "value": "青花瓷" }
}
```

- `name`: **يجب أن يكون موجودًا ضمن events في المواصفات التي تحمل الاسم نفسه**
- `assertion`: `emitted` (أُطلق) أو `notEmitted` (لم يُطلق)
- `times`: اختياري، العدد المتوقع للإطلاق
- `payload`: اختياري، الحِمل المتوقع (**مقارنة عميقة**)

**تأكيد الرموز**:

```json
{ "path": "button.height.large", "applied": false }
```

`path` هو المسار الكامل للرمز، ويؤكد `applied` **هل** طُبِّق الرمز على نتيجة العرض. وتُستخدم **التأكيدات العكسية** بقيمة `applied: false` لاختبارات الانفراد في الأبعاد (مثل: عند اختيار الحجم small، لا ينبغي استهلاك `button.height.large`).

## أمثلة كاملة

```json
{
  "id": "small-size-uses-small-tokens",
  "name": "الحجم الصغير يستهلك رموز الحجم small",
  "given": { "props": { "size": "small" } },
  "when": { "action": "render" },
  "then": {
    "tokens": [
      { "path": "button.height.small",   "applied": true },
      { "path": "button.fontSize.small", "applied": true },
      { "path": "button.height.large",   "applied": false }
    ]
  }
}
```

```json
{
  "id": "clearable-emits-empty-value",
  "name": "زر المسح يطلق قيمة فارغة",
  "given": { "props": { "value": "نص موجود", "clearable": true } },
  "when": { "action": "custom", "payload": { "call": "clear" } },
  "then": {
    "events": [{ "name": "onValueChange", "assertion": "emitted", "times": 1, "payload": { "value": "" } }]
  }
}
```

## العلاقة مع المواصفات

يتحقق `pnpm verify:specs` من:

- هل مفاتيح `given.props` جميعها ضمن props في المواصفات
- هل `then.events[].name` جميعها ضمن events في المواصفات

لذلك **عند تعديل أسماء props / events في المواصفات، يجب تعديل الحالات تبعًا لذلك**.

## قائمة المكوّنات الحالية

15 مكوّنًا، ويتغير العدد الإجمالي للحالات بين الإصدارات. للاطلاع على جميع الحالات راجع [مرجع الحالات الذهبية](./reference).
