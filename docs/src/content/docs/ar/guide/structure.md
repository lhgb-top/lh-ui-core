---
title: "بنية الدلائل"
---

```
lh-ui-core/
├── tokens/       المصدر الأصلي الوحيد لرموز التصميم (مصادر JSON محايدة، تتضمن schema)
├── specs/        عقود المكوّنات (props / القيم المُعدَّدة / القيم الافتراضية / الأحداث / الفتحات / السلوكيات)
├── cases/        الحالات الذهبية (تأكيدات سلوكية قابلة للترجمة عبر الأطراف)
├── codegen/      أدوات codegen (TS/Node): src/ + templates/
├── dist/         منتجات codegen (تُولَّد، ويُمنع تعديلها يدويًا)
├── scripts/      سكربتات التحقق والنشر
├── tests/        اختبارات اللقطات والاختبارات الصغرى للرموز
└── docs/         مصدر موقع توثيق المطوّرين (Astro Starlight، هذا الموقع)
```

## مسؤوليات كل دليل

### `tokens/` —— المصدر الأصلي الوحيد للرموز

مصادر JSON محايدة تجاه المنصات، يفرض تنسيقها `tokens/schema.json` بشدة. 9 ملفات بيانات:

| الملف | مساحة الأسماء | المحتوى |
| --- | --- | --- |
| `color.json` | `color` | لوحة الألوان:الألوان الدلالية منظَّمة وفق default/hover/active/bg/border |
| `color-dark.json` | `color` (مطابق للوضع الفاتح) | تجاوزات تدريجية للوضع الداكن (لا يُعلَن سوى المفاتيح المختلفة عن الوضع الفاتح) |
| `components.json` | `""` (سلسلة فارغة) | رموز على مستوى المكوّن: `button.*`، `input.*` وغيرها |
| `typography.json` | `typography` | العائلات الخطية / الأحجام / الأوزان / ارتفاعات الأسطر |
| `spacing.json` | `spacing` | مقياس المسافات xs–xxl |
| `radius.json` | `radius` | زوايا الانحناء |
| `shadow.json` | `shadow` | الظلال |
| `motion.json` | `motion` | المدد + التخفيف (بيزيه المكعّب) |
| `z-index.json` | `zIndex` | الترتيب الطبقي |

يتغير العدد الدقيق للرموز الطرفية في كل ملف بين الإصدارات، وصفحة [مرجع الرموز](../tokens/reference) هي المرجع المعتمد — فتثبيت الأرقام في النص حتمًا سيقود إلى معلومات قديمة.

راجع [تنسيق الرموز](../tokens/token-format) و[مساحات الأسماء ومسارات النقاط](../tokens/namespace).

### `specs/` —— عقود المكوّنات

ملف JSON واحد لكل مكوّن: أسماء props / الأنواع / القيم المُعدَّدة / القيم الافتراضية / الأحداث / الفتحات / ملاحظات السلوك / قائمة الرموز المستهلكة. يفرض التنسيقَ `specs/schema.json` بشدة. راجع [تنسيق العقد](../specs/spec-format).

### `cases/` —— الحالات الذهبية

ملف JSON واحد لكل مكوّن: تأكيدات سلوكية قابلة للترجمة عبر الأطراف (given/when/then)، يترجمها كل مستودع أصلي يدويًا إلى اختبارات محلية. يفرض التنسيقَ `cases/schema.json` بشدة. راجع [تنسيق الحالات](../cases/case-format).

### `codegen/` —— أداة التوليد

```
codegen/
├── src/
│   ├── index.ts      مدخل تنظيم CLI (الجسم الفعلي لـ pnpm codegen)
│   ├── types.ts      جميع تعريفات الأنواع (لا تدخل منتجات وقت التشغيل)
│   ├── load.ts       تحميل JSON + تحقق Ajv schema + تسطيح
│   ├── resolve.ts    تحليل ref + دمج الوضع الداكن
│   ├── format.ts     تحليل القيم المحايدة / التنسيق لكل طرف
│   ├── tree.ts       مسار مسطّح ← شجرة متداخلة
│   ├── render.ts     تغليف Handlebars
│   └── targets/      خمسة أهداف: android / ios / harmony / c / docs
└── templates/        قوالب handlebars لكل طرف (7 ملفات .hbs)
```

راجع [نظرة عامة على خط الأنابيب](../codegen/pipeline).

### `dist/` —— المنتجات المولَّدة

**يُمنع التعديل اليدوي** (مدرج في `.gitignore`). التخطيط:

```
dist/
├── android/top/lhgb/ui/tokens/   LhTokens.kt, LhDarkTokens.kt
├── ios/Sources/LhUITokens/       LhTokens.swift, LhDarkTokens.swift, LhShadow.swift
├── harmony/tokens/               LhTokens.ets, LhDarkTokens.ets, LhShadow.ets
├── c/include/lh_ui/              lh_tokens.h, lh_dark_tokens.h
└── docs/                         tokens.md, tokens.light.json, tokens.dark.json
```

راجع [المنتجات](../artifacts/android).

### `scripts/` —— سكربتات التحقق والنشر

`verify-tokens.mts` (التحقق من الرموز: schema + سلامة المراجع + تقرير المسارات الداكنة اليتيمة)، و`verify-specs.mts` (اتساق المواصفات مع الحالات)، و`resolve-local-tokens.mjs` (حراسة الربط المحلي). يتم النشر عبر changesets (راجع [الأوامر](./commands)).

### `tests/` —— اختبارات اللقطات

يعكس `codegen-snapshot.spec.ts` جميع منتجات `dist/` (ملفات اللقطات مُلتزَمة في نظام التحكم بالنسخ)، ويشغّل `tokens.spec.ts` اختبارات صغرى للرموز.

### `docs/` —— هذا الموقع

مصدر موقع Astro Starlight (الإعداد في `docs/astro.config.mjs`، والمحتوى في `docs/src/content/docs/`). الصفحات المرجعية الثلاث (الرموز / العقود / الحالات) هي صفحات `.astro` تحت `docs/src/pages/` تستدعي دوال التحميل والتحليل الخاصة بـ codegen مباشرةً في وقت البناء لتُعرض من مصادر JSON الأصلية، دون الحاجة إلى صيانة الجداول يدويًا. للاطلاع على النشر راجع [تعليمات النشر](../deployment).
