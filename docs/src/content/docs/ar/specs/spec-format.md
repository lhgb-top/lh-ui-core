---
title: "تنسيق العقد"
---

كل ملف `specs/<name>.json` هو **عقد عبر الأطراف** لمكوّن واحد. يفرض التنسيقَ `specs/schema.json` بشدة.

## البنية العلوية

```json
{
  "$schema": "./schema.json",
  "name": "button",
  "component": "LhButton",
  "since": "0.1.0",
  "description": "الزر: يطلق عملية فورية، ويدعم النوع والحجم والحالة والتعطيل والأيقونة وخلفية النمط الصيني.",
  "props": [ ... ],
  "events": [ ... ],
  "slots": [ ... ],
  "behaviors": [ ... ],
  "tokenRefs": [ ... ]
}
```

| الحقل | الإلزام | القيد |
| --- | --- | --- |
| `name` | نعم | kebab-case: `^[a-z][a-z0-9-]*$`، مطابق لاسم الملف |
| `component` | نعم | PascalCase مع بادئة Lh: `^Lh[A-Z][a-zA-Z0-9]*$` |
| `description` | نعم | وصف صيني |
| `props` | نعم | مصفوفة، بعنصر واحد على الأقل (يُفرض schema ذلك عبر `minItems: 1`) |
| `since` | لا | إصدار الإدخال |
| `events` / `slots` / `behaviors` / `tokenRefs` | لا | راجع أدناه |

`additionalProperties: false` — لا يُسمح بحقول زائدة.

## props

```json
{ "name": "size", "type": "enum", "values": ["small", "medium", "large"], "default": "medium", "description": "حجم الزر" }
```

| الحقل | الإلزام | الوصف |
| --- | --- | --- |
| `name` | نعم | camelCase: `^[a-z][a-zA-Z0-9]*$`، **موحَّد عبر الأطراف الخمسة** |
| `type` | نعم | راجع الجدول أدناه |
| `description` | نعم | شرح صيني |
| `values` | لا | قيم التعداد عندما يكون `type: enum` (مصفوفة من السلاسل النصية الحرفية) |
| `items` | **إلزامي** عندما يكون `type: array` | نوع عناصر المصفوفة (`string` / `number` / `boolean`) + الوصف |
| `default` | لا | القيمة الافتراضية (أي نوع JSON)، وحذفها يعني عدم وجود قيمة افتراضية |
| `required` | لا | قيمة منطقية، افتراضها `false` |

**سبعة أنواع لـ prop**:

| النوع | المعنى | المراسلات في كل طرف |
| --- | --- | --- |
| `string` | سلسلة نصية | `String` / `String` / `string` / `const char*` |
| `number` | قيمة عددية | `Int` / `Double` / `number` / `int` |
| `boolean` | قيمة منطقية | `Boolean` / `Bool` / `boolean` / `bool` |
| `enum` | تعداد (يجب تقديم `values`) | توليد نوع تعداد مقابل في كل طرف |
| `tokenRef` | مسار نقاط الرمز | مرجع رمز، يُتحقق من وجود المسار عند verify (**قيمة محجوزة، لا يستخدمها أي مكوّن حاليًا**) |
| `node` | فتحة / محتوى العقدة الفرعية | Compose content، وSwiftUI ViewBuilder، وArkUI Builder، ومقبض العقدة الفرعية في C (**قيمة محجوزة، لا يستخدمها أي مكوّن حاليًا**) |
| `array` | مصفوفة (يجب تقديم `items`) | عناصر المرشَّحة في المُنتقي وغيرها |

## events

```json
{
  "name": "onValueChange",
  "payload": [{ "name": "value", "type": "string", "description": "النص بعد التغيير" }],
  "description": "يُطلق عند تغير النص؛ ولا يُطلق عندما يكون disabled أو readonly يساوي true"
}
```

- `name`: `^on[A-Z][a-zA-Z0-9]*$`، **موحَّد عبر الأطراف الخمسة**
- `payload`: مصفوفة حقول (كل عنصر `name` + `type` + `description` اختياري)، **والمصفوفة الفارغة تعني غياب الحِمل**
- `description`: إلزامي

## slots

```json
{ "name": "prefix", "description": "محتوى بادئة حقل الإدخال (المنطقة غير القابلة للإدخال على جهة البداية)" }
```

`name` كذلك camelCase. أما **تنفيذ الفتحة على جانب المنصة** فيحمله prop من نوع `node` أو آلية الفتحات في كل طرف.

## behaviors

مصفوفة من أوصاف السلوك بلغة طبيعية، لاستخراج الحالات وتوليد التوثيق:

```json
"behaviors": [
  "عندما يكون disabled يساوي true: لا يستجيب للنقر، ويعرض نمط الحالة المعطَّلة (رموز disabled.*)، ولا يطلق onClick",
  "تعيين size: يأخذ small/medium/large على التوالي رموز الأبعاد مثل button.height.<size>"
]
```

## tokenRefs

قائمة **المسارات الكاملة** للرموز التي يستهلكها هذا المكوّن، ليتحقق `pnpm verify:specs` من سلامة المراجع:

```json
"tokenRefs": ["button.height.medium", "color.primary.default", "color.onPrimary"]
```

## لماذا هذه الصرامة في التسمية

جميع التعابير القياسية للتسمية هي **من أجل المحاذاة عبر الأطراف**: يحدد `name` اسم الملف وتسميات الاختبارات في كل طرف، و`component` هو أساس أسماء الأصناف في كل طرف، وتظل أسماء props وأسماء events متطابقة عبر الأطراف الخمسة، لكي يمكن ترجمة الحالات بناءً عليها.

## قائمة المكوّنات الحالية

15 مكوّنًا: button، cell، checkbox، dialog، icon، input، loading، navbar، picker، radio، switch، tag، text، textarea، toast. للاطلاع على جميع العقود راجع [مرجع عقود المكوّنات](./reference).
