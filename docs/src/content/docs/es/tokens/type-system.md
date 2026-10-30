---
title: "Sistema de tipos"
---

## Los siete tipos

`type` y el `$type` de nivel de archivo solo admiten: `color` / `dimension` / `number` / `string` / `shadow` / `duration` / `cubicBezier` (en correspondencia uno a uno con los enumerados de `tokens/schema.json`; véase `TokenType` en `codegen/src/types.ts`).

La forma válida de los valores de cada tipo se describe en [Formato de tokens](./token-format).

## Prioridad de tipos de tres niveles

El tipo de una hoja se evalúa en el siguiente orden:

```
1. El tipo declarado por la propia hoja
2. El tipo del destino de la ref (solo si la hoja no declaró su propio tipo)
3. El $type de nivel de archivo o de nivel de grupo
4. Si ninguno → la fase de resolve lanza un error
```

Esta prioridad la implementan **de forma colaborativa las dos fases, flatten y resolve**.

### Fase uno: flatten (descenso del `$type` de grupo)

El `flatten` de `load.ts` propaga hacia abajo por el árbol el `$type` declarado por los grupos (incluida la raíz del archivo), pero **solo lo cuece en las hojas literales**:

```ts
// Los tokens literales heredan el tipo del grupo; los tokens ref conservan undefined,
// y es resolve quien toma el tipo del destino de la referencia
if (node.type === undefined && node.ref === undefined && groupType !== undefined) {
  out.set(path, { ...node, type: groupType })
}
```

**Las hojas ref se omiten deliberadamente** — se evita así que el tipo por defecto del archivo en que se encuentran las induzca a error.

### Fase dos: resolve (el tipo del destino de la ref prevalece sobre el valor por defecto del archivo)

Cuando `resolve.ts` construye el mapeo del modo claro:

```ts
token: {
  type: raw.type ?? (file.defaultType as ResolvedToken['type']),  // primero, el $type de nivel de archivo como respaldo
  ...
},
ownType: raw.type,  // sirve para distinguir «el tipo declarado por la propia hoja» del «valor por defecto de nivel de archivo»
```

Una vez resuelta la referencia:

```ts
// Si no se declaró un tipo propio, se toma el tipo del destino de la referencia (el tipo del token sigue a la fuente)
if (entry.ownType === undefined && resolved.type !== undefined) {
  entry.token.type = resolved.type
}
```

Este paso **superpone el nivel 2 (el tipo del destino de la ref) al nivel 3 (el `$type` de nivel de archivo)**. Por último, si el tipo sigue siendo undefined, se lanza `El token X no tiene tipo`.

## Por qué hacen falta tres niveles

Un ejemplo típico: `button.fontWeight` hace referencia a `typography.fontWeight.primary`:

```json
// components.json ($type de nivel de archivo: dimension)
"button": { "fontWeight": { "ref": "typography.fontWeight.primary" } }

// typography.json
"fontWeight": { "primary": { "value": 400, "type": "number" } }
```

Si la hoja ref también heredara el `dimension` de nivel de archivo, el tipo de `button.fontWeight` sería incorrecto. La prioridad de tres niveles garantiza que **siga al destino de la referencia y tome `number`**.

Otro ejemplo: `typography.json` no tiene `$type` de nivel de archivo y se apoya en el `$type` de nivel de grupo (el grupo `fontSize` marcado como `dimension`) y en el `type` propio de las hojas (`fontWeight.primary` con su `number`) para que cada uno gestione lo suyo.

## Validación semántica

El esquema solo controla la estructura. **Si el tipo y el valor coinciden** lo comprueba uno a uno `assertTypedValue` de `format.ts` en la fase de resolve, y además resuelve el valor en la práctica:

- `color` → debe poder analizarse con `parseColor` (hexadecimal o rgba)
- `dimension` → debe coincidir con `/^\d+(\.\d+)?(px|%)$/`
- `duration` → admite `s` / `ms`
- `shadow` → se parte por espacios; si el 4.º segmento coincide con `-?\d+(\.\d+)?px` es la extensión (spread), y si no, es el color
- `cubicBezier` → una matriz de cuatro elementos

Para más detalles, véase la [Capa de formato format.ts](../codegen/format).

## Inferencia de tipos en el lado oscuro

La inferencia de tipos de las claves sobrescritas del modo oscuro es más simple: `raw.type ?? byPath.get(path)?.type`. Las claves oscuras sin tipo no provocan el fallo de codegen, sino que se registran en `orphanDarkPaths` y las informa `pnpm verify:tokens`. Para más detalles, véase la [Fusión del modo oscuro](./dark-mode).
