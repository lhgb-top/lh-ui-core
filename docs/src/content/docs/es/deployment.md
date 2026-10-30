---
title: "Notas de despliegue"
---

Este sitio de documentación se despliega, según la convención de la familia, bajo el prefijo `/lhui/core/` de `www.lhgb.top` (en el mismo esquema que los sitios de android / ios / harmony / windows).

El framework del sitio es **Astro Starlight** (migrado desde VitePress el 2026-10-12; la justificación de la decisión está en [Elección tecnológica del sitio de documentación](./guide/tech-choice)).

## Construcción

```bash
pnpm docs:build
```

Los artefactos quedan en `docs/dist/` (`astro.config.mjs` establece `outDir: 'docs/dist'` de forma explícita — **deliberadamente evita el `dist/` de la raíz del repositorio que usa codegen**, véase la línea roja 6; está incluido en `.gitignore` y no se versiona).

Toda la configuración relacionada con el despliegue está en `docs/astro.config.mjs`:

| Opción | Valor | Descripción |
| --- | --- | --- |
| `site` | `https://www.lhgb.top` | Origen del sitio para el sitemap y el SEO |
| `base` | `/lhui/core/` | Prefijo de despliegue; debe empezar y terminar con una barra |
| `build.format` | `'file'` | Produce `page.html` en vez de `page/index.html`, alineado con el contrato nginx de la familia |
| `trailingSlash` | `'never'` | Gestionado por Starlight, en combinación con `format: 'file'` |

<Aside type="tip" title="Cambia la ruta de despliegue en un solo lugar">
`base` debe empezar y terminar con una barra. El `base` de Astro se aplica a la vez a las rutas de recursos de la construcción, al sitemap y al índice de búsqueda de pagefind; a diferencia de la época de VitePress, no hace falta mantener un archivo `.env` adicional.
</Aside>

<Aside type="caution" title="base no cubre dos tipos de enlaces">
`base` solo afecta a lo que generan el propio Astro / Starlight: los recursos de las páginas, la barra lateral, la paginación, el selector de idioma, el sitemap y el índice de pagefind. **Los dos siguientes no reciben el prefijo automáticamente**:

1. **`hero.actions[].link` del frontmatter** (los botones de llamada a la acción de una página de inicio con `template: splash`) — Starlight 0.42.6 lo emite tal cual como `href`, por lo que `index.mdx` debe incluir el prefijo completo, por ejemplo `/lhui/core/guide/quickstart`.
2. **los enlaces de rutas absolutas que empiezan por `/` en el contenido markdown** — el renderizado de markdown de Astro 7 no aplica el `base`.

Para el caso 2, este repositorio incluye el plugin `remarkBasePrefix` en `astro.config.mjs`, que añade el prefijo en tiempo de compilación, de modo que el texto puede seguir usando rutas absolutas como `/tokens/reference`; el caso 1 debe escribirse siempre completo. Al cambiar `base`, recuerda actualizar también los dos botones hero de la página de inicio.
</Aside>

## Subida

Sube el contenido de `docs/dist/` al directorio del servidor `/home/webuser/nginx/lh-ui/core/`.

## Configuración de nginx

```nginx
location ^~ /lhui/core/ {
    alias /home/webuser/nginx/lh-ui/core/;
    index index.html;
    try_files $uri $uri.html $uri/ /lhui/core/index.html;
}
```

Tres reglas de la familia aprendidas a base de tropiezos (reconfirmadas una a una tras la migración a Starlight):

1. **El fallback de `try_files` debe incluir el prefijo base** (`/lhui/core/index.html`); de lo contrario, la recarga de un enlace profundo devuelve 404.
2. **La barra final de `alias` es obligatoria** y se usa en pareja con `location ^~ /lhui/core/`.
3. **Es necesario incluir `$uri.html`** — el `build.format: 'file'` de este sitio produce archivos `page.html` (URLs tipo `/lhui/core/page`, sin barra final), y nginx recurre a `$uri.html` para alcanzar el archivo real; quitarlo rompe los enlaces profundos con un 404.

## Autocomprobación tras el despliegue

```bash
curl -I https://www.lhgb.top/lhui/core/guide/introduction
grep -c "lhui/core" docs/dist/index.html   # se espera > 0
# aserción inversa: los artefactos no deben contener enlaces internos sin el base (el conteo debe ser 0)
grep -rcE 'href="/(guide|tokens|specs|cases|codegen|artifacts)/' docs/dist/ | grep -v ':0$' || echo OK
```

## Vista previa local

```bash
pnpm docs:dev        # http://localhost:5185/lhui/core/
pnpm docs:preview    # vista previa de la construcción de producción, también con el prefijo base
```

El `base` de Astro también se aplica al servidor de desarrollo (a diferencia de VitePress, que dependía de `.env.development` para establecer `DOCS_BASE=/`), de modo que las rutas locales **también llevan el prefijo `/lhui/core/`** — la estructura de URLs es idéntica en local y en producción, lo que elimina la antigua carga mental de «sin prefijo en local, con prefijo en producción».

## Asignación de puertos

| Repositorio | puerto de dev | base |
| --- | --- | --- |
| lh-ui-vue2 | 5177 | `/lhui/vue2/` |
| lh-ui-plus | 5178 | `/lhui/vue3/` |
| lh-ui-react | 5179 | `/lhui/react/` |
| lh-ui-uniapp | 5187 | `/lhui/uniapp/` |
| lh-ui-android | 5181 | `/lhui/android/` |
| lh-ui-ios | 5182 | `/lhui/ios/` |
| lh-ui-harmony | 5183 | `/lhui/harmony/` |
| lh-ui-windows | 5186 | `/lhui/windows/` |
| **lh-ui-core (este sitio)** | **5185** | **`/lhui/core/`** |

La referencia autorizada del despliegue de la familia está en `部署/nginx-lhui.conf.md` del repositorio `lh-ui/docs`; esta página es la copia de operaciones del propio repositorio. Tras cada despliegue efectivo debería actualizarse la tabla general de la familia (este cambio no implica ediciones entre repositorios).
