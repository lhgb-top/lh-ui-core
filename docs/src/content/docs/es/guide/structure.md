---
title: "Estructura de directorios"
---

```
lh-ui-core/
├── tokens/       fuente única de tokens de diseño (fuentes JSON neutrales, incluido el esquema)
├── specs/        contratos de componentes (props / enumerados / valores por defecto / eventos / slots / comportamientos)
├── cases/        casos dorados (aserciones de comportamiento traducibles entre plataformas)
├── codegen/      herramientas de codegen (TS/Node): src/ + templates/
├── dist/         artefactos de codegen (generados en la compilación, prohibido modificarlos a mano)
├── scripts/      scripts de verificación y publicación
├── tests/        pruebas de instantáneas y metapruebas de tokens
└── docs/         código fuente del sitio de documentación para desarrolladores (Astro Starlight, este sitio)
```

## Responsabilidades de cada directorio

### `tokens/` — fuente única de tokens

Fuentes JSON neutrales independientes de la plataforma, con el formato fuertemente restringido por `tokens/schema.json`. En total 9 archivos de datos:

| Archivo | Espacio de nombres | Contenido |
| --- | --- | --- |
| `color.json` | `color` | Paleta: los colores semánticos se organizan en default/hover/active/bg/border |
| `color-dark.json` | `color` (igual que el archivo claro) | Sobrescrituras incrementales del modo oscuro (solo declara las claves que difieren del claro) |
| `components.json` | `""` (cadena vacía) | Tokens de nivel de componente: `button.*`, `input.*`, etc. |
| `typography.json` | `typography` | Familias tipográficas / tamaños de fuente / grosor de fuente / altura de línea |
| `spacing.json` | `spacing` | Escala de espaciados xs–xxl |
| `radius.json` | `radius` | Radios de esquina |
| `shadow.json` | `shadow` | Sombras |
| `motion.json` | `motion` | Duraciones y curvas de interpolación (Bézier) |
| `z-index.json` | `zIndex` | Jerarquía de capas |

El número exacto de hojas de cada archivo cambia con la versión; la página [Referencia de tokens](../tokens/reference) es la autoridad — fijar un número en el texto siempre acaba estando desactualizado.

Para más detalles, véanse [Formato de tokens](../tokens/token-format) y [Espacios de nombres y rutas con puntos](../tokens/namespace).

### `specs/` — contratos de componentes

Un JSON por componente: nombres de props / tipos / enumerados / valores por defecto / eventos / slots / descripciones de comportamiento / lista de tokens consumidos. El formato está fuertemente restringido por `specs/schema.json`. Para más detalles, véase [Formato de los contratos](../specs/spec-format).

### `cases/` — casos dorados

Un JSON por componente: aserciones de comportamiento traducibles entre plataformas (given/when/then) que los repositorios de pruebas de cada plataforma traducen manualmente a pruebas locales. El formato está fuertemente restringido por `cases/schema.json`. Para más detalles, véase [Formato de los casos](../cases/case-format).

### `codegen/` — herramientas de generación

```
codegen/
├── src/
│   ├── index.ts      entrada de orquestación del CLI (el verdadero responsable de pnpm codegen)
│   ├── types.ts      todas las definiciones de tipos (no entra en los artefactos en tiempo de ejecución)
│   ├── load.ts       carga de JSON + validación de esquema con Ajv + aplanado
│   ├── resolve.ts    resolución de refs + fusión del modo oscuro
│   ├── format.ts     análisis de valores neutrales / formateo por plataforma
│   ├── tree.ts       rutas planas → árbol anidado
│   ├── render.ts     envoltura de Handlebars
│   └── targets/      los cinco targets: android / ios / harmony / windows / docs
└── templates/        plantillas handlebars de cada plataforma (7 archivos .hbs)
```

Para más detalles, véase [Visión general del pipeline](../codegen/pipeline).

### `dist/` — artefactos generados

**Prohibido modificarlos a mano** (está dentro de `.gitignore`). Disposición:

```
dist/
├── android/top/lhgb/ui/tokens/   LhTokens.kt, LhDarkTokens.kt
├── ios/Sources/LhUITokens/       LhTokens.swift, LhDarkTokens.swift, LhShadow.swift
├── harmony/tokens/               LhTokens.ets, LhDarkTokens.ets, LhShadow.ets
├── c/include/lh_ui/              lh_tokens.h, lh_dark_tokens.h
└── docs/                         tokens.md, tokens.light.json, tokens.dark.json
```

Para más detalles, véanse los [Artefactos](../artifacts/android).

### `scripts/` — scripts de verificación y publicación

`verify-tokens.mts` (verificación de tokens: esquema + integridad de referencias + informe de rutas huérfanas del modo oscuro), `verify-specs.mts` (coherencia entre specs y cases) y `resolve-local-tokens.mjs` (guarda del enlace local). La publicación se hace con changesets (véase la [Lista de comandos](./commands)).

### `tests/` — pruebas de instantáneas

`codegen-snapshot.spec.ts` refleja todos los artefactos de `dist/` (los archivos de instantáneas se versionan) y `tokens.spec.ts` hace metapruebas de tokens.

### `docs/` — este sitio

Código fuente del sitio Astro Starlight (la configuración en `docs/astro.config.mjs`, el contenido en `docs/src/content/docs/`). Las tres páginas de referencia (tokens / contratos / casos) son páginas `.astro` bajo `docs/src/pages/` que, durante la compilación, invocan directamente las funciones de carga y resolución de codegen para renderizar desde las fuentes JSON, sin necesidad de mantener las tablas a mano. Para el despliegue, véanse las [Notas de despliegue](../deployment).
