---
title: "Definiciones de tipos types.ts"
---

> Todas las definiciones de tipos compartidas por los módulos de codegen. No dependen de ninguna API de plataforma; son de uso interno de la cadena de herramientas de compilación y no entran en ningún artefacto en tiempo de ejecución.

En la [Visión general del pipeline](./pipeline) se presentan las cuatro interfaces principales (`CodegenTarget` / `CodegenInput` / `GeneratedFile` / `TokenSet`); esta página es la referencia completa.

## El lado de los tokens

### `TokenType`

```ts
type TokenType =
  | 'color'
  | 'dimension'
  | 'number'
  | 'string'
  | 'shadow'
  | 'duration'
  | 'cubicBezier'
```

Se corresponde uno a uno con los enumerados `$type` / `type` de `tokens/schema.json`. Las restricciones de los valores neutrales de cada tipo se describen en [Formato de tokens](../tokens/token-format), y su análisis, en la [Capa de formato format.ts](./format).

### `TokenValue`

```ts
type TokenValue = string | number | number[]
```

El valor neutral de un token: color hexadecimal / `rgba()` / cadena con unidad (`"12px"`, `"50%"`, `"0.3s"`) / número puro (tipo `number`) / matriz de Bézier de cuatro elementos. Se prohíbe cualquier sintaxis específica de plataforma.

### `RawToken`

```ts
interface RawToken {
  value?: TokenValue       // valor literal (alternativa con ref, uno de los dos)
  ref?: string             // ruta con puntos que referencia a otro token; resolución estática y cocido en tiempo de compilación
  type?: TokenType         // si no se declara, se hereda del $type de nivel de archivo / de grupo
  description?: string
  nativeOnly?: boolean     // marca los tokens añadidos por el linaje nativo (sin equivalente en el linaje web)
}
```

El token hoja de los archivos JSON fuente; es la imagen directa del nodo `token` del esquema. `value` y `ref` son mutuamente excluyentes (el `anyOf` del esquema fuerza la elección de uno de los dos).

### `ResolvedToken`

```ts
interface ResolvedToken {
  path: string             // la ruta con puntos, por ejemplo color.primary.default
  type: TokenType
  value: TokenValue        // el valor literal ya cocido (la ref está desplegada)
  refChain?: string[]      // si procede de la resolución de una ref, registra la cadena de referencias original (incluidas las cadenas indirectas)
  description?: string
  nativeOnly?: boolean
}
```

El producto de `resolveTokens`. `refChain` solo existe cuando el token procede de una referencia; sirve para que la documentación y la depuración puedan rastrear la cadena de referencias original.

### `DarkOverrides`

```ts
type DarkOverrides = Map<string, TokenValue>
```

Las sobrescrituras del modo oscuro ya resueltas: path -> valor. Las claves son las rutas homónimas del archivo claro (el `$namespace` de `color-dark.json` está alineado con el del archivo claro, de modo que las claves sobrescritas caen en la misma ruta).

### `TokenSet`

```ts
interface TokenSet {
  tokens: ResolvedToken[]              // tokens claros
  byPath: Map<string, ResolvedToken>   // búsqueda rápida por ruta
  dark: DarkOverrides                  // path -> valor de sobrescritura del modo oscuro
}
```

El `ResolveResult.tokenSet` que devuelve `resolveTokens`, y la entrada de todos los targets. `byPath` permite a las sobrescrituras del modo oscuro consultar el tipo y la descripción del token claro homónimo.

## El lado de los contratos (specs)

### `ComponentSpec`

```ts
interface ComponentSpec {
  name: string             // identificador del contrato (kebab-case, por ejemplo 'button')
  component: string        // nombre para mostrar (por ejemplo 'Button botón')
  since?: string           // versión en la que se introdujo
  description: string
  props: SpecProp[]
  events?: SpecEvent[]
  slots?: SpecSlot[]
  behaviors?: string[]
  tokenRefs?: string[]     // las rutas completas de los tokens que consume este componente
}
```

La correspondencia de tipos de `specs/<name>.json`, cargado por `loadSpecs()` con validación de esquema.

### `SpecProp`

```ts
interface SpecProp {
  name: string
  type: 'string' | 'number' | 'boolean' | 'enum' | 'tokenRef' | 'node' | 'array'
  values?: string[]        // solo enum: el conjunto de valores del enumerado
  default?: unknown        // valor por defecto (si no tiene, se omite)
  required?: boolean
  description: string
}
```

`type` coincide con el enumerado de 7 valores de `specs/schema.json`. De ellos, `tokenRef` (ruta de puntos de un token) y `node` (referencia a un nodo) son valores reservados que actualmente ninguno de los 15 contratos utiliza.

### `SpecEvent`

```ts
interface SpecEvent {
  name: string
  payload?: { name: string; type: SpecProp['type']; description?: string }[]
  description: string
}
```

### `SpecSlot`

```ts
interface SpecSlot {
  name: string
  description: string
}
```

## El lado de los casos (cases)

### `ComponentCases`

```ts
interface ComponentCases {
  component: string        // el nombre del componente, en correspondencia con ComponentSpec.name
  cases: GoldenCase[]      // al menos uno (forzado por el esquema con minItems: 1)
}
```

### `GoldenCase`

```ts
interface GoldenCase {
  id: string               // el id del caso (kebab-case, único en todo el repositorio)
  name: string             // una frase legible que lo describe
  given: { props?: Record<string, unknown>; state?: Record<string, unknown> }
  when: {
    action: 'render' | 'click' | 'input' | 'focus' | 'blur' | 'custom'
    target?: string
    payload?: unknown
  }
  then: {
    events?: { name: string; assertion: 'emitted' | 'notEmitted'; times?: number; payload?: unknown }[]
    tokens?: { path: string; applied: boolean }[]
    visible?: boolean
    enabled?: boolean
    text?: string
    notes?: string
  }
}
```

La correspondencia de tipos de la estructura en tres partes given / when / then. El valor `blur` de `when.action` es un valor reservado que actualmente ningún caso utiliza. La semántica de los campos se describe en [Formato de los casos](../cases/case-format).

## La entrada y los artefactos de codegen

### `CodegenInput`

```ts
interface CodegenInput {
  tokens: TokenSet
  specs: ComponentSpec[]
  cases: ComponentCases[]
  version: string          // el número de versión de package.json, escrito en el comentario de cabecera de cada artefacto
}
```

Lo ensambla `main()` y se lo pasa al `generate()` de cada target. Por ahora, los targets solo consumen `input.tokens`; `specs` / `cases` son interfaces reservadas para la futura generación de documentación de componentes, esqueletos de tipos y pruebas.

### `CodegenTarget`

```ts
interface CodegenTarget {
  name: string             // prefijo del registro, por ejemplo 'android'
  outDir: string           // nombre del subdirectorio bajo dist
  generate(input: CodegenInput): GeneratedFile[]
}
```

Cada target de plataforma implementa esta interfaz. Añadir una plataforma = añadir un target e incorporarlo al array `targets` de `index.ts`.

### `GeneratedFile`

```ts
interface GeneratedFile {
  relativePath: string     // la ruta de salida relativa a dist/<outDir>/
  content: string
}
```

## Módulos relacionados

| Módulo | Responsabilidad |
| --- | --- |
| [Visión general del pipeline](./pipeline) | La orquestación de `index.ts` y una visión rápida de las interfaces principales |
| [Capa de carga load.ts](./load) | Produce `RawToken` / `ComponentSpec` / `ComponentCases` |
| [Capa de resolución resolve.ts](./resolve) | Produce el `TokenSet` (`ResolvedToken` + `DarkOverrides`) |
| [Las cinco plataformas objetivo](./targets) | Consumen el `CodegenInput` y producen los `GeneratedFile` |
