---
title: "Fusión del modo oscuro"
---

## Sobrescritura incremental

El archivo oscuro (`"$dark": true`) **solo declara las claves que difieren del archivo claro**; las claves no sobrescritas conservan el valor claro:

```json
// color-dark.json
{
  "$namespace": "color",
  "$dark": true,
  "$description": "Solo declara las claves que difieren del archivo claro; las no sobrescritas se heredan de color.json",
  "primary": { "default": { "value": "#3D649E" } }
}
```

Las claves no enumeradas, como `color.primary.hover` o `.active`, conservan en el modo oscuro el valor del archivo claro. El criterio de recorte es una **comparación clave a clave**: toda clave cuyo valor sea idéntico al del archivo claro se elimina (por ejemplo, `onPrimary` es `#FFFFFF` en ambos temas y `disabled.*` es el mismo conjunto de referencias en ambos, de modo que ninguno de los dos aparece en el archivo oscuro).

## El espacio de nombres debe estar alineado

El archivo oscuro debe declarar **el mismo `$namespace`** que el archivo claro (`color-dark.json` lo declara explícitamente con `"$namespace": "color"`) para que las claves sobrescritas caigan en la misma ruta.

## Resolución de las referencias oscuras por proximidad

Las `ref` del archivo oscuro se resuelven con `resolveDarkRef`, cuyas reglas difieren de las del archivo claro:

1. Si el destino está **dentro del espacio de nombres oscuro** y es una ref → se sigue la cadena de forma recursiva dentro del archivo oscuro (solo oscura-referencia-a-oscura implica tomar el valor del mismo tema)
2. Si el destino está dentro del espacio de nombres oscuro y es un valor literal → se devuelve el valor oscuro
3. Si el destino **no** está en el espacio de nombres oscuro → **se recurre al espacio de nombres claro** para tomar el valor

```json
// oscura referencia a oscura: toma el valor oscuro de primary.active
"selectedDark": { "ref": "color.primary.active" }
```

Además, las referencias oscuras se someten a una detección de ciclos (`Ciclo de referencias de tokens oscuros detectado`), y el destino debe existir en el conjunto claro o en el conjunto oscuro; en caso contrario se lanza `La referencia del token oscuro X no existe`.

## Precomputación de color-mix

El modo oscuro del linaje web hace un uso intensivo de `color-mix()`, una capacidad que **las plataformas nativas no tienen en tiempo de ejecución**, de modo que en tiempo de compilación se **precomputa a valores de color planos** y el razonamiento del cálculo se escribe en la descripción:

```json
"selected": {
  "value": "#B1C1D8",
  "description": "Precomputado a partir de color-mix(primary 40%, #fff); contraste del panel oscuro 5.2:1"
},
"primary": {
  "bg": {
    "value": "rgba(61, 100, 158, 0.25)",
    "description": "Precomputado a partir de color-mix(primary 25%, transparent)"
  }
}
```

## Forma de los artefactos

`resolveTokens` produce `TokenSet.dark`: un `Map<path, TokenValue>` aplanado que solo contiene las claves sobrescritas. Cada target decide luego cómo emitirlo:

| Plataforma | Mecanismo del modo oscuro |
| --- | --- |
| Android | Un `object LhDarkTokens` independiente |
| iOS | Un `public enum LhDarkTokens` independiente |
| HarmonyOS | Una `export class LhDarkTokens` independiente |
| **C** | **Redefinición de macros con el mismo nombre** — el archivo de cabecera oscuro se incluye después del claro y sobrescribe directamente los `#define` homónimos |

## Rutas huérfanas del modo oscuro

Dos tipos de anomalías se registran en `orphanDarkPaths` (**sin interrumpir codegen**; las informa `pnpm verify:tokens`):

- Una clave oscura **sin tipo** (ni tipo propio, ni clave homónima en el conjunto claro de la que heredar) → se omite la clave y no se escribe en la tabla de sobrescrituras
- Una clave oscura **inexistente en el conjunto claro** (huérfana) → se sigue escribiendo en la tabla de sobrescrituras, pero se informa

## Alcance de la cobertura del modo oscuro

Actualmente el modo oscuro solo cubre el espacio de nombres `color.*` (el número exacto de claves varía con la versión; véase la columna de modo oscuro de la página [Referencia de tokens](./reference)). Los espacios de nombres no relacionados con el color (espaciado, radio de esquina, tamaño de fuente, etc.) conservan los valores claros en el modo oscuro — esa es también la razón por la que la columna de modo oscuro de las filas no relacionadas con el color en `dist/docs/tokens.md` es `—`.

En la página [Referencia de tokens](./reference) pueden verse a la vez los valores claros y oscuros de cada token.
