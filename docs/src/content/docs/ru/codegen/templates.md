---
title: "Список шаблонов"
---

В `codegen/templates/` лежит **8 Handlebars-шаблонов**; **ни одного собственного хелпера не зарегистрировано** (используются только встроенные `{{#each}}` и тройные фигурные скобки `{{{ }}}`).

## Шаблон → Артефакт → Поля данных

| Шаблон | Результат рендера | Поля данных |
| --- | --- | --- |
| `android/LhTokens.kt.hbs` | `LhTokens.kt` **и** `LhDarkTokens.kt` (общий для светлой и тёмной тем) | `{ version, source, package, imports[], body }` |
| `ios/LhTokens.swift.hbs` | `LhTokens.swift` и `LhDarkTokens.swift` | `{ version, source, body }` |
| `ios/LhShadow.swift.hbs` | `LhShadow.swift` (статический шаблон, без слота body) | `{ version, source }` |
| `harmony/LhTokens.ets.hbs` | `LhTokens.ets` и `LhDarkTokens.ets` | `{ version, source, body }` |
| `harmony/LhShadow.ets.hbs` | `LhShadow.ets` (статический шаблон) | `{ version, source }` |
| `windows/LhTokens.cs.hbs` | `LhTokens.cs` и `LhDarkTokens.cs` | `{ version, source, namespace, body }` |
| `windows/LhShadow.cs.hbs` | `LhShadow.cs` (статический шаблон) | `{ version, source, namespace }` |
| `windows/LhEasing.cs.hbs` | `LhEasing.cs` (статический шаблон) | `{ version, source, namespace }` |

## Единый заголовочный баннер

Все шаблоны начинаются с одного и того же комментария:

```
// =====================================================================================
// Этот файл сгенерирован автоматически @lh-ui/core (codegen на этапе сборки), не редактируйте вручную.
// Источник: {{{source}}} @ v{{{version}}}
// Чтобы изменить файл, отредактируйте tokens/*.json в репозитории lh-ui-core и выполните pnpm codegen.
// =====================================================================================
```

Это декларация на уровне кода правила «`dist/` нельзя редактировать вручную» (красная линия 6).

## Совместное использование шаблонов светлой и тёмной тем

**Светлые и тёмные артефакты android / ios / harmony / windows используют один и тот же шаблон**; различаются только передаваемые в него данные `body` (имена корневых object / enum / class).

## Статические шаблоны (структуры-носители)

`ios/LhShadow.swift.hbs`, `harmony/LhShadow.ets.hbs`, `windows/LhShadow.cs.hbs`, `windows/LhEasing.cs.hbs` **не имеют слота body** — их содержимое полностью статично:

```handlebars
{{!-- harmony/LhShadow.ets.hbs --}}
/// Структура токена тени
export interface LhShadow {
  color: ResourceColor
  /** Радиус размытия */
  radius: number
  offsetX: number
  offsetY: number
}
```

Причина: ни у SwiftUI, ни у ArkUI, ни у WinUI нет прямого аналога для «составной тени» или «кривой Безье», поэтому со стороны платформ нужны структуры-носители; тень в Android реализована платформенным API, и дополнительный файл не требуется. Обе структуры-носителя Windows — это `readonly record struct`:

```handlebars
{{!-- windows/LhShadow.cs.hbs --}}
public readonly record struct LhShadow(Windows.UI.Color Color, double OffsetX, double OffsetY, double BlurRadius);
```

## Примеры шаблонов

```handlebars
{{!-- android/LhTokens.kt.hbs --}}
// Заголовочный баннер…

package {{{package}}}

{{#each imports}}
{{{this}}}
{{/each}}

{{{body}}}
```

```handlebars
{{!-- windows/LhTokens.cs.hbs --}}
// Заголовочный баннер…

namespace {{{namespace}}};

{{{body}}}
```

## Принципы проектирования

- **Тонкие шаблоны**: отвечают только за каркас файла (заголовочный комментарий, package / namespace, открытие/закрытие защиты), а форматирование литералов каждого токена выполняется в TS target'а, и результат подаётся в шаблон как `body`. Подробнее: [Слой рендеринга](./render).
- **`noEscape: true`**: шаблон содержит символы `<` `>` `#` (`#ifndef`, `#define`, угловые скобки дженериков), поэтому HTML-экранирование необходимо отключить.
- **Кэширование компиляции**: `loadTemplate` в `render.ts` кэширует результаты компиляции, чтобы не компилировать шаблоны повторно.

## Как добавить новый шаблон

1. Добавьте файл `.hbs` в `codegen/templates/<platform>/`
2. В соответствующем target'е соберите данные и вызовите `render('<platform>/<name>.hbs', data)`
3. Запустите `pnpm codegen`, посмотрите артефакты, обновите снапшоты командой `pnpm test -- -u`
