---
title: "Formato de tokens"
---

Cada archivo `tokens/*.json` es una fuente neutral independiente de la plataforma, con el formato fuertemente restringido por `tokens/schema.json`.

## Metapropiedades de nivel de archivo

Las claves que empiezan por `$` son metapropiedades y no producen tokens:

| Propiedad | Función |
| --- | --- |
| `$schema` | Apunta a `./schema.json` (autocompletado y validación del editor) |
| `$description` | Descripción del archivo; aparece en el target de docs y en el documento de línea base |
| `$type` | **Tipo por defecto de nivel de archivo**; las hojas literales que no declaran su propio `type` lo heredan |
| `$dark` | `true` indica que este archivo es un archivo de sobrescritura del modo oscuro (solo declara las claves que deben sobrescribirse) |
| `$namespace` | Prefijo del espacio de nombres, que determina la ruta global con puntos (véanse los [Espacios de nombres](./namespace)) |

```json
{
  "$schema": "./schema.json",
  "$namespace": "color",
  "$type": "color",
  "$description": "Paleta y colores semánticos",
  "primary": { "default": { "value": "#2B4C7C" } }
}
```

## Los cinco campos de un token hoja

| Campo | Obligatorio | Función |
| --- | --- | --- |
| `value` | Alternativa con `ref` (**uno de los dos**) | Valor literal |
| `ref` | Alternativa con `value` (**uno de los dos**) | Ruta completa de referencia a otro token (resuelta de forma estática y cocida en tiempo de compilación) |
| `type` | Opcional | Tipo del token; si no se declara, se hereda del `$type` de nivel de archivo |
| `description` | Opcional | Descripción; se renderiza en los comentarios de los artefactos de cada plataforma y en las tablas de documentación |
| `nativeOnly` | Opcional | `true` = añadido por el linaje nativo, sin equivalente en el linaje web |

El esquema usa `anyOf: [{required: [value]}, {required: [ref]}]` + `additionalProperties: false` para garantizar que cada hoja tenga **exactamente uno** de `value` o `ref`, y que no se permitan campos adicionales.

## Los siete tipos

`type` / `$type` solo admite estos siete valores:

| Tipo | Forma del valor | Ejemplo |
| --- | --- | --- |
| `color` | `#RGB` / `#RRGGBB` / `#AARRGGBB` / `rgba(r,g,b,a)` | `"#2B4C7C"`, `"rgba(61, 100, 158, 0.25)"` |
| `dimension` | **Solo cadenas con unidad** `"12px"` / `"50%"` (`assertTypedValue` fuerza que sea cadena; un valor numérico puro solo es legítimo bajo el tipo `number`) | `"40px"`, `"50%"` |
| `number` | Valor numérico puro | `400`, `1000` |
| `string` | Cadena | `"PingFang SC"` |
| `shadow` | Cadena de sombra separada por espacios (`x y blur [spread] color`) | `"0px 2px 12px 0px rgba(26, 26, 26, 0.08)"` |
| `duration` | `"200ms"` / `"0.2s"` (se normaliza a milisegundos) | `"200ms"` |
| `cubicBezier` | Matriz de cuatro elementos | `[0.4, 0, 0.2, 1]` |

Los valores que no coincidan con el tipo (por ejemplo, `type: color` con `40px`) se rechazan en la fase de resolve por `assertTypedValue`; véase el [Sistema de tipos](./type-system).

## Restricción de valores neutrales (línea roja 5)

Los valores de los tokens **solo admiten expresiones neutrales**:

- ✅ Colores hexadecimales, `rgba()`, cadenas con unidad `"12px"` / `"50%"`, valores numéricos puros bajo el tipo `number`
- ❌ `var()`, `rem`, `sp`, `dp` o cualquier otra unidad o referencia específica de plataforma

La conversión de unidades de plataforma la realizan las plantillas de cada target:

| Plataforma | Conversión |
| --- | --- |
| Android | `usesSp()` decide `sp` para los tamaños de fuente y `dp` para el resto |
| iOS | Dimensiones `CGFloat`, duraciones **convertidas a segundos** (`(ms/1000)`, porque las animaciones de SwiftUI se expresan en segundos) |
| HarmonyOS | Dimensiones como valores puros en `vp` |
| C | Valores numéricos puros, con la unidad indicada en un comentario (colores `0xAARRGGBB`, dimensiones en píxeles lógicos, duraciones en milisegundos) |

## Anidamiento de grupos

Se pueden anidar grupos en cualquier nivel, y un grupo también puede declarar su propio `$type` para sobrescribir el tipo por defecto de todo el grupo:

```json
"fontSize": {
  "$type": "dimension",
  "base": { "value": "14px" },
  "small": { "value": "13px" }
}
```

`typography.json` no tiene `$type` de nivel de archivo; cada grupo u hoja declara el suyo mediante un `$type` de grupo o mediante el `type` propio de la hoja.

## El marcador `nativeOnly`

Marca los tokens añadidos por el linaje nativo que no tienen equivalente en el linaje web (en su mayoría, dimensiones nuevas para móvil). Sus efectos:

- En la columna de descripción de `dist/docs/tokens.md` se anota como «nativo añadido»
- El documento de línea base de la familia lo utiliza para filtrar la lista de «tokens nativos añadidos»
- **Los targets nativos no lo filtran**; lo generan tal cual

## Lista de archivos

| Archivo | `$namespace` | `$type` | Descripción |
| --- | --- | --- | --- |
| `color.json` | `color` (deducido del nombre del archivo) | `color` | Paleta y colores semánticos |
| `color-dark.json` | `color` (explícito, debe coincidir con el espacio del archivo claro) | `color` | Sobrescrituras incrementales del modo oscuro |
| `components.json` | `""` | `dimension` | Tokens de nivel de componente |
| `typography.json` | `typography` | ninguno (cada grupo u hoja declara el suyo) | Tipografía |
| `spacing.json` | `spacing` | `dimension` | Escala de espaciados |
| `radius.json` | `radius` | `dimension` | Radios de esquina |
| `shadow.json` | `shadow` | `shadow` | Sombras |
| `motion.json` | `motion` | ninguno (cada grupo u hoja declara el suyo) | Duraciones y curvas de interpolación |
| `z-index.json` | `zIndex` (explícito) | `number` | Jerarquía de capas |
