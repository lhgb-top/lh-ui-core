---
title: "Артефакты HarmonyOS"
---

**Путь**: `dist/harmony/tokens/LhTokens.ets` и `LhDarkTokens.ets`; при наличии токенов теней дополнительно генерируется `LhShadow.ets`

**Каталог модуля**: `tokens/` (внутри модуля ohpm)

## Структура

Корень — `export class`, вложенные классы **без export** (в теле класса ArkTS не разрешены export-объявления), элементы — `static readonly`:

```ts
export class LhTokens {
  class Button {
    static readonly borderRadius: Dimension | number = 2  // Скругление кнопки следует за глобальным скруглением
    static readonly borderWidth: Dimension | number = 1
    class FontSize {
      static readonly large: Dimension | number = 16
      static readonly medium: Dimension | number = 14
    }
    class Height {
      static readonly medium: Dimension | number = 40  // Высота кнопки среднего размера (по умолчанию)
    }
  }
  class Color {
    static readonly focus: ResourceColor = '#FF2B4C7C'
  }
}
```

## Отображение имён

| Путь токена | Элемент ArkTS |
| --- | --- |
| `button.height.medium` | `LhTokens.Button.Height.medium` |
| `color.primary.default` | `LhTokens.Color.Primary.default` |
| `zIndex.modal` | `LhTokens.ZIndex.modal` |

## Единственная платформа с аннотациями типов

ArkTS строго типизирован, поэтому у каждого элемента есть аннотация типа (`typeAnnotation()`):

| Тип токена | Аннотация типа |
| --- | --- |
| color | `ResourceColor` |
| dimension | `Dimension \| number` |
| duration / number | `number` |
| shadow | `LhShadow` |
| cubicBezier | `number[]` |
| string | `string` |

Kotlin / Swift / C выводят типы из литералов; только ArkTS указывает их явно.

## Единицы и литералы

| Тип токена | Литерал ArkTS |
| --- | --- |
| Цвет | `'#FF2B4C7C'` (ArkUI принимает строки `#AARRGGBB`, используется `toArgbHash`) |
| Размер | Чистое значение в `vp` (`40`, без единицы измерения) |
| Проценты | `0.500  // 50% (доля, пересчитывается от размера контейнера)` |
| Длительность | `200  // 200ms (миллисекунды)` |
| Безье | `[0.4, 0, 0.2, 1]  // Контрольные точки Безье; на стороне компонента используются через curves.cubicBezierCurve` |
| Тень | `{ color: '#FF000000', radius: 8, offsetX: 0, offsetY: 2 }` |
| Число / строка | Как есть / `JSON.stringify` |

## LhShadow.ets

В ArkUI также нет типа составной тени, поэтому используется **интерфейс**-носитель (**статический шаблон, без содержимого токенов**):

```ts
export interface LhShadow {
  color: ResourceColor
  /** Радиус размытия */
  radius: number
  offsetX: number
  offsetY: number
}
```

В отличие от `struct LhShadow` в iOS: ArkTS использует интерфейс, SwiftUI — структуру; каждый вариант следует идиомам своего языка.

## Тёмная тема

Отдельный `export class LhDarkTokens` со структурой, совпадающей со светлой:

```ts
export class LhDarkTokens {
  class Color {
    static readonly focus: ResourceColor = '#FF7FA6D9'
    static readonly selected: ResourceColor = '#FFB1C1D8'
    // …остальные переопределённые ключи
  }
}
```

Непереопределённые ключи в тёмной теме наследуются из `LhTokens`.

## Использование

Репозиторий HarmonyOS подключает `dist/harmony/` через зависимость ohpm `file:` (локальная линковка) или потребляет опубликованный пакет; для применения достаточно `import { LhTokens } from '...'`.
