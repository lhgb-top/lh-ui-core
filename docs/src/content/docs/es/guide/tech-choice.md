---
title: "Elección tecnológica del sitio de documentación"
---

Esta página recoge las conclusiones de una investigación, realizada el 2026-10-12, sobre los frameworks de documentación estática más populares, así como la decisión final sobre el framework del sitio de este repositorio.

## Registro de decisiones

| Fecha | Decisión | Razones |
| --- | --- | --- |
| 2026-10-12 (día de la investigación) | **Adoptar Astro Starlight y migrar desde VitePress** | Starlight tiene por defecto cero JS de cliente y es agnóstico respecto al framework, lo que encaja con la filosofía de «cero JS en tiempo de ejecución» de este repositorio; al reescribir las tres páginas de referencia basadas en datos como componentes puramente de Astro, se eliminaron por completo las tres dependencias vue / vitepress / vite; el umbral de Node ≥ 22.12 es aceptable |
| 2026-10-12 (día de la investigación, juicio previo) | Mantener VitePress | En aquel momento el beneficio de la migración no compensaba el coste: los siete sitios de la familia estaban todos sobre VitePress y el sitio de este repositorio ya estaba completamente terminado. **Esta conclusión quedó reemplazada por la decisión de migración del mismo día y se conserva más abajo como registro histórico** |

La migración en sí se completó de una sola vez (el esqueleto de Astro se construyó y todas las páginas se trasladaron en un único commit, para evitar estados intermedios no construibles). El resto de los sitios de la familia siguen usando VitePress; **este repositorio no exige una uniformidad familiar**. Si en el futuro la familia decide unificar el framework a nivel global, la práctica de Starlight de este repositorio servirá como referencia lista para usar.

## Conclusiones de la investigación (registro histórico, basado en los datos del 2026-10-12)

- **Si se empezara hoy desde cero y no existiera la restricción de coherencia familiar**, la mejor alternativa era **Astro Starlight** — rendimiento, agnosticismo de framework, cero JS de cliente por defecto; lo más cercano a la filosofía de «cero JS en tiempo de ejecución» de este repositorio. (Esta valoración fue finalmente la que motivó la decisión de migración anterior.)
- **VuePress está estancado de hecho; no se recomienda para ningún proyecto nuevo** (el último push del repositorio es del 2024-08-07 y v2 sigue siendo rc).
- Lo único que merecía observación a largo plazo antes de la migración era **VitePress 2.0** (por entonces la etiqueta `next` estaba en 2.0.0-alpha.20, fase alpha).

## Datos de actividad

> Fecha de recogida de datos: 2026-10-12. Los datos de GitHub provienen de api.github.com; las descargas de npm corresponden a la semana del 2026-10-04 al 2026-10-10; los números de versión, de los dist-tags de registry.npmjs.org. Las estrellas crecen con el tiempo; ten en cuenta la frescura de los datos al citarlos.

| Framework | Pila tecnológica | Estrellas en GitHub | Último push del repositorio | Descargas semanales en npm | Última versión estable |
| --- | --- | --- | --- | --- | --- |
| **VitePress** | Vue 3 + Vite | 18.4k | 2026-10-11 | 1,305,159 | 1.6.4 (next: 2.0.0-alpha.20) |
| **Docusaurus** | React + MDX | 66.5k | 2026-10-10 | 1,504,459 | 3.10.2 |
| **Astro Starlight** | Astro (agnóstico) | 9.4k | 2026-10-09 | 1,431,284 (el propio astro: 7.22M) | astro 7.3.8 / starlight 0.42.6 |
| **docsify** | Renderizado con JS en tiempo de ejecución | 31.5k | 2026-10-11 | 80,727 | 5.0.0 |
| **Nextra** | Next.js + React | 13.9k | 2026-07-31 | 238,757 | 4.6.1 |
| **Fumadocs** | Next.js + React | 13.3k | 2026-10-09 | — | — |
| **MkDocs Material** | Python | 27.6k | 2026-10-02 | PyPI, no aplica | — |
| **Sphinx** | Python / RST | 8.1k | 2026-10-05 | PyPI, no aplica | — |
| **VuePress** | Vue + Webpack | 22.7k | ⚠️ **2024-08-07** | 71,177 | 1.9.10 (v2 estancado en 2.0.0-rc.31) |
| **Dumi** | Umi + React | 3.8k | 2026-09-14 | 20,163 | 2.4.50 |
| **Rspress** | Rspack + React | 2.3k | 2026-10-10 | 19,631 | 1.47.2 (2.0 beta.21) |

Lectura clave: VitePress y Docusaurus son los únicos dos candidatos de primera línea que superan el millón de descargas mensuales; Starlight ha crecido a remolque del propio Astro (7,22 millones) y es el tercer polo; VuePress, pese a sus 23 mil estrellas, lleva más de dos años sin commits y **ha sido reemplazado de hecho por VitePress**.

## Ventajas e inconvenientes por nivel

### Primer nivel: VitePress / Docusaurus / Astro Starlight

**VitePress** (en uso en este repositorio antes de la migración; el resto de los sitios de la familia lo siguen usando)

- Ventajas: los componentes mon archivo de Vue se pueden escribir directamente en markdown (precisamente de ello dependían las tres páginas de referencia de tokens / contratos / casos dorados de este repositorio); los **cargadores de datos en tiempo de compilación** (`*.data.ts`) encajan de forma natural con la lectura de las fuentes JSON, y en desarrollo combinados con un `watch` de glob permiten recarga en caliente; el servidor de desarrollo de Vite es rapidísimo; el tema por defecto funciona nada más instalarlo, con una configuración casi nula; comunidad y materiales en chino abundantes.
- Inconvenientes: soporte débil de MDX (no forma parte del ecosistema MDX); capacidades de nivel empresarial como versionado de documentación o i18n hay que construirlas por cuenta propia o buscar plugins; la profundidad de personalización del tema es menor que la de Docusaurus; la búsqueda es un índice local, de resultados mediocres en sitios grandes.

**Docusaurus** (de Meta, con el ecosistema más grande)

- Ventajas: el **plugin de versionado de documentación** (convivencia de varias versiones) y el **i18n** son los más maduros de todos los frameworks; el ecosistema MDX, el sistema de plugins y la inyección de temas (swizzle) están pulidos; cuenta con el respaldo de Meta, lo que garantiza el mantenimiento a largo plazo.
- Inconvenientes: el peso de las dependencias del ecosistema React es grande y el JS de los artefactos de construcción es voluminoso; la abundancia de opciones de configuración aumenta la carga mental; su canal de datos (el ciclo de vida `loadContent`) es más tortuoso que el cargador de VitePress para conectar con las fuentes JSON; no hay precedentes en la familia.

**Astro Starlight** (agnóstico respecto al framework, referente de rendimiento; **el que usa este repositorio**)

- Ventajas: **cero JS de cliente por defecto**, lo que mejor encaja con la filosofía de «cero JS en tiempo de ejecución» de este repositorio; las colecciones de contenido (Content Collections) aportan una capa de datos con seguridad de tipos; permite mezclar componentes de Vue / React / Svelte; los artefactos de construcción son los más ligeros; la experiencia de documentación del tema Starlight es excelente (barra lateral, navegación por anclas, i18n integrado).
- Inconvenientes: Starlight sigue en 0.x (0.42.6) y su API puede tener cambios disruptivos; las colecciones de contenido están pensadas para **contenido basado en archivos** (md / mdx), de modo que para leer JSONs externos como `tokens/*.json` hay que sortear las colecciones e importarlos directamente en páginas `.astro` (este repositorio ya lo ha resuelto invocando los módulos de codegen directamente desde el frontmatter); no hay precedentes en la familia, y las convenciones de despliegue / nginx / barra lateral hubo que descubrirlas por cuenta propia (**este repositorio ya las ha establecido; véanse las [Notas de despliegue](../deployment)**).

### Segundo nivel: Nextra / Rspress / Fumadocs / Dumi

- **Nextra**: ecosistema Next.js, MDX potente, documentación atractiva; pero está fuertemente atado a Next.js + React, su modelo de despliegue (SSG / SSR / Edge) difiere del alojamiento estático con nginx de la familia y las convenciones de directorios de contenidos de v4 difieren mucho de las de VitePress. No hay motivación para migrar.
- **Rspress** (de web-infra-dev de ByteDance): **la construcción más rápida** (Rspack), claramente superior a VitePress en sitios de documentación grandes con miles de páginas; la comunidad de mantenedores en chino es afable. Pero su ecosistema / cantidad de plugins es la menor (20 mil descargas semanales) y los cargadores de datos no tienen un paradigma estándar — este repositorio apenas tiene una treintena de páginas, de modo que el coste de aprendizaje que exigiría la velocidad no se aprovecha.
- **Fumadocs**: el novato de mayor crecimiento de los últimos dos años (13.3k estrellas, con solo 2 issues abiertas), Next.js + un sistema de diseño moderno, con buena experiencia de búsqueda y de cambio de vista. También fuertemente atado a Next.js, y la documentación en español es escasa. Vale la pena guardarlo, pero no se recomienda introducirlo ahora.
- **Dumi**: creado para las **demostraciones de bibliotecas de componentes** (live demo, generación automática de tablas de props). Este repositorio es un repositorio de tokens de tiempo de compilación y **no tiene ninguna UI en tiempo de ejecución que demostrar**, de modo que su propuesta de valor central resulta del todo inútil, además de estar fuertemente atado a Umi / React. Descartado de forma explícita.

### Tercer nivel y casos especiales

- **MkDocs Material / Sphinx** (familia Python): la calidad de la documentación es altísima, pero exigen una cadena de herramientas de Python, que **no pertenece al mismo ecosistema** que la cadena Node ≥ 20 + pnpm + TS de este repositorio, por lo que no se pueden reutilizar los tipos y las funciones de carga de codegen. Descartados.
- **docsify** (renderizado en tiempo de ejecución): no tiene fase de construcción y se sirve desde un CDN, apto para documentaciones pequeñas de «una sola página lista al instante». Pero **no genera HTML en tiempo de compilación** (SEO débil, primer renderizado lento) y tampoco puede ejecutar cargadores de datos de compilación que validen el esquema (de esa capacidad dependen precisamente las páginas de referencia de este repositorio). Descartado.

## Comparación con las restricciones de este repositorio, punto por punto

| Restricción / necesidad del repositorio | VitePress | Docusaurus | Starlight | Otros |
| --- | --- | --- | --- | --- |
| Mismo esquema que los siete sitios de la familia (prefijo nginx / barra lateral / despliegue) | ✅ el resto de los sitios de la familia lo usan | ❌ habría que recorrer el camino de nuevo | ✅ este repositorio ya lo ha establecido (las tres reglas de nginx siguen siendo válidas; véanse las [Notas de despliegue](../deployment)) | ❌ |
| Leer las fuentes JSON en tiempo de compilación para renderizar las páginas de referencia | ✅ cargador nativo, ya implementado | ⚠️ requiere un plugin a medida | ✅ ya implementado (el frontmatter de las páginas `.astro`_invoca directamente load / resolve de codegen) | ⚠️ más laborioso |
| Un solo idioma, sin necesidad de i18n | ✅ | la ventaja no se aprovecha | ✅ | — |
| Texto + tablas + código sin demostraciones interactivas | ✅ | ✅ | ✅ | ✅ |
| El espíritu de «cero JS en tiempo de ejecución» | ⚠️ tiene JS en tiempo de ejecución (solo para el sitio, fuera del alcance de las líneas rojas) | ❌ JS pesado | ✅ cero JS por defecto | — |
| Reutilización de los módulos TS de codegen (tipos / validación) | ✅ verificado (a partir de vite ^5.4.21 el SSR soporta `import.meta.dirname`) | ✅ | ✅ verificado (astro 7 lleva vite 8 integrado, el SSR soporta `import.meta.dirname`) | ✅ |

Dos criterios adicionales:

- La línea roja de «cero JS en tiempo de ejecución» regula los **artefactos de `dist/` de codegen**, no el sitio de documentación. Que el sitio funcione con un framework en tiempo de ejecución no infringe ninguna línea roja: está completamente aislado de `dist/` y sus artefactos de construcción están en `.gitignore`. Ahora bien, tras la migración a Starlight, el propio sitio se ha convertido también en cero JS de cliente por defecto (solo la búsqueda, el cambio de tema y unas pocas interacciones se cargan bajo demanda), más en sintonía con el espíritu de la línea roja.
- Las ventajas de versionado de documentación e i18n de Docusaurus **no se aprovechan** en este repositorio: documentación en un solo idioma, en una sola versión y ligada a codegen; no existe el escenario de «convivencia de documentación de versiones antiguas de tokens».

## Asuntos a observar en el futuro

1. **Starlight 1.0**: este repositorio está fijado actualmente en `^0.42.6`. En la fase 0.x todavía puede haber cambios disruptivos; cuando se publique la versión 1.0 estable se evaluará la ruta de actualización (la guía de migración de Starlight detallará los cambios).
2. **VitePress 2.0**: se evaluará cuando entre en beta. El resto de los sitios de la familia siguen con VitePress; el principal punto de interés es el rendimiento de construcción y el seguimiento de Vite 7.
3. **Las señales que activarían una nueva selección**: que Starlight quede largo tiempo sin mantenimiento o que la familia decida unificar el framework de documentación a nivel global (en ese caso, la práctica de Starlight de este repositorio sería la referencia lista para usar).
