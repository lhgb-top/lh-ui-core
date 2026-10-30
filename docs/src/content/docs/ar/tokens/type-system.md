---
title: "نظام الأنواع"
---

## سبعة أنواع

يسمح لـ `type` وللـ `$type` على مستوى الملف بسبع قيم فقط: `color` / `dimension` / `number` / `string` / `shadow` / `duration` / `cubicBezier` (بمراسلات واحد لواحد مع تعدادات `tokens/schema.json`، راجع `TokenType` في `codegen/src/types.ts`).

للحصول على الأشكال القانونية لقيم كل نوع راجع [تنسيق الرموز](./token-format).

## أولويات الأنواع ذات الطبقات الثلاث

يُحلَّل نوع الرمز الطرفي بالترتيب التالي:

```
1. النوع الذي يُعلِنه الرمز الطرفي بنفسه
2. نوع الهدف الذي يشير إليه ref (فقط عندما لا يكون للرمز الطرفي نوع خاص به)
3. $type على مستوى الملف / على مستوى المجموعة
4. عدم وجود أي مما سبق ← رمي خطأ في مرحلة resolve
```

تُنفَّذ هذه الأولويات عبر **تعاون مرحلتي flatten وresolve**.

### المرحلة الأولى: flatten (هبوط `$type` على مستوى المجموعة)

ينقل `flatten` الخاص بـ `load.ts` قيمة `$type` المُعلَنة في المجموعة (بما في ذلك جذر الملف) نزولًا على الشجرة، لكنه **يخبزها في الرموز الحرفية فقط**:

```ts
// ترث الرموز الحرفية نوع المجموعة؛ أما رموز ref فتبقى undefined، ويُترك التحديد لـ resolve ليأخذ النوع من الهدف المُشار إليه
if (node.type === undefined && node.ref === undefined && groupType !== undefined) {
  out.set(path, { ...node, type: groupType })
}
```

**رموز ref لا تُخبز عمدًا** — تفاديًا لتضليلها بالنوع الافتراضي للملف الذي تتواجد فيه.

### المرحلة الثانية: resolve (نوع هدف ref يغطي الافتراضي على مستوى الملف)

عند تجميع خريطة الوضع الفاتح في `resolve.ts`:

```ts
token: {
  type: raw.type ?? (file.defaultType as ResolvedToken['type']),  // يأخذ قيمة $type على مستوى الملف كتراجع أولًا
  ...
},
ownType: raw.type,  // مخصص للتمييز بين «النوع الذي أعلنه الرمز بنفسه» و«الافتراضي على مستوى الملف»
```

بعد عودة تحليل ref:

```ts
// عند عدم الإعلان عن نوع ذاتي، يُعتمد نوع الهدف المُشار إليه (نوع الرمز يتبع المصدر الأصلي)
if (entry.ownType === undefined && resolved.type !== undefined) {
  entry.token.type = resolved.type
}
```

هذه الخطوة تضع **الطبقة الثانية (نوع هدف ref)** فوق **الطبقة الثالثة (`$type` على مستوى الملف)**. وفي النهاية، إن بقي النوع undefined، يُطلق `الرمز X يفتقر إلى النوع`.

## لماذا الطبقات الثلاث

مثال نموذجي: `button.fontWeight` يشير إلى `typography.fontWeight.primary`:

```json
// components.json ($type على مستوى الملف: dimension)
"button": { "fontWeight": { "ref": "typography.fontWeight.primary" } }

// typography.json
"fontWeight": { "primary": { "value": 400, "type": "number" } }
```

لو تناول رمز ref أيضًا قيمة `dimension` الخاصة بمستوى الملف، لكان نوع `button.fontWeight` خاطئًا. أولويات الطبقات الثالث تضمن أنه **يأخذ `number` تبعًا للهدف المُشار إليه**.

ومثال آخر: لا يمتلك `typography.json` قيمة `$type` على مستوى الملف، بل يعتمد على `$type` على مستوى المجموعة (مجموعة `fontSize` موسومة بـ `dimension`) وعلى `type` ذاتي في الرموز (`fontWeight.primary` يمتلك `number`)، وكل منهما يدير شأنه.

## التحقق الدلالي

يتولى schema الهيكل فقط. أما **مطابقة النوع للقيمة** فيؤكدها `assertTypedValue` الخاص بـ `format.ts` في مرحلة resolve واحدًا تلو الآخر مع تحليل القيمة فعليًا:

- `color` ← يجب أن يقبل التحليل عبر `parseColor` (سداسي عشري أو rgba)
- `dimension` ← يجب أن يطابق `/^\d+(\.\d+)?(px|%)$/`
- `duration` ← يدعم `s` / `ms`
- `shadow` ← التقسيم بمسافة، وإذا طابق المقطع الرابع `-?\d+(\.\d+)?px` فهو spread وإلا فهو لون
- `cubicBezier` ← مصفوفة رباعية

راجع [طبقة التنسيق](../codegen/format).

## استنتاج النوع في الجانب الداكن

استنتاج النوع للمفاتيح المغطاة في الوضع الداكن أبسط: `raw.type ?? byPath.get(path)?.type`. المفاتيح الداكنة التي تفتقر إلى النوع لا تُفشل codegen، بل تُسجَّل في `orphanDarkPaths` ويُبلَّغ عنها عبر `pnpm verify:tokens`. راجع [دمج الوضع الداكن](./dark-mode).
