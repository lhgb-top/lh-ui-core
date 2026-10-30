---
title: "Flujo para añadir un componente"
---

Para añadir un componente al linaje nativo, recorre en orden los cinco pasos.

## 1. Escribir el contrato del componente `specs/<name>.json`

Declarar props / enumerados / valores por defecto / eventos / slots / comportamientos / tokens consumidos.

```json
{
  "$schema": "./schema.json",
  "name": "stepper",
  "component": "LhStepper",
  "since": "0.1.0",
  "description": "Stepper: incrementa o decrementa un valor según un paso fijo dentro de un rango.",
  "props": [
    { "name": "value", "type": "number", "default": 0, "description": "Valor actual (controlado)" },
    { "name": "step", "type": "number", "default": 1, "description": "Tamaño del paso" },
    { "name": "disabled", "type": "boolean", "default":  false, "description": "Si está deshabilitado" }
  ],
  "events": [
    { "name": "onChange", "payload": [{ "name": "value", "type": "number", "description": "El valor tras el cambio" }], "description": "Se dispara cuando cambia el valor" }
  ],
  "behaviors": [
    "Cuando disabled es true: los botones de incremento/decremento no responden y no se dispara onChange"
  ],
  "tokenRefs": ["stepper.height", "stepper.buttonSize"]
}
```

Para las restricciones de los campos, véase [Formato de los contratos](../specs/spec-format).

## 2. Escribir los casos dorados `cases/<name>.json`

Escribir una aserción given/when/then por cada comportamiento que deba garantizarse en todas las plataformas:

```json
{
  "$schema": "./schema.json",
  "component": "stepper",
  "cases": [
    {
      "id": "disabled-blocks-change",
      "name": "El estado deshabilitado no dispara onChange",
      "given": { "props": { "disabled": true } },
      "when": { "action": "click", "target": "botón de incremento" },
      "then": {
        "events": [{ "name": "onChange", "assertion": "notEmitted" }],
        "enabled": false
      }
    }
  ]
}
```

Para el formato, véase [Formato de los casos](../cases/case-format).

## 3. Ejecutar la verificación

```bash
pnpm verify:specs
```

Verifica la coherencia entre los casos y el spec: si las claves de `given.props` del caso están todas entre los props del spec, si `then.events[].name` está entre los eventos del spec, etc.

## 4. Añadir los tokens de nivel de componente (si son necesarios)

Si el componente introduce **tokens de nivel de componente** nuevos (como `stepper.height`), añade las claves bajo el espacio de nombres del componente correspondiente en `tokens/components.json`:

```json
"stepper": {
  "height": { "value": "32px", "description": "Altura del stepper", "nativeOnly": true },
  "buttonSize": { "value": "24px", "description": "Tamaño de los botones de incremento/decremento" }
}
```

A continuación:

```bash
pnpm codegen      # regenerar dist/
pnpm verify:tokens
pnpm test -- -u   # actualizar la instantánea
```

Si el nuevo token es de **nivel de marca** (una cantidad global como la paleta o la escala de espaciado, y no una dimensión de componente), cámbialo en el `tokens/<category>.json` correspondiente y regístralo en la sección de «registro de cambios» del documento `docs/设计语言基线.md` de la familia.

## 5. Publicar la versión

```bash
pnpm changeset    # escribir un changeset
pnpm changeset:version
```

core publica primero la versión; a continuación, cada plataforma nativa actualiza la versión de dependencia de los tokens y traduce manualmente los casos a pruebas locales (JUnit / XCTest / pruebas de ohpm / pruebas unitarias de C) siguiendo `cases/stepper.json`.

## Lista de comprobación

- [ ] `specs/<name>.json` existe y `pnpm verify:specs` pasa
- [ ] `cases/<name>.json` existe y es coherente con el spec
- [ ] Los tokens nuevos se han añadido a `tokens/` y `pnpm verify:tokens` pasa
- [ ] `pnpm codegen` se completa y la instantánea de `pnpm test` se ha actualizado
- [ ] El changeset está escrito
- [ ] (Tokens de nivel de marca) El documento de línea base de la familia ha sido actualizado
