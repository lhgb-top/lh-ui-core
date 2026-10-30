---
title: "Пространства имён и точечные пути"
---

## Правило

**Глобальный точечный путь токена = `$namespace` + вложенный путь внутри файла.**

```
tokens/color.json        "$namespace": "color"
                         primary.default.value = "#2B4C7C"
                         → полный путь color.primary.default

tokens/z-index.json      "$namespace": "zIndex"
                         modal.value = 1050
                         → полный путь zIndex.modal
```

Все межфайловые ссылки (`ref`, `tokenRefs` в spec, `then.tokens` в cases) **обязательно пишутся полным путём**.

## Три варианта пространства имён

### 1. По умолчанию: выводится из имени файла

Если `$namespace` не объявлен, пространство имён выводится из имени файла разбиением по `-` (`namespaceFromFileName`): первый сегмент остаётся как есть, остальные пишутся с заглавной первой буквы.

| Имя файла | Результат |
| --- | --- |
| `color.json` | `color` |
| `z-index.json` | `zIndex` |
| `typography.json` | `typography` |
| `color-dark.json` | `colorDark` (**выводимое значение, фактически не используется**) |

Выведение — лишь **запасной вариант**: тёмные файлы всегда явно объявляют `$namespace`, совпадающий со светлым файлом (см. ниже).

### 2. Явное объявление

`$namespace` пишется напрямую:

```json
{ "$namespace": "zIndex", "modal": { "value": 1050 } }
```

**Тёмный файл обязан явно объявлять тот же `$namespace`, что и светлый**, иначе ключи переопределения не попадут на тот же путь:

```json
// color-dark.json
{ "$namespace": "color", "$dark": true, "primary": { "default": { "value": "#3D649E" } } }
```

Только тогда переопределение тёмной темы для `color.primary.default` корректно сольётся с тем же путём светлого файла.

### 3. Пустая строка: ключи верхнего уровня — это пространства имён

`components.json` объявляет `"$namespace": ""`, поэтому **ключи верхнего уровня и есть пространства имён компонентов**, а полные пути выглядят как `button.height.medium`, `input.borderRadius`:

```json
{
  "$namespace": "",
  "$type": "dimension",
  "button": {
    "height": { "medium": { "value": "40px" } }
  }
}
```

## Практическое влияние пространства имён

- **`dist/docs/tokens.md`** разбивается на секции `##` по пространствам имён верхнего уровня (button / color / motion / zIndex и т. д.)
- На этапе **resolve** по полному пути выполняется обнаружение дубликатов: два светлых файла с одним и тем же путём — это ошибка
- **Слияние тёмной темы** сопоставляет ключи переопределения по полному пути
- **Target'ы платформ** строят вложенные структуры по сегментам пути (Android `object Color`, Swift `enum Color`, C `LH_COLOR_*`)

## Полный пример

```
color.primary.active          ← color.json
button.height.medium          ← components.json (пустое пространство имён)
typography.fontSize.base      ← typography.json
zIndex.modal                  ← z-index.json (явное)
motion.easing.easeInOut       ← motion.json (вложенность групп)
```

На странице [Справочник по токенам](./reference) все токены можно просматривать в разбивке по пространствам имён.
