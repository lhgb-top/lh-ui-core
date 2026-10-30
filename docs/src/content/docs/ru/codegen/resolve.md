---
title: "Слой разрешения resolve.ts"
---

> Разрешение ссылок и слияние тёмной темы.

`resolveTokens(files: LoadedTokenFile[]): ResolveResult` — ключевая функция, состоящая из трёх частей.

## Возвращаемое значение

```ts
interface ResolveResult {
  tokenSet: TokenSet                    // Множество светлых токенов + таблица переопределений тёмной темы
  orphanDarkPaths: string[]             // Пути-сироты тёмной темы (для отчёта verify)
  refMap: Map<string, string>           // path -> исходная строка ref (тёмные ключи с префиксом dark:)
}
```

## Часть 1: сворачивание светлых

Все `flat` из нетёмных файлов сливаются в единый `rawMap`:

```ts
if (rawMap.has(path)) throw new Error(`Путь токена дублируется: ${path} (файл ${file.fileName})`)
```

Каждая запись содержит три значения:

| Поле | Значение |
| --- | --- |
| `token` | Собираемый `ResolvedToken` (тип сначала берётся как `raw.type ?? file.defaultType` — запасной вариант) |
| `raw` / `ref` | Исходное значение и строка ссылки |
| `ownType` | **Тип, объявленный самим листом**; нужен исключительно, чтобы отличить «объявленный листом» от «файлового типа по умолчанию» |

`ownType` — ключ к трёхуровневому приоритету типов: после разрешения ref тип цели ссылки применяется **только если `ownType === undefined`**.

## Часть 2: разрешение ref

Встроенная функция `resolveRef(path, chain): { value, type? }`:

1. `rawMap.get(path)` не существует → ошибка `Указанный токен не существует: <path>`
2. Цель сама является ref → рекурсия `resolveRef(entry.ref, [...chain, path])`
3. `chain.includes(path)` → ошибка `Обнаружен цикл ссылок токенов: a -> b -> a`
4. Достигнут литерал → возвращается `{ value, type }`

Главный цикл для каждой записи с ref:

```ts
refMap.set(path, entry.ref)                    // Фиксируется отношение ссылки
const resolved = resolveRef(entry.ref, [path])
entry.token.value = resolved.value             // Запекается в литерал
entry.token.refChain = [entry.ref]             // Записывается цепочка ссылок
if (entry.ownType === undefined && resolved.type !== undefined) {
  entry.token.type = resolved.type             // Тип следует за источником истины
}
```

В конце:

```ts
if (entry.token.type === undefined) {
  throw new Error(`У токена ${path} нет типа (ни собственного type, ни файлового $type)`)
}
assertTypedValue(entry.token.type, value)      // Семантическая валидация
```

Результат сортируется по path в лексикографическом порядке, параллельно строится индекс `byPath`.

## Часть 3: переопределения тёмной темы

Тёмные файлы объявляют только **ключи, требующие переопределения**.

**Представление тёмного пространства имён**: сначала все `flat` тёмных файлов ещё раз сворачиваются в `darkRawMap` (`path -> { value, ref }`).

**Встроенная функция `resolveDarkRef(path, chain): TokenValue`** — разрешение тёмных ref по близости:

| Случай | Поведение |
| --- | --- |
| Цель есть в `darkRawMap` и является ref | Рекурсия **внутри тёмного пространства имён** (тёмное ссылается на тёмное — только тогда берётся значение той же темы); также выполняется обнаружение циклов |
| Цель есть в `darkRawMap` и является литералом | Возвращается тёмное значение |
| Цели **нет** в `darkRawMap` | **Откат к светлому пространству имён**: `resolveRef(path, chain).value` |

**Обход тёмных записей**:

```ts
if (raw.ref) {
  // Цель обязана существовать в одном из byPath / rawMap / darkRawMap
  if (!byPath.has(raw.ref) && !rawMap.has(raw.ref) && !darkRawMap.has(raw.ref)) {
    throw new Error(`Ссылка тёмного токена ${path} не существует: ${raw.ref}`)
  }
  value = resolveDarkRef(raw.ref, [path])
  refMap.set(`dark:${path}`, raw.ref)    // Тёмные ключи с префиксом
}
const type = raw.type ?? byPath.get(path)?.type
if (!type) { orphanDarkPaths.push(path); continue }   // Нет типа → ключ пропускается
assertTypedValue(type, value)
if (!byPath.has(path)) orphanDarkPaths.push(path)     // Сирота → всё же записывается в таблицу
dark.set(path, value)
```

## Пути-сироты тёмной темы

Два вида аномалий **не прерывают codegen**, а только фиксируются в `orphanDarkPaths` и сообщаются командой `pnpm verify:tokens`:

- Тёмный ключ **без типа** (нет ни собственного type, ни одноимённого ключа в светлой теме, у которого можно унаследовать) → **ключ пропускается и не записывается в таблицу переопределений**
- Тёмный ключ, **отсутствующий в светлой теме** (сирота) → **всё же записывается в таблицу переопределений**, но попадает в отчёт

Подробнее: [Слияние тёмного режима](../tokens/dark-mode).

## Как target'ы платформ потребляют `dark`

`dark` — это плоское `Map<path, TokenValue>`, target'ы платформ сами решают, как его испустить (Kotlin / Swift / ArkTS получают отдельное пространство имён `LhDarkTokens`, C — переопределение одноимённых макросов). Подробнее: [Пять target'ов](./targets).
