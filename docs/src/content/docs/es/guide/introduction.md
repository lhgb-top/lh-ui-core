---
title: "Introducción"
---

> lh-ui-core es el centro en tiempo de compilación del **linaje nativo** de la familia lh-ui.

## Qué es este repositorio

`@lh-ui/core` es la **fuente única** de los tokens de diseño, el lugar donde viven los contratos de componentes y los casos dorados, además de un conjunto de herramientas de codegen que genera los esqueletos de lenguaje para las cuatro plataformas nativas a partir de tokens neutrales.

**No es una dependencia en tiempo de ejecución.** Solo funciona en tiempo de compilación: toma los tokens JSON y los contratos de componentes independientes de la plataforma y genera artefactos para las cuatro plataformas nativas — Android (Kotlin) / iOS (Swift) / HarmonyOS (ArkTS) / C —, y cada biblioteca nativa escribe su propia implementación. **Cero JavaScript en tiempo de ejecución nativo.**

## Arquitectura de dos linajes

La familia tiene dos linajes independientes entre sí y que no deben vincularse:

```
familia lh-ui
├── linaje web: lh-ui-share (core TS + única fuente de estilos SCSS) → plus / vue2 / react / uniapp
└── linaje nativo: este repositorio (tokens JSON + especificaciones + codegen) → android / ios / harmony / windows
```

Este repositorio y `lh-ui-share` **no tienen ninguna dependencia de código**; cada uno forma un ciclo cerrado independiente y se publica por separado. La unidad de marca y de visuales se apoya en el mecanismo de alineación manual del documento `docs/设计语言基线.md` del repositorio de documentación de la familia, no en una sincronización automática.

## Contratos de tres capas

El contenido de este repositorio está formado por tres capas de contratos JSON, independientes entre sí pero mutuamente referenciadas:

| Capa | Ubicación | Pregunta que responde |
| --- | --- | --- |
| **Tokens** | `tokens/*.json` | «Cómo es la interfaz» — colores, espaciados, tamaños de fuente, radios de esquina, sombras, movimiento, jerarquía, dimensiones de nivel de componente |
| **Contratos** | `specs/*.json` | «De qué capacidades dispone un componente» — props / enumerados / valores por defecto / eventos / slots / comportamientos |
| **Casos** | `cases/*.json` | «Cómo se debe probar un componente» — aserciones de comportamiento given/when/then traducibles entre plataformas |

codegen solo consume los **tokens** para generar los esqueletos de las cuatro plataformas; los **contratos** y los **casos** se consumen actualmente de forma manual en cada plataforma nativa (en el futuro podrían ampliarse para generar esqueletos de tipos y plantillas de prueba).

## Semilla de tokens

Los valores iniciales de `tokens/*.json` de este repositorio son una semilla de alineación extraída una sola vez, manualmente, de `lh-ui-share/styles/theme/common/variables.scss` y `var-dark.scss` (2026-10-10; véase el `docs/设计语言基线.md` de la familia). A partir de entonces, cada repositorio evoluciona por su cuenta y **no se vuelven a sincronizar**. Los cambios en tokens de nivel de marca (paleta, escala de espaciado) deben registrarse en ese documento de línea base.

## Quién debería leer esta documentación

- **Desarrolladores nativos** (android / ios / harmony / windows): para conocer las convenciones de nomenclatura, la conversión de unidades y el mecanismo del modo oscuro de los artefactos de `dist/`, y saber de dónde vienen los tokens y cómo se calculan sus valores.
- **Mantenedores de este repositorio**: para conocer las responsabilidades y funciones de cada módulo del pipeline de codegen y poder modificar plantillas, añadir tokens y añadir componentes.

## Próximos pasos

- [Inicio rápido](./quickstart) — clonar, instalar y ejecutar codegen una vez
- [Estructura de directorios](./structure) — las responsabilidades de cada directorio
- [Formato de tokens](../tokens/token-format) — las restricciones de campos del JSON de tokens
- [Visión general del pipeline](../codegen/pipeline) — el flujo de datos completo de codegen
