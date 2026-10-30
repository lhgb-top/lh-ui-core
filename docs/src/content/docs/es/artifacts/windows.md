---
title: "Artefactos de Windows"
---

**Ruta**: `dist/windows/Tokens/LhTokens.cs` y `LhDarkTokens.cs`; cuando existen tokens de sombra se genera además `LhShadow.cs`, y cuando existen tokens de Bézier, `LhEasing.cs`

**Espacio de nombres**: `Top.Lhgb.Ui.Tokens` (dominio inverso, plan maestro D20)

## Estructura

`public static class` anidados para expresar la jerarquía de tokens, con miembros `public static readonly`:

```csharp
public static class LhTokens {
  public static class Button {
    public static readonly double BorderRadius = 2.0;  // El radio de esquina del botón sigue el radio global
    public static class Height {
      public static readonly double Large = 48.0;  // Altura del botón grande
      public static readonly double Medium = 40.0;  // Altura del botón mediano (por defecto)
      public static readonly double Small = 32.0;  // Altura del botón pequeño
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

## Reglas de nomenclatura de los miembros

`csMemberName(name)`: convierte a **PascalCase** (`default → Default`, `extraLarge → ExtraLarge`) y, de paso, evita las palabras clave contextuales de C# como `default` o `base`. Los nombres de grupo también pasan por PascalCase.

## Unidades y literales

| Tipo de token | Literal C# | Tipo del campo |
| --- | --- | --- |
| Color | `Windows.UI.Color.FromArgb(0xFF, 0x2B, 0x4C, 0x7C)` | `Windows.UI.Color` |
| Dimensión (entera) | `40.0` | `double` |
| Dimensión (decimal) | `0.5` | `double` |
| Porcentaje | `0.5  // 50% (fracción, calculada a partir de la dimensión del contenedor)` | `double` |
| Duración | `200  // 200ms (milisegundos)` | `int` |
| Bézier | `new LhEasing(0.4, 0, 0.2, 1)` | `LhEasing` |
| Sombra | `new LhShadow(0xFF..., 0.0, 2.0, 8.0)` | `LhShadow` |
| Cadena | `"'Source Code Pro', ..."` | `string` |

Convenciones de unidades: **las dimensiones están en epx (píxeles lógicos, el valor es directamente utilizable)**, **las duraciones en milisegundos** (el componente usa `TimeSpan.FromMilliseconds(...)`), **los colores en ARGB**.

### Por qué Windows.UI.Color

En Windows App SDK 1.6 y versiones anteriores **no existe** la estructura `Microsoft.UI.Color`; las propiedades de la tabla de colores `Microsoft.UI.Colors` (Black, Transparent, etc.) devuelven también `Windows.UI.Color`. Por eso, en el lado de los tokens se usa siempre `Windows.UI.Color` — viene con la fábrica `FromArgb` y su tipo coincide con el de la tabla Colors. Si el componente necesita referenciar la tabla Colors, debe hacer `using Microsoft.UI;` (Colors) + `using Windows.UI;` (Color).

## Modo oscuro: un objeto paralelo

`LhDarkTokens` es un objeto independiente, paralelo a `LhTokens`, **que solo contiene la subclase `Color`**:

```csharp
public static class LhDarkTokens {
  public static class Color {
    public static readonly Windows.UI.Color Focus = Windows.UI.Color.FromArgb(0xFF, 0x7F, 0xA6, 0xD9);
    // ...
  }
}
```

El modo oscuro solo sobrescribe colores: **las dimensiones, el movimiento y los radios de esquina no cambian en el modo oscuro** — cuando un componente necesita una dimensión del modo oscuro, toma el valor del objeto claro. Esto es completamente coherente con la forma de las plataformas android / ios / harmony.

## Estructuras portadoras

`LhShadow.cs` y `LhEasing.cs` son ambas `readonly record struct` (WinUI no tiene un tipo directo que corresponda a una sombra compuesta ni a una curva de Bézier):

```csharp
public readonly record struct LhShadow(Windows.UI.Color Color, double OffsetX, double OffsetY, double BlurRadius);
public readonly record struct LhEasing(double X1, double Y1, double X2, double Y2);
```

La extensión (`spread`) de la sombra se ignora en todas las plataformas y se deja constancia en un comentario (WinUI DropShadow no la soporta), por ejemplo `// Extensión 0px: WinUI DropShadow no la soporta, ignorada`.

## Cómo se consume

El `pnpm link:tokens` del repositorio de Windows (`lh-ui-windows`) copia todo el árbol de `dist/windows/` a `src/Tokens/` (el destino es el subdirectorio `Tokens/` bajo la raíz de las fuentes), y en el lado del componente `using Top.Lhgb.Ui.Tokens;` apunta a ese lugar. La guarda de existencia de tres niveles (dist local → npm `@lh-ui/core` → error) se describe en el [Enlace local](../guide/local-linking).
