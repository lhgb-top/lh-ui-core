---
title: "Artefactos de docs"
---

**Ruta**: `dist/docs/`

Este es el quinto target de codegen (`docsTarget`) y también el **único que no usa plantillas handlebars** — el contenido se ensambla directamente con código.

## Los tres artefactos

### `tokens.md` — tabla de referencia rápida de tokens

Dividido en secciones `##` por **espacio de nombres de nivel superior** (button / cell / checkbox / color / dialog / icon / input / loading / motion / navbar / picker / radio / radius / shadow / spacing / switch / tag / textarea / toast / typography / zIndex), con una tabla de cinco columnas por sección:

```markdown
## button

| Token | Tipo | Claro | Oscuro | Descripción |
| --- | --- | --- | --- | --- |
| `button.borderRadius` | dimension | 2px | — | El radio de esquina del botón sigue el radio global |
| `button.height.medium` | dimension | 40px | — | Nativo añadido; altura del botón mediano (por defecto) |
| `color.primary.default` | color | #2B4C7C → #2b4c7c | #3D649E → #3d649e | Color principal (añil — el azul del 青花瓷 (porcelana azul y blanco)) |
```

Características:

- La columna del token es la **ruta completa con puntos**
- La columna de color muestra los dos valores «valor original → minúsculas normalizadas»
- Los elementos con `nativeOnly` se anotan en la columna de descripción como «nativo añadido»
- La columna del modo oscuro se rellena con `—` cuando no hay sobrescritura (actualmente el modo oscuro solo cubre `color.*`)

### `tokens.light.json` — instantánea del conjunto claro

```json
{
  "button.borderRadius": "2px",
  "button.fontWeight": 400,
  "button.height.medium": "40px",
  "color.primary.default": "#2B4C7C"
}
```

Un mapeo plano de `{ path -> valor cocido }`, para consumo automático.

### `tokens.dark.json` — tabla de sobrescrituras del modo oscuro

```json
{
  "color.focus": "#7FA6D9",
  "color.selected": "#B1C1D8",
  …
}
```

Solo contiene **las claves sobrescritas** (todas son `color.*`; el número exacto varía con la versión), ordenadas por path.

## Consumidores

| Consumidor | Qué utiliza |
| --- | --- |
| **Este sitio de documentación** | No consume `dist/docs/` directamente — la página de [Referencia de tokens](../tokens/reference) se renderiza en tiempo real desde páginas `.astro` que recorren **la misma** cadena `loadTokenFiles` + `resolveTokens`, siempre sincronizada con las fuentes |
| El sitio de documentación de la familia | Incrusta `tokens.md` como tabla de referencia rápida de tokens |
| La alineación entre plataformas | `tokens.light.json` / `tokens.dark.json` para comparaciones en tiempo de compilación |
| El filtrado del documento de línea base | La marca `nativeOnly` sirve para elaborar la lista de «tokens nativos añadidos» |

## Guarda de cabecera

Al principio de `tokens.md`:

```html
<!-- Este archivo está generado automáticamente por @lh-ui/core; por favor, no lo modifiques a mano. Fuente: tokens de @lh-ui/core -->
```

Análogo al banner de «no modificar a mano» de los artefactos de cada plataforma (línea roja 6).

## Diferencia con la página de referencia del sitio

| | `dist/docs/tokens.md` | La página de referencia de tokens del sitio |
| --- | --- | --- |
| Momento de generación | `pnpm codegen` | `pnpm docs:build` / `docs:dev` |
| Origen de los datos | El `tokenSet` en memoria de codegen | El frontmatter de las páginas `.astro` vuelve a ejecutar `loadTokenFiles` + `resolveTokens` |
| Forma | Tabla markdown estática | Tabla Astro interactiva (filtros, vista previa de los colores) |
| Ubicación | `dist/` (en gitignore, sin versionar) | Página del sitio (los artefactos de construcción en `docs/dist/`) |

Ambas recorren **la misma cadena de resolución**, de modo que los valores siempre coinciden; la diferencia está solo en la forma de presentarlos y en el punto de entrada de la construcción.
