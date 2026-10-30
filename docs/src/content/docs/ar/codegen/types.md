---
title: "تعريفات الأنواع types.ts"
---

> تعريفات الأنواع المشتركة بين جميع وحدات codegen. لا تعتمد على أي واجهة برمجية خاصة بمنصة، وهي للاستخدام الداخلي ضمن سلسلة أدوات وقت البناء، ولا تدخل أي منتج في وقت التشغيل.

تعرض [نظرة عامة على خط الأنابيب](./pipeline) الواجهات الأساسية الأربع (`CodegenTarget` / `CodegenInput` / `GeneratedFile` / `TokenSet`)، وهذه الصفحة هي المرجع الكامل.

## جانب الرموز

### `TokenType`

```ts
type TokenType =
  | 'color'
  | 'dimension'
  | 'number'
  | 'string'
  | 'shadow'
  | 'duration'
  | 'cubicBezier'
```

بمراسلات واحد لواحد مع تعدادات `$type` / `type` في `tokens/schema.json`. ولقيود القيم المحايدة لكل نوع راجع [تنسيق الرموز](../tokens/token-format)، وللتحليل راجع [طبقة التنسيق](./format).

### `TokenValue`

```ts
type TokenValue = string | number | number[]
```

القيمة المحايدة للرمز: لون سداسي عشري / `rgba()` / سلسلة مع وحدة (`"12px"`، `"50%"`، `"0.3s"`) / رقم صرف (تحت نوع `number`) / مصفوفة بيزيه الرباعية. وتُمنع أي صياغة خاصة بالمنصات.

### `RawToken`

```ts
interface RawToken {
  value?: TokenValue       // القيمة الحرفية (واحد من اثنين مع ref)
  ref?: string             // مسار نقاط الرمز المُشار إليه، يُحلَّل ساكنيًا ويُخبَز في وقت البناء
  type?: TokenType         // عند عدم الإعلان، يُورَّث من $type على مستوى الملف / المجموعة
  description?: string
  nativeOnly?: boolean     // وسم بأنه مُضاف في السلالة الأصلية (ولا يقابله عنصر في سلالة الويب)
}
```

الرمز الطرفي في ملف JSON المصدر، وهو مراسل مباشر للعقدة `token` في schema. وكل من `value` و`ref` ينفي الآخر (يفرض schema ذلك عبر `anyOf` بالاختيار من اثنين).

### `ResolvedToken`

```ts
interface ResolvedToken {
  path: string             // مسار النقاط، مثل color.primary.default
  type: TokenType
  value: TokenValue        // القيمة الحرفية بعد الخَبز (تم توسيع ref)
  refChain?: string[]      // إذا جاء الرمز عبر ref، تُسجَّل مسارات المراجع الأصلية (متضمنة السلاسل غير المباشرة)
  description?: string
  nativeOnly?: boolean
}
```

ناتج `resolveTokens`. ولا يوجد `refChain` إلا عندما يأتي الرمز عبر مرجع، ويُستخدم في التوثيق وتتبَّع سلسلة المراجع الأصلية أثناء التنقيح.

### `DarkOverrides`

```ts
type DarkOverrides = Map<string, TokenValue>
```

تغطية الوضع الداكن بعد التحليل: path ← القيمة. والمفاتيح هي مسارات بنفس الاسم في الوضع الفاتح (يتطابق `$namespace` الخاص بـ `color-dark.json` مع الوضع الفاتح، لكي تقع المفاتيح المغطاة على المسار نفسه).

### `TokenSet`

```ts
interface TokenSet {
  tokens: ResolvedToken[]              // رموز الوضع الفاتح
  byPath: Map<string, ResolvedToken>   // بحث سريع حسب المسار
  dark: DarkOverrides                  // path ← قيمة تغطية الوضع الداكن
}
```

وهو `ResolveResult.tokenSet` الذي يُعيده `resolveTokens`، وهو مدخل جميع الأهداف. ويُستخدم `byPath` لاستعلام النوع والوصف لرموز الوضع الفاتح عند تغطية الوضع الداكن.

## جانب العقود (specs)

### `ComponentSpec`

```ts
interface ComponentSpec {
  name: string             // معرّف العقد (kebab-case، مثل 'button')
  component: string        // اسم العرض (مثل 'Button زر')
  since?: string           // إصدار الإدخال
  description: string
  props: SpecProp[]
  events?: SpecEvent[]
  slots?: SpecSlot[]
  behaviors?: string[]
  tokenRefs?: string[]     // المسارات الكاملة للرموز التي يستهلكها هذا المكوّن
}
```

مراسلات نوعية لـ `specs/<name>.json`، يحملها `loadSpecs()` ويجري عليها تحقق schema.

### `SpecProp`

```ts
interface SpecProp {
  name: string
  type: 'string' | 'number' | 'boolean' | 'enum' | 'tokenRef' | 'node' | 'array'
  values?: string[]        // enum فقط: مجموعة قيم التعداد
  default?: unknown        // القيمة الافتراضية (تُحذف عند عدم وجودها)
  required?: boolean
  description: string
}
```

يتطابق `type` مع تعداد السبع قيم في `specs/schema.json`. ومن بينها `tokenRef` (مسار نقاط الرمز) و`node` (مرجع عقدة) قيمتان محجوزتان، لا تستخدمهما أي من العقود الخمسة عشر الحالية.

### `SpecEvent`

```ts
interface SpecEvent {
  name: string
  payload?: { name: string; type: SpecProp['type']; description?: string }[]
  description: string
}
```

### `SpecSlot`

```ts
interface SpecSlot {
  name: string
  description: string
}
```

## جانب الحالات (cases)

### `ComponentCases`

```ts
interface ComponentCases {
  component: string        // اسم المكوّن، يقابل ComponentSpec.name
  cases: GoldenCase[]      // حالة واحدة على الأقل (يفرض schema ذلك عبر minItems: 1)
}
```

### `GoldenCase`

```ts
interface GoldenCase {
  id: string               // معرّف الحالة (kebab-case، وحيد عبر المستودع)
  name: string             // وصف من جملة واحدة يسهل قراءته
  given: { props?: Record<string, unknown>; state?: Record<string, unknown> }
  when: {
    action: 'render' | 'click' | 'input' | 'focus' | 'blur' | 'custom'
    target?: string
    payload?: unknown
  }
  then: {
    events?: { name: string; assertion: 'emitted' | 'notEmitted'; times?: number; payload?: unknown }[]
    tokens?: { path: string; applied: boolean }[]
    visible?: boolean
    enabled?: boolean
    text?: string
    notes?: string
  }
}
```

مراسلات نوعية لبنية given / when / then ثلاثية الأجزاء. وقيمة `blur` في `when.action` قيمة محجوزة، لا تستخدمها أي حالة حالية. ولدلالة الحقول راجع [تنسيق الحالات](../cases/case-format).

## مدخلات ومنتجات codegen

### `CodegenInput`

```ts
interface CodegenInput {
  tokens: TokenSet
  specs: ComponentSpec[]
  cases: ComponentCases[]
  version: string          // رقم إصدار package.json، يُكتب في تعليق رأس كل منتج
}
```

يجمعها `main()` ويمررها إلى `generate()` لكل هدف. وتستهلك الأهداف حاليًا `input.tokens` فقط، أما `specs` / `cases` فهي محجوزة لتوليد توثيق المكوّنات / هياكل الأنواع / الاختبارات مستقبلًا.

### `CodegenTarget`

```ts
interface CodegenTarget {
  name: string             // بادئة السجل، مثل 'android'
  outDir: string           // اسم الدليل الفرعي تحت dist
  generate(input: CodegenInput): GeneratedFile[]
}
```

ينفذ كل هدف لمنصة هذه الواجهة. إضافة منصة جديدة = إضافة هدف جديد وإدراجه في مصفوفة `targets` الخاصة بـ `index.ts`.

### `GeneratedFile`

```ts
interface GeneratedFile {
  relativePath: string     // مسار الإخراج بالنسبة إلى dist/<outDir>/
  content: string
}
```

## الوحدات ذات الصلة

| الوحدة | المسؤولية |
| --- | --- |
| [نظرة عامة على خط الأنابيب](./pipeline) | تنظيم `index.ts` ومراجع سريعة للواجهات الأساسية |
| [طبقة التحميل load.ts](./load) | إنتاج `RawToken` / `ComponentSpec` / `ComponentCases` |
| [طبقة التحليل resolve.ts](./resolve) | إنتاج `TokenSet` (`ResolvedToken` + `DarkOverrides`) |
| [الأهداف الخمسة](./targets) | استهلاك `CodegenInput`، وإنتاج `GeneratedFile` |
