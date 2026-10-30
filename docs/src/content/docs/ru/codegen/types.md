---
title: "Определения типов types.ts"
---

> Определения типов, общие для всех модулей codegen. Не зависят ни от каких платформенных API, используются внутри инструментария сборки и не попадают ни в один артефакт времени выполнения.

В [Обзоре конвейера](./pipeline) описаны четыре ключевых интерфейса (`CodegenTarget` / `CodegenInput` / `GeneratedFile` / `TokenSet`); эта страница — полный справочник.

## Сторона токенов

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

Взаимно однозначно соответствует перечислению `$type` / `type` из `tokens/schema.json`. Ограничения на нейтральные значения каждого типа — в [Формат токенов](../tokens/token-format), разбор — в [Слой форматирования](./format).

### `TokenValue`

```ts
type TokenValue = string | number | number[]
```

Нейтральное значение токена: шестнадцатеричный цвет / `rgba()` / строка с единицей измерения (`"12px"`, `"50px"`, `"0.3s"`) / чистое число (для типа `number`) / массив из четырёх чисел Безье. Любой платформо-специфичный синтаксис запрещён.

### `RawToken`

```ts
interface RawToken {
  value?: TokenValue       // Литеральное значение (либо value, либо ref)
  ref?: string             // Точечный путь к другому токену; статически разрешается и запекается на этапе сборки
  type?: TokenType         // При отсутствии наследуется из файлового / группового $type
  description?: string
  nativeOnly?: boolean     // Помечает токены, добавленные направлением native (не входящие в выравнивание с направлением web)
}
```

Листовой токен в исходном JSON-файле; напрямую отображает узел `token` в схеме. `value` и `ref` взаимоисключающи (схема через `anyOf` требует ровно одного из них).

### `ResolvedToken`

```ts
interface ResolvedToken {
  path: string             // Точечный путь, например color.primary.default
  type: TokenType
  value: TokenValue        // Запечённое литеральное значение (ref уже развёрнут)
  refChain?: string[]      // Если значение получено через ref, фиксирует исходную цепочку ссылок (включая косвенные)
  description?: string
  nativeOnly?: boolean
}
```

Результат работы `resolveTokens`. `refChain` существует только для токенов, полученных через ссылки, и позволяет документации и отладке восстановить исходную цепочку ссылок.

### `DarkOverrides`

```ts
type DarkOverrides = Map<string, TokenValue>
```

Разрешённое переопределение тёмной темы: path -> значение. Ключи — это пути, одноимённые со светлыми (`$namespace` в `color-dark.json` совпадает со светлым, только тогда переопределения ложатся на те же пути).

### `TokenSet`

```ts
interface TokenSet {
  tokens: ResolvedToken[]              // Светлые токены
  byPath: Map<string, ResolvedToken>   // Быстрый поиск по пути
  dark: DarkOverrides                  // path -> значение переопределения тёмной темы
}
```

`ResolveResult.tokenSet`, возвращаемый `resolveTokens`, — вход для всех target'ов. `byPath` нужен при слиянии тёмной темы, чтобы подсмотреть тип и описание у светлого токена.

## Сторона контрактов (specs)

### `ComponentSpec`

```ts
interface ComponentSpec {
  name: string             // Идентификатор контракта (kebab-case, например 'button')
  component: string        // Отображаемое имя (например 'Button кнопка')
  since?: string           // Версия, в которой появился
  description: string
  props: SpecProp[]
  events?: SpecEvent[]
  slots?: SpecSlot[]
  behaviors?: string[]
  tokenRefs?: string[]     // Полные пути токенов, потребляемых этим компонентом
}
```

Отображение типов `specs/<name>.json`; загружается функцией `loadSpecs()` с валидацией по схеме.

### `SpecProp`

```ts
interface SpecProp {
  name: string
  type: 'string' | 'number' | 'boolean' | 'enum' | 'tokenRef' | 'node' | 'array'
  values?: string[]        // Только для enum: множество значений перечисления
  default?: unknown        // Значение по умолчанию (опускается при отсутствии)
  required?: boolean
  description: string
}
```

`type` соответствует перечислению из 7 значений в `specs/schema.json`. Значения `tokenRef` (точечный путь токена) и `node` (ссылка на узел) — зарезервированы; ни одно из 15 текущих контрактов их не использует.

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

## Сторона сценариев (cases)

### `ComponentCases`

```ts
interface ComponentCases {
  component: string        // Имя компонента; соответствует ComponentSpec.name
  cases: GoldenCase[]      // Как минимум один (схема требует minItems: 1)
}
```

### `GoldenCase`

```ts
interface GoldenCase {
  id: string               // Идентификатор сценария (kebab-case, уникален в рамках репозитория)
  name: string             // Человекочитаемое описание в одно предложение
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

Отображение типов трёхчастной структуры given / when / then. `blur` в `when.action` — зарезервированное значение, в текущих сценариях не используется. Семантика полей — в [Формат сценариев](../cases/case-format).

## Входные данные и артефакты codegen

### `CodegenInput`

```ts
interface CodegenInput {
  tokens: TokenSet
  specs: ComponentSpec[]
  cases: ComponentCases[]
  version: string          // Номер версии из package.json; записывается в заголовочный комментарий каждого артефакта
}
```

Собирается в `main()` и передаётся в `generate()` каждого target'а. Сейчас target'ы потребляют только `input.tokens`; `specs` / `cases` зарезервированы под будущую генерацию документации, каркасов типов и тестов.

### `CodegenTarget`

```ts
interface CodegenTarget {
  name: string             // Префикс для логов, например 'android'
  outDir: string           // Имя подкаталога внутри dist
  generate(input: CodegenInput): GeneratedFile[]
}
```

Каждый target платформы реализует этот интерфейс. Добавить платформу = добавить target и поместить его в массив `targets` в `index.ts`.

### `GeneratedFile`

```ts
interface GeneratedFile {
  relativePath: string     // Путь вывода относительно dist/<outDir>/
  content: string
}
```

## Смежные модули

| Модуль | Ответственность |
| --- | --- |
| [Обзор конвейера](./pipeline) | Оркестрация в `index.ts` и краткий обзор ключевых интерфейсов |
| [Слой загрузки load.ts](./load) | Производит `RawToken` / `ComponentSpec` / `ComponentCases` |
| [Слой разрешения resolve.ts](./resolve) | Производит `TokenSet` (`ResolvedToken` + `DarkOverrides`) |
| [Пять target'ов](./targets) | Потребляют `CodegenInput`, производят `GeneratedFile` |
