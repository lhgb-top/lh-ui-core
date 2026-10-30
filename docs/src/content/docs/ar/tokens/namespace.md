---
title: "مساحات الأسماء ومسارات النقاط"
---

## القاعدة

**مسار النقاط العام للرمز = `$namespace` + المسار المتداخل داخل الملف.**

```
tokens/color.json        "$namespace": "color"
                         primary.default.value = "#2B4C7C"
                         ← المسار الكامل color.primary.default

tokens/z-index.json      "$namespace": "zIndex"
                         modal.value = 1050
                         ← المسار الكامل zIndex.modal
```

يجب أن تُكتب **جميع** المراجع بين الملفات (`ref`، و`tokenRefs` في المواصفات، و`then.tokens` في الحالات) **بالمسار الكامل**.

## ثلاث حالات لمساحة الأسماء

### 1. الافتراضية: الاشتقاق من اسم الملف

عند عدم الإعلان عن `$namespace`، يُشتق من اسم الملف بتقسيمه على `-` (`namespaceFromFileName`): تُحفظ المقطع الأول كما هو، وتُكبَّر الحرف الأول من المقاطع الأخرى.

| اسم الملف | نتيجة الاشتقاق |
| --- | --- |
| `color.json` | `color` |
| `z-index.json` | `zIndex` |
| `typography.json` | `typography` |
| `color-dark.json` | `colorDark` (**قيمة مشتقة، لكنها غير مستخدمة فعلًا**) |

الاشتقاق مجرد **تراجع احتياطي** — إذ تُعلِن ملفات الوضع الداكن دائمًا عن `$namespace` صراحةً لتتطابق مع الوضع الفاتح (راجع أدناه).

### 2. الإعلان الصريح

كتابة `$namespace` مباشرة:

```json
{ "$namespace": "zIndex", "modal": { "value": 1050 } }
```

**يجب أن يُعلِن ملف الوضع الداكن صراحةً عن نفس `$namespace` الخاص بملف الوضع الفاتح**، وإلا لن تقع المفاتيح المغطاة على المسار نفسه:

```json
// color-dark.json
{ "$namespace": "color", "$dark": true, "primary": { "default": { "value": "#3D649E" } } }
```

وهكذا تُدمج تغطية `color.primary.default` في الوضع الداكن بشكل صحيح فوق نفس المسار في الوضع الفاتح.

### 3. السلسلة الفارغة: المفاتيح العلوية هي مساحات الأسماء

يُعلِن `components.json` عن `"$namespace": ""`، وبالتالي تكون **المفاتيح العلوية هي مساحة أسماء المكوّن**، والمسار الكامل هو مباشرةً `button.height.medium` و`input.borderRadius`:

```json
{
  "$namespace": "",
  "$type": "dimension",
  "button": {
    "height": { "medium": { "value": "40px" } }
  }
}
```

## التأثيرات الفعلية لمساحة الأسماء

- **`dist/docs/tokens.md`** يقسّم أقسام `##` وفق مساحات الأسماء العلوية (button / color / motion / zIndex …)
- **مرحلة resolve** تجري الكشف عن التكرار حسب المسار الكامل: ظهور المسار نفسه في ملفين من الوضع الفاتح يرمي خطأً مباشرةً
- **دمج الوضع الداكن** يطابق المفاتيح المغطاة حسب المسار الكامل
- **أهداف الأطراف** تبني الهيكل المتداخل حسب أجزاء المسار (Android يستخدم `object Color`، وSwift يستخدم `enum Color`، وC يستخدم `LH_COLOR_*`)

## مثال كامل

```
color.primary.active          ← color.json
button.height.medium          ← components.json (مساحة أسماء بسلسلة فارغة)
typography.fontSize.base      ← typography.json
zIndex.modal                  ← z-index.json (صريح)
motion.easing.easeInOut       ← motion.json (تداخل مجموعات)
```

يمكن تصفّح جميع الرموز حسب مساحة الأسماء مباشرةً في صفحة [مرجع الرموز](./reference).
