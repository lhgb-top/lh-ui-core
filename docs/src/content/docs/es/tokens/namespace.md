---
title: "Espacios de nombres y rutas con puntos"
---

## La regla

**La ruta global con puntos de un token = `$namespace` + la ruta anidada dentro del archivo.**

```
tokens/color.json        "$namespace": "color"
                         primary.default.value = "#2B4C7C"
                         → ruta completa color.primary.default

tokens/z-index.json      "$namespace": "zIndex"
                         modal.value = 1050
                         → ruta completa zIndex.modal
```

Todas las referencias entre archivos (`ref`, `tokenRefs` de un spec, `then.tokens` de un case) **deben escribirse como ruta completa**.

## Los tres casos de espacio de nombres

### 1. Por defecto: deducido del nombre del archivo

Cuando no se declara `$namespace`, se deduce del nombre del archivo partiendo por `-` (`namespaceFromFileName`): el primer segmento se deja tal cual y el resto se pone en mayúscula inicial.

| Nombre del archivo | Resultado de la deducción |
| --- | --- |
| `color.json` | `color` |
| `z-index.json` | `zIndex` |
| `typography.json` | `typography` |
| `color-dark.json` | `colorDark` (**valor deducido, pero no se usa en la práctica**) |

La deducción es solo un **respaldo** — los archivos oscuros siempre declaran explícitamente el `$namespace` para alinearse con su archivo claro (véase más adelante).

### 2. Declaración explícita

`$namespace` se escribe directamente:

```json
{ "$namespace": "zIndex", "modal": { "value": 1050 } }
```

**El archivo oscuro debe declarar explícitamente el mismo `$namespace` que el archivo claro**, de lo contrario las claves sobrescritas no caerán en la misma ruta:

```json
// color-dark.json
{ "$namespace": "color", "$dark": true, "primary": { "default": { "value": "#3D649E" } } }
```

Así, la sobrescritura del modo oscuro de `color.primary.default` puede fusionarse correctamente sobre la misma ruta del archivo claro.

### 3. Cadena vacía: las claves de nivel superior son el espacio de nombres

`components.json` declara `"$namespace": ""`, de modo que **las claves de nivel superior son los espacios de nombres de los componentes** y las rutas completas son directamente `button.height.medium`, `input.borderRadius`:

```json
{
  "$namespace": "",
  "$type": "dimension",
  "button": {
    "height": { "medium": { "value": "40px" } }
  }
}
```

## Las implicaciones prácticas del espacio de nombres

- **`dist/docs/tokens.md`** divide el contenido en secciones `##` por espacio de nombres de nivel superior (button / color / motion / zIndex, etc.)
- **La fase de resolve** hace la detección de duplicados por ruta completa: dos archivos claros con una misma ruta provocan un error directo
- **La fusión del modo oscuro** empareja las claves sobrescritas por ruta completa
- **Cada target** construye la estructura anidada partiendo la ruta en segmentos (Android `object Color`, Swift `enum Color`, C `LH_COLOR_*`)

## Ejemplo completo

```
color.primary.active          ← color.json
button.height.medium          ← components.json (espacio de nombres vacío)
typography.fontSize.base      ← typography.json
zIndex.modal                  ← z-index.json (explícito)
motion.easing.easeInOut       ← motion.json (anidamiento de grupos)
```

En la página [Referencia de tokens](./reference) se puede navegar por todos los tokens organizados por espacio de nombres.
