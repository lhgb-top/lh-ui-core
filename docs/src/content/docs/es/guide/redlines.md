---
title: "Líneas rojas y convenciones de nombres"
---

## Las seis líneas rojas

### 1. Solo esqueletos, nunca implementaciones

codegen solo produce **enlaces de tokens**, enumerados de props y tipos, y constantes de valores por defecto. **Está prohibido generar cualquier implementación de UI** — ni cuerpos de Composable, ni cuerpos de SwiftUI View, ni cuerpos de componentes ArkUI, ni cuerpos de funciones de componentes en C. Toda la implementación de UI se escribe a mano en cada repositorio nativo.

Esta línea roja está escrita en el comentario de cabecera de `codegen/src/index.ts`; es la autodeclaración de la cadena de herramientas.

### 2. La fuente única de tokens es `tokens/*.json`

Ninguna plataforma ni ningún componente puede establecer valores de token al margen de este repositorio. Los repositorios nativos solo pueden consumir los artefactos de `dist/` o el paquete ya publicado de su plataforma; **está prohibido escribir a mano colores, espaciados o tamaños de fuente**.

### 3. Cero JS en tiempo de ejecución

El código TS de este repositorio solo existe en la cadena de herramientas de compilación; **en los artefactos no puede aparecer nada de JavaScript**.

### 4. No se puede depender de `lh-ui-share`

Los dos linajes son independientes y no pueden importar nada el uno del otro. Los valores iniciales de los tokens son una semilla trasladada manualmente una sola vez; no se establece ninguna dependencia automática.

### 5. El JSON no puede contener sintaxis específica de plataforma

Los valores de los tokens solo admiten expresiones neutrales: colores hexadecimales, `rgba()`, valores numéricos puros bajo el tipo `number`, y **cadenas con unidades** de `dimension` / `duration` / `shadow` (`"12px"` / `"50%"` / `"200ms"`, forzado por `assertTypedValue`; véase [Formato de tokens](../tokens/token-format) para más detalles). Están prohibidas `var()`, `rem`, `sp`, `dp` o cualquier otra unidad o referencia específica de plataforma. **La conversión de unidades de plataforma la realizan las plantillas de cada target** (por ejemplo, la decisión dp/sp de Android o la conversión a segundos de iOS).

### 6. `dist/` está prohibido modificarlo a mano

Cualquier cambio se hace en `tokens/` / `specs/` / `cases/` o en las plantillas, y luego se vuelve a ejecutar `pnpm codegen`. `dist/` está dentro de `.gitignore`; cada ejecución de codegen lo borra y lo reconstruye.

## Convenciones de nombres (plan maestro D20)

### Nombres de paquete / identificadores de plataforma

Los nombres de paquete de plataforma son siempre el dominio inverso `top.lhgb.ui`:

| Plataforma | Nombre de paquete / identificador |
| --- | --- |
| Android | `package top.lhgb.ui.tokens`, directorio de artefactos `dist/android/top/lhgb/ui/tokens/` |
| iOS | `Sources/LhUITokens/` (convención de directorios de SwiftPM) |
| HarmonyOS | `tokens/` (dentro del módulo ohpm) |
| C | `include/lh_ui/` |

### Prefijo de constantes / clases / enumerados propios

Siempre el **prefijo LH**, con las mayúsculas según la convención de cada lenguaje:

| Lenguaje | Convención | Ejemplo |
| --- | --- | --- |
| Kotlin | `Lh*` (PascalCase) | `object LhTokens`, `object LhDarkTokens` |
| Swift | `Lh*` (PascalCase) | `public enum LhTokens`, `struct LhShadow` |
| ArkTS | `Lh*` (PascalCase) | `export class LhTokens`, `interface LhShadow` |
| C | `LH_*` (mayúsculas con guion bajo) | `LH_COLOR_PRIMARY_DEFAULT`, `LH_Z_INDEX_MODAL` |

El scope `@lh-ui/*` de npm / ohpm no está sujeto a esta restricción (npm no usa dominios inversos).

### Regla de nomenclatura de macros en C

`zIndex.modal` → `LH_Z_INDEX_MODAL`: primero se convierten los `.` en guiones bajos, luego se añade un guion bajo delante de cada letra mayúscula y, por último, se pasa todo a mayúsculas. Para más detalles, véanse los [Artefactos de C](../artifacts/c).

## Restricciones de nomenclatura JSON

Los esquemas de cada capa restringen fuertemente la nomenclatura con expresiones regulares:

| Capa | Campo | Regla |
| --- | --- | --- |
| spec | `name` | kebab-case: `^[a-z][a-z0-9-]*$` |
| spec | `component` | PascalCase con prefijo Lh: `^Lh[A-Z][a-zA-Z0-9]*$` |
| spec | nombre de prop | camelCase: `^[a-z][a-zA-Z0-9]*$` |
| spec | nombre de event | `^on[A-Z][a-zA-Z0-9]*$` |
| case | `id` | kebab-case |
| case | `component` | debe coincidir con el `name` del spec del mismo nombre |

## Idioma de los comentarios y la documentación

Los comentarios, la documentación y los mensajes de commit son siempre en **chino** (requisito del plan maestro de la familia).
