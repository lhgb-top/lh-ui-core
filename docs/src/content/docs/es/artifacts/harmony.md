---
title: "Artefactos de HarmonyOS"
---

**Ruta**: `dist/harmony/tokens/LhTokens.ets` y `LhDarkTokens.ets`; cuando existen tokens de sombra se genera además `LhShadow.ets`

**Directorio del módulo**: `tokens/` (dentro del módulo ohpm)

## Estructura

La raíz es una `export class`, las clases anidadas **no llevan export** (ArkTS no permite declaraciones export dentro del cuerpo de una clase) y los miembros son `static readonly`:

```ts
export class LhTokens {
  class Button {
    static readonly borderRadius: Dimension | number = 2  // El radio de esquina del botón sigue el radio global
    static readonly borderWidth: Dimension | number = 1
    class FontSize {
      static readonly large: Dimension | number = 16
      static readonly medium: Dimension | number = 14
    }
    class Height {
      static readonly medium: Dimension | number = 40  // Altura del botón mediano (por defecto)
    }
  }
  class Color {
    static readonly focus: ResourceColor = '#FF2B4C7C'
  }
}
```

## Correspondencia de nombres

| Ruta del token | Miembro ArkTS |
| --- | --- |
| `button.height.medium` | `LhTokens.Button.Height.medium` |
| `color.primary.default` | `LhTokens.Color.Primary.default` |
| `zIndex.modal` | `LhTokens.ZIndex.modal` |

## La única plataforma con anotaciones de tipo

ArkTS está fuertemente tipado, de modo que cada miembro lleva una anotación de tipo (`typeAnnotation()`):

| Tipo de token | Anotación de tipo |
| --- | --- |
| color | `ResourceColor` |
| dimension | `Dimension \| number` |
| duration / number | `number` |
| shadow | `LhShadow` |
| cubicBezier | `number[]` |
| string | `string` |

Kotlin / Swift / C se apoyan en la deducción a partir del literal; únicamente ArkTS anota los tipos de forma explícita.

## Unidades y literales

| Tipo de token | Literal ArkTS |
| --- | --- |
| Color | `'#FF2B4C7C'` (ArkUI admite cadenas `#AARRGGBB`, a través de `toArgbHash`) |
| Dimensión | Valor numérico puro en `vp` (`40`, sin unidad) |
| Porcentaje | `0.500  // 50% (fracción, calculada a partir de la dimensión del contenedor)` |
| Duración | `200  // 200ms (milisegundos)` |
| Bézier | `[0.4, 0, 0.2, 1]  // puntos de control de Bézier; el componente lo consume con curves.cubicBezierCurve` |
| Sombra | `{ color: '#FF000000', radius: 8, offsetX: 0, offsetY: 2 }` |
| Número / cadena | Tal cual / `JSON.stringify` |

## LhShadow.ets

ArkUI tampoco tiene un tipo de sombra compuesto, de modo que se expresa mediante una **interfaz** (**plantilla estática, sin contenido de tokens**):

```ts
export interface LhShadow {
  color: ResourceColor
  /** Radio de desenfoque */
  radius: number
  offsetX: number
  offsetY: number
}
```

Frente al `struct LhShadow` de iOS: ArkTS usa una interfaz y SwiftUI una estructura; cada uno se ajusta a las convenciones de su lenguaje.

## Modo oscuro

Una `export class LhDarkTokens` independiente, con la misma estructura que el archivo claro:

```ts
export class LhDarkTokens {
  class Color {
    static readonly focus: ResourceColor = '#FF7FA6D9'
    static readonly selected: ResourceColor = '#FFB1C1D8'
    // … resto de las claves sobrescritas
  }
}
```

Las claves no sobrescritas conservan, en el modo oscuro, los valores de `LhTokens`.

## Cómo se consume

El repositorio de HarmonyOS incorpora `dist/harmony/` como dependencia `file:` de ohpm (enlace local) o consume el paquete ya publicado; basta con `import { LhTokens } from '...'` para usarlo.
