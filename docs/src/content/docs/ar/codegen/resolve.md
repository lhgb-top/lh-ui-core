---
title: "طبقة التحليل resolve.ts"
---

> تحليل المراجع ودمج الوضع الداكن.

دالة `resolveTokens(files: LoadedTokenFile[]): ResolveResult` هي الدالة الأساسية، وتأتي ثلاثة أجزاء:

## القيمة المُعادة

```ts
interface ResolveResult {
  tokenSet: TokenSet                    // مجموعة رموز الوضع الفاتح + جدول تغطية الوضع الداكن
  orphanDarkPaths: string[]             // المسارات الداكنة اليتيمة (لتقارير verify)
  refMap: Map<string, string>           // path ← سلسلة ref الأصلية (المفاتيح الداكنة تحمل بادئة dark:)
}
```

## الجزء الأول: طي الوضع الفاتح

دمج `flat` لجميع الملفات غير الداكنة في `rawMap` واحد:

```ts
if (rawMap.has(path)) throw new Error(`تعريف مكرر لمسار الرمز: ${path} (الملف ${file.fileName})`)
```

يحمل كل سجل ثلاث قيم:

| الحقل | المعنى |
| --- | --- |
| `token` | `ResolvedToken` قيد التجميع (يأخذ النوع أولًا من `raw.type ?? file.defaultType` كتراجع) |
| `raw` / `ref` | القيمة الأصلية وسلسلة المرجع |
| `ownType` | **النوع الذي أعلنه الرمز بنفسه**، مخصص للتمييز بين «ما أعلنه الرمز» و«الافتراضي على مستوى الملف» |

`ownType` هو مفتاح أولويات الأنواع ذات الطبقات الثلاث: بعد عودة تحليل ref، **فقط عندما يكون `ownType === undefined`** يُعتمد نوع الهدف المُشار إليه.

## الجزء الثاني: تحليل ref

الدالة المضمَّنة `resolveRef(path, chain): { value, type? }`:

1. `rawMap.get(path)` غير موجود ← يُطلق `الرمز المُشار إليه غير موجود: <path>`
2. الهدف نفسه هو ref ← تكرار `resolveRef(entry.ref, [...chain, path])`
3. `chain.includes(path)` ← يُطلق `تم اكتشاف حلقة في مراجع الرموز: a -> b -> a`
4. الوصول إلى قيمة حرفية ← تعاد `{ value, type }`

الحلقة الرئيسية لكل سجل يحتوي على ref:

```ts
refMap.set(path, entry.ref)                    // تسجيل علاقة المرجع
const resolved = resolveRef(entry.ref, [path])
entry.token.value = resolved.value             // الخَبز إلى قيمة حرفية
entry.token.refChain = [entry.ref]             // تسجيل سلسلة المرجع
if (entry.ownType === undefined && resolved.type !== undefined) {
  entry.token.type = resolved.type             // النوع يتبع المصدر الأصلي
}
```

أخيرًا:

```ts
if (entry.token.type === undefined) {
  throw new Error(`الرمز ${path} يفتقر إلى النوع (لا type ذاتي ولا $type على مستوى الملف)`)
}
assertTypedValue(entry.token.type, value)      // تحقق دلالي
```

تُرتَّب النتائج حسب path معجميًا، ويُبنى فهرس `byPath` في الوقت نفسه.

## الجزء الثالث: تغطية الوضع الداكن

لا يُعلِن ملف الوضع الداكن **سوى المفاتيح التي تحتاج تغطية**.

**عرض مساحة أسماء الوضع الداكن**: يُعاد طي `flat` لجميع ملفات الوضع الداكن مرة أخرى إلى `darkRawMap` (`path ← { value, ref }`).

**الدالة المضمَّنة `resolveDarkRef(path, chain): TokenValue`** — تحليل مراجع الوضع الداكن بالأقرب:

| الحالة | السلوك |
| --- | --- |
| الهدف في `darkRawMap` وهو ref | تتبع السلسلة بشكل متداخل **داخل مساحة أسماء الوضع الداكن** (فقط عندما يشير الداكن إلى الداكن تُؤخذ القيمة من النمط نفسه)، مع الكشف عن الحلقات كذلك |
| الهدف في `darkRawMap` وهو قيمة حرفية | إعادة قيمة الوضع الداكن |
| الهدف **ليس** في `darkRawMap` | **التراجع إلى مساحة أسماء الوضع الفاتح** أيا كان `resolveRef(path, chain).value` |

**المرور على سجلات الوضع الداكن**:

```ts
if (raw.ref) {
  // يجب أن يكون الهدف موجودًا في أحد هذه: byPath / rawMap / darkRawMap
  if (!byPath.has(raw.ref) && !rawMap.has(raw.ref) && !darkRawMap.has(raw.ref)) {
    throw new Error(`مرجع الرمز الداكن ${path} غير موجود: ${raw.ref}`)
  }
  value = resolveDarkRef(raw.ref, [path])
  refMap.set(`dark:${path}`, raw.ref)    // المفاتيح الداكنة تحمل البادئة
}
const type = raw.type ?? byPath.get(path)?.type
if (!type) { orphanDarkPaths.push(path); continue }   // نقص النوع ← تخطي هذا المفتاح
assertTypedValue(type, value)
if (!byPath.has(path)) orphanDarkPaths.push(path)     // يتيم ← يبقى مكتوبًا في جدول التغطية
dark.set(path, value)
```

## المسارات الداكنة اليتيمة

حالتان شاذتان **لا توقفان codegen**، بل تُسجَّلان في `orphanDarkPaths` ويُبلَّغ عنهما عبر `pnpm verify:tokens`:

- مفتاح داكن **يفتقر إلى النوع** (لا يملك نوعًا ذاتيًا، ولا يوجد مفتاح مماثل في مجموعة الوضع الفاتح يرث منه) ← **تخطي المفتاح، دون كتابته في جدول التغطية**
- مفتاح داكن **غير موجود** في مجموعة الوضع الفاتح (يتيم) ← **يبقى مكتوبًا في جدول التغطية**، لكن يُبلَّغ عنه

راجع [دمج الوضع الداكن](../tokens/dark-mode).

## كيف تستهلك الأطراف `dark`

`dark` هو `Map<path, TokenValue>` مسطح، ويقرر كل هدف كيفية إصداره (Kotlin / Swift / ArkTS تستخدم مساحات أسماء `LhDarkTokens` مستقلة، وC يستخدم إعادة تعريف الماكرو بالاسم نفسه). راجع [الأهداف الخمسة](./targets).
