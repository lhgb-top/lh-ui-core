---
title: "Enlace local"
---

## El problema

Durante el desarrollo nativo, cada cambio de token obligaba a esperar a que se publicara una versión de core y luego a actualizar la dependencia; el ciclo de retroalimentación era demasiado largo.

## El mecanismo

Con el diseño de familia (todos los repositorios bajo el mismo directorio padre), el desarrollo local de los repositorios nativos lee directamente los artefactos de `dist/` de este repositorio mediante una **resolución local con guardas de existencia**: tras cambiar un token, basta con volver a ejecutar `pnpm codegen` en este repositorio para que el cambio surta efecto de inmediato, **sin necesidad de publicar un paquete**. Si este repositorio no existe (por ejemplo, al clonar un único repositorio en CI), se recurre automáticamente al paquete ya publicado de cada plataforma.

El mecanismo de guarda es isomorfo al `createLocalShareAliases` del linaje web: se comprueba `existsSync(<coreRoot>/dist/android)` (solo si el artefacto de android existe se considera que ya se ha ejecutado codegen en este repositorio); si no existe, no se inyecta la ruta local.

## Cómo se inyecta en cada plataforma

Cada repositorio nativo lo implementa por su cuenta; este repositorio no lo impone:

| Plataforma | Forma de inyección |
| --- | --- |
| Android | Directorio de repositorio maven local en Gradle |
| iOS | Dependencia local por path en SPM |
| HarmonyOS | Dependencia `file:` de ohpm |
| C | `add_subdirectory` de CMake o ruta de cabeceras |

## Flujo de trabajo típico

```
1. Cambiar tokens/*.json en este repositorio
2. pnpm codegen          → dist/ se actualiza al instante
3. Construir/ejecutar directamente en el repositorio nativo  → los nuevos tokens ya están activos
```

`scripts/resolve-local-tokens.mjs` es el script que implementa este mecanismo de guarda.

## A tener en cuenta

- El enlace local solo está disponible con el **diseño de familia** (todos los repositorios bajo el mismo directorio padre).
- El enlace lee de `dist/`, de modo que tras cambiar los tokens **es imprescindible ejecutar codegen antes**.
- Tras cada publicación de versión, las plataformas nativas deberían volver a la versión de dependencia oficial, para no depender a largo plazo de rutas locales.
