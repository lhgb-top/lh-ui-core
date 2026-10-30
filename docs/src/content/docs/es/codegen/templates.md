---
title: "Lista de plantillas"
---

En `codegen/templates/` hay en total **8 plantillas Handlebars**, **sin ningún helper personalizado registrado** (solo se usan las integradas `{{#each}}` y las llaves triples `{{{ }}}`).

## Plantilla → artefacto → campos de datos

| Plantilla | Artefacto renderizado | Campos de datos |
| --- | --- | --- |
| `android/LhTokens.kt.hbs` | `LhTokens.kt` **y** `LhDarkTokens.kt` (claro y oscuro comparten) | `{ version, source, package, imports[], body }` |
| `ios/LhTokens.swift.hbs` | `LhTokens.swift` y `LhDarkTokens.swift` | `{ version, source, body }` |
| `ios/LhShadow.swift.hbs` | `LhShadow.swift` (plantilla estática, sin ranura para body) | `{ version, source }` |
| `harmony/LhTokens.ets.hbs` | `LhTokens.ets` y `LhDarkTokens.ets` | `{ version, source, body }` |
| `harmony/LhShadow.ets.hbs` | `LhShadow.ets` (plantilla estática) | `{ version, source }` |
| `windows/LhTokens.cs.hbs` | `LhTokens.cs` y `LhDarkTokens.cs` | `{ version, source, namespace, body }` |
| `windows/LhShadow.cs.hbs` | `LhShadow.cs` (plantilla estática) | `{ version, source, namespace }` |
| `windows/LhEasing.cs.hbs` | `LhEasing.cs` (plantilla estática) | `{ version, source, namespace }` |

## El banner unificado de cabecera

Todas las plantillas llevan en la parte superior el mismo bloque de comentarios:

```
// =====================================================================================
// Este archivo está generado automáticamente por @lh-ui/core (codegen en tiempo de compilación); por favor, no lo modifiques a mano.
// Fuente: {{{source}}} @ v{{{version}}}
// Para modificarlo, edita los tokens/*.json del repositorio lh-ui-core y vuelve a ejecutar pnpm codegen.
// =====================================================================================
```

Esta es la declaración a nivel de código de la prohibición de modificar `dist/` a mano (línea roja 6).

## Las plantillas compartidas por el modo claro y el oscuro

**Los artefactos claro y oscuro de android / ios / harmony / windows comparten la misma plantilla**; la diferencia está solo en el `body` que reciben (el nombre del object / enum / class raíz es distinto).

## Las plantillas estáticas (estructuras portadoras)

`ios/LhShadow.swift.hbs`, `harmony/LhShadow.ets.hbs`, `windows/LhShadow.cs.hbs` y `windows/LhEasing.cs.hbs` **no tienen ranura para body**; su contenido es completamente estático:

```handlebars
{{!-- harmony/LhShadow.ets.hbs --}}
/// Estructura de los tokens de sombra
export interface LhShadow {
  color: ResourceColor
  /** Radio de desenfoque */
  radius: number
  offsetX: number
  offsetY: number
}
```

Como ni SwiftUI, ni ArkUI, ni WinUI tienen un tipo que corresponda directamente a una «sombra compuesta» o a una curva de Bézier, hace falta una estructura portadora en cada una; en cambio, la sombra de Android es una API de la plataforma y no necesita ningún archivo adicional. Las dos estructuras portadoras de Windows son ambas `readonly record struct`:

```handlebars
{{!-- windows/LhShadow.cs.hbs --}}
public readonly record struct LhShadow(Windows.UI.Color Color, double OffsetX, double OffsetY, double BlurRadius);
```

## Ejemplos de plantillas

```handlebars
{{!-- android/LhTokens.kt.hbs --}}
// Banner de cabecera…

package {{{package}}}

{{#each imports}}
{{{this}}}
{{/each}}

{{{body}}}
```

```handlebars
{{!-- windows/LhTokens.cs.hbs --}}
// Banner de cabecera…

namespace {{{namespace}}};

{{{body}}}
```

## Principios de diseño

- **Plantillas finas**: solo se responsabilizan del esqueleto del archivo (comentario de cabecera, package / namespace, apertura y cierre de las guardas), mientras que el formateo literal, token a token, se completa íntegramente en el TS del target y se alimenta a la plantilla como `body`. Para más detalles, véase la [Capa de renderizado render.ts](./render).
- **`noEscape: true`**: las plantillas contienen caracteres como `<`, `>` y `#` (`#ifndef`, `#define`, corchetes angulares de los genéricos), de modo que el escape HTML debe estar desactivado.
- **Caché de compilación**: el `loadTemplate` de `render.ts` cachea el resultado de la compilación, para evitar compilar de nuevo.

## Cómo añadir una plantilla nueva

1. Añade un archivo `.hbs` en `codegen/templates/<platform>/`
2. Ensambla los datos en el target correspondiente y llama a `render('<platform>/<name>.hbs', data)`
3. Ejecuta `pnpm codegen` para revisar el artefacto y `pnpm test -- -u` para actualizar la instantánea
