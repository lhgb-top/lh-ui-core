---
title: "Formato de los contratos"
---

Cada `specs/<name>.json` es el **contrato multiplataforma** de un componente. El formato está fuertemente restringido por `specs/schema.json`.

## Estructura de nivel superior

```json
{
  "$schema": "./schema.json",
  "name": "button",
  "component": "LhButton",
  "since": "0.1.0",
  "description": "Botón: dispara una acción inmediata; admite tipo, tamaño, carga, deshabilitación, icono y fondo de patrón chino.",
  "props": [ ... ],
  "events": [ ... ],
  "slots": [ ... ],
  "behaviors": [ ... ],
  "tokenRefs": [ ... ]
}
```

| Campo | Obligatorio | Restricción |
| --- | --- | --- |
| `name` | Sí | kebab-case: `^[a-z][a-z0-9-]*$`, coincide con el nombre del archivo |
| `component` | Sí | PascalCase con prefijo Lh: `^Lh[A-Z][a-zA-Z0-9]*$` |
| `description` | Sí | Descripción en chino |
| `props` | Sí | Matriz, con al menos un elemento (forzado por el esquema mediante `minItems: 1`) |
| `since` | No | Versión en la que se introdujo |
| `events` / `slots` / `behaviors` / `tokenRefs` | No | Véase más adelante |

`additionalProperties: false` — no se permiten campos adicionales.

## props

```json
{ "name": "size", "type": "enum", "values": ["small", "medium", "large"], "default": "medium", "description": "Tamaño del botón" }
```

| Campo | Obligatorio | Descripción |
| --- | --- | --- |
| `name` | Sí | camelCase: `^[a-z][a-zA-Z0-9]*$`, **unificado en las cinco plataformas** |
| `type` | Sí | Véase la tabla siguiente |
| `description` | Sí | Descripción en chino |
| `values` | No | Los valores del enumerado cuando `type: enum` (matriz de cadenas literales) |
| `items` | **Obligatorio** si `type: array` | El tipo de los elementos de la matriz (`string` / `number` / `boolean`) + descripción |
| `default` | No | Valor por defecto (cualquier tipo JSON); si se omite, es que no tiene valor por defecto |
| `required` | No | Booleano, por defecto `false` |

**Los siete tipos de prop**:

| Tipo | Significado | Correspondencia en cada plataforma |
| --- | --- | --- |
| `string` | Cadena | `String` / `String` / `string` / `const char*` |
| `number` | Valor numérico | `Int` / `Double` / `number` / `int` |
| `boolean` | Booleano | `Boolean` / `Bool` / `boolean` / `bool` |
| `enum` | Enumerado (debe dar `values`) | Cada plataforma genera el tipo enumerado correspondiente |
| `tokenRef` | Ruta de puntos de un token | Referencia a un token; verify comprueba la existencia de la ruta (**reservado, actualmente ningún componente lo usa**) |
| `node` | Contenido del slot / nodos hijos | El content de Compose, el ViewBuilder de SwiftUI, el Builder de ArkUI, el manejador de nodos hijos de C (**reservado, actualmente ningún componente lo usa**) |
| `array` | Matriz (debe dar `items`) | Opciones del selector, etc. |

## events

```json
{
  "name": "onValueChange",
  "payload": [{ "name": "value", "type": "string", "description": "El texto tras el cambio" }],
  "description": "Se dispara cuando cambia el texto; no se dispara si disabled o readonly es true"
}
```

- `name`: `^on[A-Z][a-zA-Z0-9]*$`, **unificado en las cinco plataformas**
- `payload`: matriz de campos (cada uno con `name` + `type` + `description` opcional); **una matriz vacía indica que no hay carga útil**
- `description`: obligatorio

## slots

```json
{ "name": "prefix", "description": "Contenido del prefijo del campo de entrada (la zona no editable de la izquierda)" }
```

`name` también es camelCase. La **implementación por plataforma** del slot la aporta una prop de tipo `node` o el mecanismo de slots de cada plataforma.

## behaviors

Una matriz de descripciones de comportamiento en lenguaje natural, que sirve para que los cases extraigan información y para generar documentación:

```json
"behaviors": [
  "Cuando disabled es true: no responde a los clics, muestra el estilo deshabilitado (tokens disabled.*) y no dispara onClick",
  "Correspondencia de size: small/medium/large toman respectivamente los tokens de dimensión button.height.<size>, etc."
]
```

## tokenRefs

La lista de **rutas completas** de los tokens que consume este componente, que `pnpm verify:specs` comprueba para garantizar la integridad de las referencias:

```json
"tokenRefs": ["button.height.medium", "color.primary.default", "color.onPrimary"]
```

## Por qué una nomenclatura tan estricta

Todas las expresiones regulares de nomenclatura sirven para **alinear las plataformas**: `name` determina el nombre del archivo y de las pruebas en cada plataforma, `component` es la base del nombre de las clases en cada una, y los nombres de las props y de los eventos se mantienen idénticos en las cinco plataformas para que los cases puedan traducirse a partir de ellos.

## Lista actual de componentes

15 componentes: button, cell, checkbox, dialog, icon, input, loading, navbar, picker, radio, switch, tag, text, textarea, toast. Todos los contratos están en la [Referencia de contratos de componentes](./reference).
