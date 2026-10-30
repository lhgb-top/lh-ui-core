---
title: "Artefactos de Android"
---

**Ruta**: `dist/android/top/lhgb/ui/tokens/LhTokens.kt` y `LhDarkTokens.kt`

**Nombre del paquete**: `top.lhgb.ui.tokens` (convención de dominio inverso, plan maestro D20)

## Estructura

Los tokens se organizan por la jerarquía de la ruta en **`object` anidados**, con miembros `val`:

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
    val borderRadius = 2.dp  // El radio de esquina del botón sigue el radio global
    val borderWidth = 1.dp
    object FontSize {
      val large = 16.sp
      val medium = 14.sp
    }
    object Height {
      val medium = 40.dp  // Altura del botón mediano (por defecto)
      val small = 32.dp  // Altura del botón pequeño
    }
  }
  object Color {
    val focus = ComposeColor(0xFF2B4C7C)
  }
}
```

## Correspondencia de nombres

| Ruta del token | Miembro Kotlin |
| --- | --- |
| `button.height.medium` | `LhTokens.Button.Height.medium` |
| `color.primary.default` | `LhTokens.Color.Primary.default` |
| `zIndex.modal` | `LhTokens.ZIndex.modal` |

Los nombres de grupo van en `pascalCase` (solo mayúscula inicial) y los nombres de miembro se conservan tal cual.

## Unidades y literales

| Tipo de token | Literal Kotlin |
| --- | --- |
| Color | `ComposeColor(0xFF2B4C7C)` (ARGB Int) |
| Dimensión | `40.dp`; **los tokens de tamaño de fuente (la ruta contiene `fontsize`) usan `.sp`**, el resto `.dp` |
| Porcentaje | `0.50f  // 50% (fracción, calculada a partir de la dimensión del contenedor)` |
| Duración | `200  // 200ms (milisegundos)` (Int) |
| Bézier | `CubicBezierEasing(0.4f, 0f, 0.2f, 1f)` |
| Sombra | `Shadow(color = ..., offset = Offset(0f, 2f), blurRadius = 8f)` |
| Número / cadena | Tal cual / `JSON.stringify` |

La decisión dp/sp se toma con `usesSp()` de `format.ts` (`/fontsize/i`).

## Los import se generan bajo demanda

La lista de import la determinan **los tipos en tiempo de ejecución realmente utilizados** (`importsFor(features)`); los tipos que no se utilizan no se importan:

| Característica | import |
| --- | --- |
| Color | `androidx.compose.ui.graphics.Color as ComposeColor` |
| Dimensión | `androidx.compose.ui.unit.dp` + `.sp` |
| Sombra | `androidx.compose.ui.graphics.Shadow` + `androidx.compose.ui.geometry.Offset` |
| Bézier | `androidx.compose.animation.core.CubicBezierEasing` |

## Modo oscuro

Un `object LhDarkTokens` independiente, con **la misma estructura de espacios de nombres que el archivo claro**:

```kotlin
object LhDarkTokens {
  object Color {
    val focus = ComposeColor(0xFF7FA6D9)  // Color del anillo del foco del teclado, por defecto sigue el color principal
    val selected = ComposeColor(0xFFB1C1D8)  // Color del texto del estado seleccionado, sigue la variante pulsada del color principal
    object Background {
      ...
    }
  }
}
```

El modo oscuro solo contiene las claves sobrescritas (actualmente solo `color.*`); las claves no sobrescritas conservan, en el modo oscuro, los valores de `LhTokens`.

## Cómo se consume

El repositorio de Android incorpora el directorio `dist/android/` como conjunto de fuentes de Gradle o como dependencia maven local; basta con `import top.lhgb.ui.tokens.LhTokens` para usarlo. Para el enlace local, véase el [Enlace local](../guide/local-linking).
