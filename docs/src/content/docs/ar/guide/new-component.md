---
title: "إضافة مكوّن جديد"
---

تستغرق إضافة مكوّن جديد إلى السلالة الأصلية خمس خطوات بالترتيب.

## 1. كتابة عقد المكوّن `specs/<name>.json`

التصريح بـ props / القيم المُعدَّدة / القيم الافتراضية / الأحداث / الفتحات / السلوكيات / الرموز المستهلكة.

```json
{
  "$schema": "./schema.json",
  "name": "stepper",
  "component": "LhStepper",
  "since": "0.1.0",
  "description": "الخطّاف (stepper): يزيد قيمة أو ينقصها بمقدار خطوة ثابتة ضمن نطاق محدد.",
  "props": [
    { "name": "value", "type": "number", "default": 0, "description": "القيمة الحالية (متحكم بها)" },
    { "name": "step", "type": "number", "default": 1, "description": "حجم الخطوة" },
    { "name": "disabled", "type": "boolean", "default":  false, "description": "ما إذا كان معطَّلًا" }
  ],
  "events": [
    { "name": "onChange", "payload": [{ "name": "value", "type": "number", "description": "القيمة بعد التغيير" }], "description": "يُطلق عند تغير القيمة" }
  ],
  "behaviors": [
    "عندما يكون disabled يساوي true: لا يستجيب زرّا الزيادة والنقصان، ولا يُطلق onChange"
  ],
  "tokenRefs": ["stepper.height", "stepper.buttonSize"]
}
```

لقيود الحقول، راجع [تنسيق العقد](../specs/spec-format).

## 2. كتابة الحالات الذهبية `cases/<name>.json`

كتابة تأكيد given/when/then واحد لكل سلوك يحتاج إلى ضمان عبر الأطراف:

```json
{
  "$schema": "./schema.json",
  "component": "stepper",
  "cases": [
    {
      "id": "disabled-blocks-change",
      "name": "الحالة المعطَّلة لا تطلق onChange",
      "given": { "props": { "disabled": true } },
      "when": { "action": "click", "target": "زر الزيادة" },
      "then": {
        "events": [{ "name": "onChange", "assertion": "notEmitted" }],
        "enabled": false
      }
    }
  ]
}
```

للتنسيق التفصيلي راجع [تنسيق الحالات](../cases/case-format).

## 3. تشغيل التحقق

```bash
pnpm verify:specs
```

يتحقق هذا من اتساق الحالات مع المواصفات: هل مفاتيح `given.props` في الحالة جميعها ضمن props الخاصة بالمواصفات، وهل `then.events[].name` جميعها ضمن events الخاصة بالمواصفات، وغير ذلك.

## 4. إضافة الرموز على مستوى المكوّن (عند الحاجة)

إذا أدخل المكوّن **رموزًا على مستوى المكوّن** (مثل `stepper.height`)، تُضاف المفاتيح ضمن مساحة أسماء المكوّن المقابلة في `tokens/components.json`:

```json
"stepper": {
  "height": { "value": "32px", "description": "ارتفاع الخطّاف", "nativeOnly": true },
  "buttonSize": { "value": "24px", "description": "حجم زرّي الزيادة والنقصان" }
}
```

ثم:

```bash
pnpm codegen      # إعادة توليد dist/
pnpm verify:tokens
pnpm test -- -u   # تحديث اللقطات
```

إذا كانت الرموز الجديدة على **مستوى العلامة التجارية** (قيم عامة مثل لوحة الألوان أو مقياس المسافات بدلًا من أبعاد المكوّن)، فعدّل `tokens/<category>.json` المقابل، وسجّل التغيير في قسم «سجل التغييرات» من `docs/设计语言基线.md` الخاص بالعائلة.

## 5. الإصدار

```bash
pnpm changeset    # كتابة مجموعة تغييرات
pnpm changeset:version
```

يُصدر core أولًا، ثم ترفع الأطراف الأصلية نسخة تبعية الرموز، وتُترجم الحالات من `cases/stepper.json` يدويًا إلى اختبارات محلية (JUnit / XCTest / ohpm test / اختبارات C).

## قائمة التحقق

- [ ] يوجد `specs/<name>.json` ونجح `pnpm verify:specs`
- [ ] يوجد `cases/<name>.json` وهو متسق مع المواصفات
- [ ] أُضيفت الرموز الجديدة إلى `tokens/` ونجح `pnpm verify:tokens`
- [ ] نجح `pnpm codegen` وتُحدِّثت لقطات `pnpm test`
- [ ] كُتبت مجموعة التغييرات
- [ ] (رموز مستوى العلامة التجارية) سُجِّلت في وثيقة خط أساس العائلة
