---
title: "Formato de los casos"
---

Cada `cases/<name>.json` es el conjunto de **casos dorados** de un componente: aserciones de comportamiento traducibles entre plataformas. El formato está fuertemente restringido por `cases/schema.json`.

## Filosofía de diseño

> La lógica no se comparte, el comportamiento sí.

Las plataformas nativas **no comparten ningún código de pruebas**; cada una traduce manualmente los mismos cases a pruebas locales (JUnit / XCTest / pruebas de ohpm / pruebas unitarias de C). Los casos solo describen **comportamiento** (qué condiciones se dan, qué acción se realiza, qué resultado se espera), sin ninguna API específica de plataforma.

## Estructura de nivel superior

```json
{
  "$schema": "./schema.json",
  "component": "button",
  "cases": [ ... ]
}
```

- `component`: kebab-case, **debe coincidir con el `name` del spec del mismo nombre**
- `cases`: al menos un caso

## Estructura en tres partes

Cada caso debe declarar obligatoriamente `id` / `name` / `given` / `when` / `then`:

```json
{
  "id": "disabled-blocks-click",
  "name": "El estado deshabilitado no dispara onClick",
  "given": { "props": { "disabled": true } },
  "when": { "action": "click" },
  "then": {
    "events": [{ "name": "onClick", "assertion": "notEmitted" }],
    "enabled": false
  }
}
```

### given (precondiciones)

| Campo | Descripción |
| --- | --- |
| `props` | Las props iniciales; **las claves deben existir entre los props del spec del mismo nombre** |
| `state` | El estado inicial del componente, de **claves libres**, para escenarios específicos de una plataforma (por ejemplo `{ "text": "Botón" }`) |

### when (acción)

| Campo | Descripción |
| --- | --- |
| `action` | **Obligatoria**, uno de los seis valores (véase más adelante) |
| `target` | El objetivo de la acción (por ejemplo, el nombre de un slot o de un subcomponente) |
| `payload` | La carga útil de la acción (por ejemplo, el texto de un input) |

**Las seis acciones**: `render` (renderizar) / `click` (clic) / `input` (entrada) / `focus` (obtener el foco) / `blur` (perder el foco, **reservada, actualmente ningún componente la usa**) / `custom` (personalizada, **debe explicar `target`**).

### then (aserciones)

| Campo | Descripción |
| --- | --- |
| `events` | Matriz de aserciones sobre eventos |
| `tokens` | Matriz de aserciones sobre la aplicación de tokens |
| `visible` | Si se espera que sea visible |
| `enabled` | Si se espera que sea interaccionable |
| `text` | El texto que se espera que se renderice |
| `notes` | Descripciones de aserciones complementarias independientes de la plataforma (lenguaje natural) |

**Aserciones sobre eventos**:

```json
{
  "name": "onValueChange",
  "assertion": "emitted",
  "times": 1,
  "payload": { "value": "青花瓷" }
}
```

- `name`: **debe existir entre los eventos del spec del mismo nombre**
- `assertion`: `emitted` (se dispara) o `notEmitted` (no se dispara)
- `times`: opcional, el número esperado de disparos
- `payload`: opcional, la carga útil esperada (**comparación profunda**)

**Aserciones sobre tokens**:

```json
{ "path": "button.height.large", "applied": false }
```

`path` es la ruta completa del token, y `applied` afirma si el token **está o no** aplicado al resultado del renderizado. La **aserción inversa** con `applied: false` sirve para la regresión de la exclusión mutua de dimensiones (por ejemplo, si se eligió la talla small, `button.height.large` no debería consumirse).

## Ejemplo completo

```json
{
  "id": "small-size-uses-small-tokens",
  "name": "La talla pequeña consume los tokens de dimensión small",
  "given": { "props": { "size": "small" } },
  "when": { "action": "render" },
  "then": {
    "tokens": [
      { "path": "button.height.small",   "applied": true },
      { "path": "button.fontSize.small", "applied": true },
      { "path": "button.height.large",   "applied": false }
    ]
  }
}
```

```json
{
  "id": "clearable-emits-empty-value",
  "name": "El botón de borrado dispara un valor vacío",
  "given": { "props": { "value": "Ya existe contenido", "clearable": true } },
  "when": { "action": "custom", "payload": { "call": "clear" } },
  "then": {
    "events": [{ "name": "onValueChange", "assertion": "emitted", "times": 1, "payload": { "value": "" } }]
  }
}
```

## Relación con el spec

`pnpm verify:specs` comprueba:

- Si las claves de `given.props` están todas entre los props del spec
- Si `then.events[].name` está entre los eventos del spec

Por eso, **al cambiar los nombres de props / eventos del spec hay que cambiar también los cases al unísono**.

## Lista actual de componentes

15 componentes; el número total de casos varía con la versión. Todos los casos están en la [Referencia de casos dorados](./reference).
