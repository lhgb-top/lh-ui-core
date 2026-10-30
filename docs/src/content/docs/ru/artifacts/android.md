---
title: "Артефакты Android"
---

**Путь**: `dist/android/top/lhgb/ui/tokens/LhTokens.kt` и `LhDarkTokens.kt`

**Имя пакета**: `top.lhgb.ui.tokens` (соглашение об обратном домене, генеральный план D20)

## Структура

Токены организованы по иерархии путей во **вложенные `object`** с элементами `val`:

```kotlin
package top.lhgb.ui.tokens

import androidx.compose.ui.graphics.Color as ComposeColor
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.graphics.Shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.animation.core.CubicBezierEasing

object LhTokens {
  object Button {
    val borderRadius = 2.dp  // Скругление кнопки следует за глобальным скруглением
    val borderWidth = 1.dp
    object FontSize {
      val large = 16.sp
      val medium = 14.sp
    }
    object Height {
      val medium = 40.dp  // Высота кнопки среднего размера (по умолчанию)
      val small = 32.dp  // Высота кнопки малого размера
    }
  }
  object Color {
    val focus = ComposeColor(0xFF2B4C7C)
  }
}
```

## Отображение имён

| Путь токена | Элемент Kotlin |
| --- | --- |
| `button.height.medium` | `LhTokens.Button.Height.medium` |
| `color.primary.default` | `LhTokens.Color.Primary.default` |
| `zIndex.modal` | `LhTokens.ZIndex.modal` |

Имена групп проходят `pascalCase` (только первая буква становится заглавной), имена элементов сохраняются как есть.

## Единицы и литералы

| Тип токена | Литерал Kotlin |
| --- | --- |
| Цвет | `ComposeColor(0xFF2B4C7C)` (ARGB Int) |
| Размер | `40.dp`; **токены размеров шрифта (путь содержит `fontsize`) используют `.sp`**, всё остальное — `.dp` |
| Проценты | `0.50f  // 50% (доля, пересчитывается от размера контейнера)` |
| Длительность | `200  // 200ms (миллисекунды)` (Int) |
| Безье | `CubicBezierEasing(0.4f, 0f, 0.2f, 1f)` |
| Тень | `Shadow(color = ..., offset = Offset(0f, 2f), blurRadius = 8f)` |
| Число / строка | Как есть / `JSON.stringify` |

Определение dp/sp — функция `usesSp()` из `format.ts` (совпадение с `/fontsize/i`).

## import генерируются по необходимости

Список import определяется **фактически использованными runtime-типами** (`importsFor(features)`); неиспользуемые типы не импортируются:

| Возможность | import |
| --- | --- |
| Цвет | `androidx.compose.ui.graphics.Color as ComposeColor` |
| Размер | `androidx.compose.ui.unit.dp` + `.sp` |
| Тень | `androidx.compose.ui.graphics.Shadow` + `androidx.compose.ui.geometry.Offset` |
| Безье | `androidx.compose.animation.core.CubicBezierEasing` |

## Тёмная тема

Отдельный `object LhDarkTokens` со **структурой пространств имён, идентичной светлой**:

```kotlin
object LhDarkTokens {
  object Color {
    val focus = ComposeColor(0xFF7FA6D9)  // Цвет кольца фокуса клавиатуры; по умолчанию следует за основным цветом
    val selected = ComposeColor(0xFFB1C1D8)  // Цвет текста в выбранном состоянии; следует за нажатым вариантом основного цвета
    object Background {
      ...
    }
  }
}
```

Тёмная тема содержит только переопределённые ключи (сейчас исключительно `color.*`); непереопределённые ключи в тёмной теме наследуют значения из `LhTokens`.

## Использование

Репозиторий Android подключает каталог `dist/android/` как source-сет Gradle или локальную maven-зависимость; для использования достаточно `import top.lhgb.ui.tokens.LhTokens`. О локальной линковке — [Локальная линковка](../guide/local-linking).
