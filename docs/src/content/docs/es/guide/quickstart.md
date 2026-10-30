---
title: "Inicio rápido"
---

## Requisitos del entorno

- Node.js `>= 22.12` (el sitio de documentación usa Astro 7, requisito estricto)
- pnpm `10.x` (el repositorio está fijado a `pnpm@10.34.5`)

## Instalación

```bash
pnpm install
```

Este repositorio tiene **cero dependencias en tiempo de ejecución** (`dependencies` está vacío); todo lo que se instala es la cadena de herramientas de compilación (tsx, ajv, handlebars, vitest, astro, etc.).

## Ejecutar codegen una vez

```bash
pnpm codegen
```

Este comando ejecuta `tsx codegen/src/index.ts`. El flujo completo es:

1. Leer la versión de `package.json`
2. Cargar y validar `tokens/*.json` (validación estructural con Ajv)
3. Resolver referencias y fusionar el modo oscuro (validación semántica: coincidencia de tipos, integridad de referencias, detección de ciclos)
4. Cargar y validar `specs/*.json` y `cases/*.json`
5. **Borrar todo `dist/` y reconstruirlo**
6. Ejecutar secuencialmente los 5 targets (android → ios → harmony → c → docs)

La salida está en `dist/`:

```
  [android] android/top/lhgb/ui/tokens/LhTokens.kt
  [android] android/top/lhgb/ui/tokens/LhDarkTokens.kt
  ...
codegen completado: 5 targets, N archivos, versión v0.0.1
```

El número de archivos varía con el contenido de los tokens (cuando existen tokens de sombra, ios / harmony generan cada uno un archivo portador de sombra adicional); el resultado real es el que cuenta.

## Verificación

```bash
pnpm verify          # = pnpm verify:tokens && pnpm verify:specs
```

- `verify:tokens`: esquema de tokens + integridad de referencias + **contraste crítico texto/fondo ≥ 4.5:1 (WCAG AA)** + **inspección de sintaxis específica de plataforma (`var()` / `rem` / `sp` / `dp`)**, e informa de **rutas huérfanas del modo oscuro** (claves declaradas en el archivo oscuro pero inexistentes en el conjunto claro) y de las claves oscuras a las que les falta el tipo.
- `verify:specs`: coherencia entre specs y cases (por ejemplo, si los props / eventos a los que hacen referencia los casos existen en el spec).

## Pruebas

```bash
pnpm test
```

Las pruebas de instantáneas reflejan todos los artefactos de `dist/`. Tras cambiar tokens o plantillas, la instantánea fallará; una vez confirmado que es correcto, actualízala con `pnpm test -- -u`.

## Sitio de documentación

```bash
pnpm docs:dev        # vista previa local http://localhost:5185/lhui/core/
pnpm docs:build      # construcción de producción (base /lhui/core/)
pnpm docs:preview    # vista previa de la construcción de producción
```

Las tres páginas de referencia del sitio de documentación (tokens / contratos / casos) leen directamente las fuentes `tokens/`, `specs/` y `cases/` durante la compilación; **no es necesario ejecutar codegen antes**.

## Combinaciones habituales

| Escenario | Comando |
| --- | --- |
| Cambié tokens y quiero los artefactos | `pnpm codegen` |
| Cambié tokens y quiero artefactos + verificación | `pnpm build` (= codegen + verify) |
| Cambié plantillas y quiero artefactos + instantánea | `pnpm codegen && pnpm test -- -u` |
| Solo quiero ver la tabla de referencia de tokens | ejecutar `pnpm codegen` y consultar `dist/docs/tokens.md` |

## Dónde se consumen los artefactos

Cada plataforma nativa consume los artefactos de su plataforma bajo `dist/`:

- Android: archivos Kotlin bajo `dist/android/`
- iOS: archivos Swift bajo `dist/ios/`
- HarmonyOS: archivos ArkTS bajo `dist/harmony/`
- Windows: archivos C# bajo `dist/windows/`

El mecanismo de enlace local (cambiar un token con efecto inmediato, sin publicar una versión) se explica en [Enlace local](./local-linking).
