---
title: "Артефакты Windows"
---

**Путь**: `dist/windows/Tokens/LhTokens.cs` и `LhDarkTokens.cs`; при наличии токенов теней дополнительно генерируется `LhShadow.cs`, при наличии токенов Безье — `LhEasing.cs`

**Пространство имён**: `Top.Lhgb.Ui.Tokens` (обратный домен, генеральный план D20)

## Структура

Вложенные `public static class` выражают иерархию токенов, элементы — `public static readonly`:

```csharp
public static class LhTokens {
  public static class Button {
    public static readonly double BorderRadius = 2.0;  // Скругление кнопки следует за глобальным скруглением
    public static class Height {
      public static readonly double Large = 48.0;  // Высота кнопки большого размера
      public static readonly double Medium = 40.0;  // Высота кнопки среднего размера (по умолчанию)
      public static readonly double Small = 32.0;  // Высота кнопки малого размера
    }
    // ...
  }
  public static class Color {
    public static class Primary {
      public static readonly Windows.UI.Color Default = Windows.UI.Color.FromArgb(0xFF, 0x2B, 0x4C, 0x7C);
    }
  }
}
```

## Правила именования элементов

`csMemberName(name)`: преобразует имя в **PascalCase** (`default → Default`, `extraLarge → ExtraLarge`) и заодно обходит контекстные ключевые слова C# вроде `default` / `base`. Имена групп также проходят PascalCase.

## Единицы и литералы

| Тип токена | Литерал C# | Тип поля |
| --- | --- | --- |
| Цвет | `Windows.UI.Color.FromArgb(0xFF, 0x2B, 0x4C, 0x7C)` | `Windows.UI.Color` |
| Размер (целое) | `40.0` | `double` |
| Размер (дробное) | `0.5` | `double` |
| Проценты | `0.5  // 50% (доля, пересчитывается от размера контейнера)` | `double` |
| Длительность | `200  // 200ms (миллисекунды)` | `int` |
| Безье | `new LhEasing(0.4, 0, 0.2, 1)` | `LhEasing` |
| Тень | `new LhShadow(0xFF..., 0.0, 2.0, 8.0)` | `LhShadow` |
| Строка | `"'Source Code Pro', ..."` | `string` |

Соглашения по единицам: **размеры — epx (логические пиксели, значения можно использовать напрямую)**, **длительности — миллисекунды** (на стороне компонента `TimeSpan.FromMilliseconds(...)`), **цвета — ARGB**.

### Почему Windows.UI.Color

В Windows App SDK 1.6 и ниже **не существует** структуры `Microsoft.UI.Color`; свойства цветовой таблицы `Microsoft.UI.Colors` также возвращают `Windows.UI.Color`. Поэтому со стороны токенов везде используется `Windows.UI.Color` — со встроенной фабрикой `FromArgb` и типом, совпадающим с таблицей Colors. Если на стороне компонента нужна ссылка на таблицу Colors, потребуются `using Microsoft.UI;` (Colors) + `using Windows.UI;` (Color).

## Тёмная тема: параллельный объект

`LhDarkTokens` — независимый объект, стоящий рядом с `LhTokens`, **содержащий только подкласс `Color`**:

```csharp
public static class LhDarkTokens {
  public static class Color {
    public static readonly Windows.UI.Color Focus = Windows.UI.Color.FromArgb(0xFF, 0x7F, 0xA6, 0xD9);
    // ...
  }
}
```

Тёмная тема переопределяет только цвета — **размеры, анимация и скругления в ней не меняются**: если компоненту нужен размер для тёмной темы, он берёт значение из светлого объекта. Это полностью совпадает с формой артефактов android / ios / harmony.

## Структуры-носители

`LhShadow.cs` и `LhEasing.cs` — это `readonly record struct` (в WinUI нет прямых аналогов составной тени и кривой Безье):

```csharp
public readonly record struct LhShadow(Windows.UI.Color Color, double OffsetX, double OffsetY, double BlurRadius);
public readonly record struct LhEasing(double X1, double Y1, double X2, double Y2);
```

`spread` (расширение) тени игнорируется на всех платформах с пояснением в комментарии (WinUI DropShadow не поддерживает его): `// Расширение 0px: WinUI DropShadow не поддерживает, проигнорировано`.

## Использование

Команда `pnpm link:tokens` репозитория Windows (`lh-ui-windows`) копирует всё дерево `dist/windows/` в `src/Tokens/` (место назначения — подкаталог `Tokens/` в корне исходников), а `using Top.Lhgb.Ui.Tokens;` на стороне компонентов указывает именно на него. Трёхуровневая защита существования (локальный dist → npm `@lh-ui/core` → ошибка) описана в [Локальная линковка](../guide/local-linking).
