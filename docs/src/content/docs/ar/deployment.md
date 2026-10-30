---
title: "تعليمات النشر"
---

يُنشر موقع التوثيق هذا وفق اصطلاح العائلة تحت البادئة `/lhui/core/` على النطاق `www.lhgb.top` (ضمن المنظومة نفسها التي تجمع موقعي android / ios / harmony / windows).

إطار الموقع هو **Astro Starlight** (انتقل من VitePress في 2026-10-12، وللاطلاع على قرارات الاختيار راجع [الاختيارات التقنية لموقع التوثيق](./guide/tech-choice)).

## البناء

```bash
pnpm docs:build
```

تكون المنتجات تحت `docs/dist/` (يُحدَّد `outDir: 'docs/dist'` صراحةً في `astro.config.mjs`، **وهو تفادي متعمَّد لمجلد `dist/` الخاص بـ codegen في جذر المستودع**، راجع الخط الأحمر 6؛ وقد أُضيف إلى `.gitignore`، أي لا يدخل نظام التحكم بالنسخ).

جميع إعدادات النشر موجودة في `docs/astro.config.mjs`:

| خيار الإعداد | القيمة | الوصف |
| --- | --- | --- |
| `site` | `https://www.lhgb.top` | مصدر الموقع لخريطة المواقع وSEO |
| `base` | `/lhui/core/` | بادئة النشر، ويجب أن تحمل شرطة مائلة في البداية والنهاية |
| `build.format` | `'file'` | إنتاج `page.html` بدلًا من `page/index.html`، محاذيًا لاتفاقيات nginx الخاصة بالعائلة |
| `trailingSlash` | `'never'` | يديره Starlight، بالاقتران مع `format: 'file'` |

<Aside type="tip" title="تعديل مسار النشر يكون من هذا المكان فقط">
يجب أن تحمل `base` شرطة مائلة في البداية والنهاية. وتعمل `base` الخاصة بـ Astro في الوقت نفسه على مسارات الموارد في منتجات البناء، وخريطة المواقع، وفهرس البحث pagefind، فلا حاجة بعد الآن لصيانة ملف `.env` كما كان الحال في عهد VitePress.
</Aside>

<Aside type="caution" title="ما لا تغطيه base من روابط">
لا تؤثر `base` إلا على ما يُنتجه Astro / Starlight نفسه: موارد الصفحات، والشريط الجانبي، والترقيم، وتبديل اللغات، وخريطة المواقع، وفهرس pagefind. **وهناك نوعان من الروابط لا يجري إلحاق البادئة بهما تلقائيًا**:

1. **`hero.actions[].link` في الـ frontmatter** (أزرار الدعوة للفتح الانتباه في الصفحة الرئيسية ذات `template: splash`) — يأخذها Starlight 0.42.6 كما هي كقيمة `href`، ولذا يجب كتابة البادئة الكاملة في `index.mdx`، مثل `/lhui/core/guide/quickstart`.
2. **الروابط النسبية المطلقة التي تبدأ بـ `/` في نص markdown** — إن عرض markdown في Astro 7 لا يلحق البادئة.

يعالج هذا المستودع النوع الثاني عبر إضافة `basePrefixPlugin` الإضافية في `astro.config.mjs`، حيث تُلحق البادئة تلقائيًا في وقت البناء، لذلك يبقى من الممكن كتابة المسار المطلق `/tokens/reference` في النصوص؛ أما النوع الأول فيجب كتابة بادئته الكاملة يدويًا. وعند تغيير `base` تذكَّر تحديث زرَّي الصفحة الرئيسية.
</Aside>

## الرفع

ارفع محتويات `docs/dist/` إلى دليل الخادم `/home/webuser/nginx/lh-ui/core/`.

## إعدادات nginx

```nginx
location ^~ /lhui/core/ {
    alias /home/webuser/nginx/lh-ui/core/;
    index index.html;
    try_files $uri $uri.html $uri/ /lhui/core/index.html;
}
```

ثلاث اتفاقيات مُستفادة من تجارب العائلة (تأكدت ملاءمتها بعد الانتقال إلى Starlight):

1. **يجب أن يحمل تراجع `try_files` بادئة base** (`/lhui/core/index.html`)، وإلا يفشل تحديث الروابط العميقة بـ 404
2. **لا يجوز حذف الشرطة المائلة في نهاية `alias`**، وتُستخدم مقترنة مع `location ^~ /lhui/core/`
3. **يجب إضافة `$uri.html`** — لأن منتجات هذا الموقع بصيغة `build.format: 'file'` تأتي على شكل `page.html` (أي عنوان URL بحلقة `/lhui/core/page` بلا شرطة مائلة في النهاية)، ويعتمد nginx على `$uri.html` للوصول إلى الملف الحقيقي؛ وحذفه يجعل الروابط العميقة تفشل بـ 404

## الفحص الذاتي بعد النشر

```bash
curl -I https://www.lhgb.top/lhui/core/guide/introduction
grep -c "lhui/core" docs/dist/index.html   # المتوقع > 0
# تأكيد عكسي: يجب ألا توجد روابط داخلية تفتقد base في المنتجات (يجب أن يكون عدد المطابقات 0)
grep -rcE 'href="/(guide|tokens|specs|cases|codegen|artifacts)/' docs/dist/ | grep -v ':0$' || echo OK
```

## المعاينة المحلية

```bash
pnpm docs:dev        # http://localhost:5185/lhui/core/
pnpm docs:preview    # معاينة بناء الإنتاج، وتحمل بادئة base كذلك
```

تعمل `base` الخاصة بـ Astro في خادم التطوير كذلك (مخالفةً لنهج VitePress الذي كان يميز `.env.development` بقيمة `DOCS_BASE=/`)، ولذلك تحمل المسارات المحلية **بادئة `/lhui/core/`** أيضًا — أي أن بنية العناوين محليًا وعلى الإنتاج متطابقة، وهو ما يلغي عبء «المحلي بلا بادئة والإنتاج بها» الذي كان قائمًا في الماضي.

## توزيع المنافذ

| المستودع | منفذ التطوير | base |
| --- | --- | --- |
| lh-ui-vue2 | 5177 | `/lhui/vue2/` |
| lh-ui-plus | 5178 | `/lhui/vue3/` |
| lh-ui-react | 5179 | `/lhui/react/` |
| lh-ui-uniapp | 5187 | `/lhui/uniapp/` |
| lh-ui-android | 5181 | `/lhui/android/` |
| lh-ui-ios | 5182 | `/lhui/ios/` |
| lh-ui-harmony | 5183 | `/lhui/harmony/` |
| lh-ui-windows | 5186 | `/lhui/windows/` |
| **lh-ui-core (هذا الموقع)** | **5185** | **`/lhui/core/`** |

المرجع المعتمد لنشر العائلة موجود في `部署/nginx-lhui.conf.md` داخل مستودع `lh-ui/docs`؛ وهذه الوثيقة نسخة محفوظة محليًا لدليل العمليات في هذا المستودع. وعند تفعيل النشر ينبغي تحديث جدول النظرة العامة للعائلة (التعديلات الحالية لا تشمل تغييرات عبر المستودعات).
