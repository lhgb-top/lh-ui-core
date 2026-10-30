---
title: "Capa de resolución resolve.ts"
---

> Resolución de referencias y fusión del modo oscuro.

`resolveTokens(files: LoadedTokenFile[]): ResolveResult` es la función principal, dividida en tres partes:

## Valor de retorno

```ts
interface ResolveResult {
  tokenSet: TokenSet                    // el conjunto de tokens claros + la tabla de sobrescrituras del modo oscuro
  orphanDarkPaths: string[]             // las rutas huérfanas del modo oscuro (para el informe de verify)
  refMap: Map<string, string>           // path -> cadena ref original (las claves oscuras llevan el prefijo dark:)
}
```

## Primera parte: el aplanado del modo claro

Se fusionan los `flat` de todos los archivos no oscuros en un único `rawMap`:

```ts
if (rawMap.has(path)) throw new Error(`Ruta de token duplicada: ${path} (archivo ${file.fileName})`)
```

Cada registro lleva tres valores:

| Campo | Significado |
| --- | --- |
| `token` | El `ResolvedToken` que se está construyendo (el tipo se toma primero de `raw.type ?? file.defaultType` como respaldo) |
| `raw` / `ref` | El valor original y la cadena de referencia |
| `ownType` | **El tipo declarado por la propia hoja**, dedicado a distinguir «el declarado por la hoja» del «que viene por defecto de nivel de archivo** |

`ownType` es la clave de la prioridad de tres niveles de tipos: una vez resuelta la referencia, **solo si `ownType === undefined`** se toma el tipo del destino de la referencia.

## Segunda parte: la resolución de refs

La función interna `resolveRef(path, chain): { value, type? }`:

1. `rawMap.get(path)` no existe → se lanza `El token referenciado no existe: <path>`
2. Si el destino es a su vez una ref → recursión `resolveRef(entry.ref, [...chain, path])`
3. `chain.includes(path)` → se lanza `Ciclo de referencias de tokens detectado: a -> b -> a`
4. Se alcanza un valor literal → se devuelve `{ value, type }`

El bucle principal, para cada entrada con ref:

```ts
refMap.set(path, entry.ref)                    // se registra la relación de referencia
const resolved = resolveRef(entry.ref, [path])
entry.token.value = resolved.value             // se cuece como valor literal
entry.token.refChain = [entry.ref]             // se registra la cadena de referencias
if (entry.ownType === undefined && resolved.type !== undefined) {
  entry.token.type = resolved.type             // el tipo sigue a la fuente
}
```

Por último:

```ts
if (entry.token.type === undefined) {
  throw new Error(`El token ${path} no tiene tipo (ni type propio ni $type de nivel de archivo)`)
}
assertTypedValue(entry.token.type, value)      // validación semántica
```

El resultado se ordena por path en orden lexicográfico y se construye a la vez el índice `byPath`.

## Tercera parte: las sobrescrituras del modo oscuro

El archivo oscuro solo declara **las claves que deben sobrescribirse**.

**La vista del espacio de nombres oscuro**: primero se vuelven a aplanar los `flat` de todos los archivos oscuros en un `darkRawMap` (`path -> { value, ref }`).

**La función interna `resolveDarkRef(path, chain): TokenValue`** — la resolución por proximidad de los refs oscuros:

| Caso | Comportamiento |
| --- | --- |
| El destino está en `darkRawMap` y es una ref | Se sigue la cadena de forma recursiva **dentro del espacio de nombres oscuro** (solo oscura-referencia-a-oscura implica tomar el valor del mismo tema), también con detección de ciclos |
| El destino está en `darkRawMap` y es un valor literal | Se devuelve el valor oscuro |
| El destino **no** está en `darkRawMap` | **Se recurre al espacio de nombres claro** con `resolveRef(path, chain).value` |

**El recorrido de las entradas oscuras**:

```ts
if (raw.ref) {
  // El destino debe existir en byPath / rawMap / darkRawMap (en cualquiera de los tres)
  if (!byPath.has(raw.ref) && !rawMap.has(raw.ref) && !darkRawMap.has(raw.ref)) {
    throw new Error(`La referencia del token oscuro ${path} no existe: ${raw.ref}`)
  }
  value = resolveDarkRef(raw.ref, [path])
  refMap.set(`dark:${path}`, raw.ref)    // las claves oscuras llevan el prefijo
}
const type = raw.type ?? byPath.get(path)?.type
if (!type) { orphanDarkPaths.push(path); continue }   // sin tipo → se omite la clave
assertTypedValue(type, value)
if (!byPath.has(path)) orphanDarkPaths.push(path)     // huérfana → se sigue escribiendo en la tabla
dark.set(path, value)
```

## Las rutas huérfanas del modo oscuro

Los dos tipos de anomalías **no interrumpen codegen**; simplemente se registran en `orphanDarkPaths` y las informa `pnpm verify:tokens`:

- Una clave oscura **sin tipo** (ni tipo propio, ni clave homónima en el conjunto claro de la que heredar) → **se omite la clave y no se escribe en la tabla de sobrescrituras**
- Una clave oscura **inexistente en el conjunto claro** (huérfana) → **se sigue escribiendo en la tabla de sobrescrituras**, pero se informa

Para más detalles, véase la [Fusión del modo oscuro](../tokens/dark-mode).

## Cómo consumen `dark` las distintas plataformas

`dark` es un `Map<path, TokenValue>` plano, y cada target decide luego cómo emitirlo (Kotlin / Swift / ArkTS son espacios de nombres `LhDarkTokens` independientes; C es una redefinición de macros con el mismo nombre). Para más detalles, véanse [Las cinco plataformas objetivo](./targets).
