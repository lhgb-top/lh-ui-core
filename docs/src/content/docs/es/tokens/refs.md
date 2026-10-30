---
title: "Mecanismo de referencia"
---

## Qué es `ref`

Una hoja puede omitir `value` y escribir en su lugar `ref`, que apunta a la **ruta completa** de otro token:

```json
"selected": { "ref": "color.primary.active", "description": "Color del texto del estado seleccionado, sigue la variante pulsada del color principal" }
```

En tiempo de compilación, `ref` se **resuelve de forma estática y se cuece como valor literal** — en los artefactos de cada plataforma se ve el valor ya resuelto, con **cero de indirección en tiempo de ejecución**.

## Algoritmo de resolución

La función interna `resolveRef(path, chain)` de `resolve.ts`:

1. La ruta de destino no existe → se lanza `El token referenciado no existe: <path>`
2. Si el destino es a su vez una ref → **recursión** a lo largo de la cadena (admite cadenas indirectas de cualquier longitud)
3. La cadena ya contiene la ruta actual → se lanza `Ciclo de referencias de tokens detectado: a -> b -> a`
4. Se alcanza un valor literal → se devuelve `{ value, type }`

## Cadenas indirectas

```json
"a": { "ref": "b" },
"b": { "ref": "c" },
"c": { "value": "#2B4C7C" }
```

`a` se resuelve a lo largo de la cadena hasta el valor literal de `c`.

## Detección de ciclos

```json
"a": { "ref": "b" },
"b": { "ref": "a" }
```

En la fase de resolve, `chain.includes(path)` se cumple y se lanza `Ciclo de referencias de tokens detectado: a -> b -> a`; codegen falla directamente.

## Resultado del cocido

El resultado de la resolución se escribe en `token.value` y se registra en `refChain` (`ResolvedToken.refChain`, por ejemplo `["color.primary.active"]`). En los artefactos de cada plataforma solo hay valores literales; no se ven las refs:

```kotlin
// button.borderRadius hacía referencia a radius.base (2px); tras el cocido:
val borderRadius = 2.dp  // El radio de esquina del botón sigue el radio global
```

## El tipo sigue a la fuente

Cuando una hoja ref no declara su propio `type`, **el tipo se toma del destino de la referencia** (el nivel 2 de la prioridad de tres niveles; véase el [Sistema de tipos](./type-system)).

## refMap

El `refMap` que devuelve `resolveTokens` registra todas las relaciones de referencia resueltas (`path -> cadena ref original`; las claves oscuras llevan el prefijo `dark:`) y sirve para la documentación y para `pnpm verify:tokens`.

## Usos reales

Los escenarios típicos de `ref` en `tokens/`:

| Escenario | Ejemplo |
| --- | --- |
| Un componente sigue una cantidad global | `button.borderRadius` → `radius.base` |
| Un estado sigue un color semántico | `color.selected` → `color.primary.active` |
| El tamaño de fuente del componente sigue la tipografía | `button.fontSize.small` → `typography.fontSize.small` |

**Toda referencia debe escribirse como ruta completa** (espacio de nombres + ruta anidada); véanse los [Espacios de nombres](./namespace).
