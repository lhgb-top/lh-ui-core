---
title: "Lista de comandos"
---

## Construcción

| Comando | Función |
| --- | --- |
| `pnpm codegen` | Ejecuta una generación y escribe en `dist/` (borra y reconstruye) |
| `pnpm build` | `pnpm codegen && pnpm verify` |

## Verificación

| Comando | Función |
| --- | --- |
| `pnpm verify:tokens` | Verificación de tokens: esquema + integridad de referencias + **contraste crítico texto/fondo ≥ 4.5:1 (WCAG AA; solo se comprueban las parejas declaradas, con exención del estado deshabilitado)** + **inspección de sintaxis específica de plataforma (intercepta `var()` / `rem` / `sp` / `dp`, etc.)** + informe de rutas huérfanas del modo oscuro |
| `pnpm verify:specs` | Verificación de coherencia entre specs y cases |
| `pnpm verify` | La combinación de los dos anteriores |

## Pruebas y análisis estático

| Comando | Función |
| --- | --- |
| `pnpm test` | Pruebas de instantáneas (vitest run) |
| `pnpm test:watch` | Pruebas de instantáneas en modo vigilancia |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | eslint |
| `pnpm lint:fix` | eslint --fix |
| `pnpm format` | formateo con prettier para json/md/yml |

## Sitio de documentación

| Comando | Función |
| --- | --- |
| `pnpm docs:dev` | Vista previa local en `http://localhost:5185/lhui/core/` (el base coincide con el de producción) |
| `pnpm docs:build` | Construcción de producción (base `/lhui/core/`) |
| `pnpm docs:preview` | Vista previa de la construcción de producción |

## Publicación de versiones

| Comando | Función |
| --- | --- |
| `pnpm changeset` | Escribe un changeset |
| `pnpm changeset:status` | Consulta el estado de los changesets |
| `pnpm changeset:version` | Actualiza el número de versión según los changesets |

## Actualización de instantáneas

Tras cambiar tokens o plantillas, la instantánea fallará inevitablemente; una vez confirmado que el resultado es correcto:

```bash
pnpm test -- -u
```

## Lista de scripts

Los scripts de `scripts/` (no expuestos como npm scripts):

| Script | Función |
| --- | --- |
| `scripts/verify-tokens.mts` | La verdadera lógica de verificación de tokens |
| `scripts/verify-specs.mts` | La verdadera lógica de verificación de especificaciones |
| `scripts/resolve-local-tokens.mjs` | Guarda del enlace local |

La publicación de versiones se hace con changesets (véase «Publicación de versiones» más arriba); no hay scripts de publicación adicionales.
