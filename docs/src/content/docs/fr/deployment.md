---
title: "Déploiement"
---

Ce site de documentation est déployé, conformément aux conventions familiales, sous le préfixe `/lhui/core/` de `www.lhgb.top` (même système que les sites android / ios / harmony / windows).

Le framework du site est **Astro Starlight** (migré depuis VitePress le 2026-10-12 ; le compte rendu du choix se trouve dans [Choix technique du site de documentation](./guide/tech-choice)).

## Construction

```bash
pnpm docs:build
```

Les artéfacts se trouvent dans `docs/dist/` (`outDir: 'docs/dist'` est spécifié explicitement dans `astro.config.mjs`, **pour éviter délibérément le `dist/` à la racine utilisé par le codegen**, voir la ligne rouge 6 ; le répertoire est ajouté à `.gitignore` et n'entre pas dans le contrôle de version).

Toute la configuration liée au déploiement se trouve dans `docs/astro.config.mjs` :

| Option | Valeur | Description |
| --- | --- | --- |
| `site` | `https://www.lhgb.top` | Origine du site pour le sitemap et le SEO |
| `base` | `/lhui/core/` | Préfixe de déploiement, doit commencer et finir par une barre oblique |
| `build.format` | `'file'` | Produit `page.html` plutôt que `page/index.html`, aligné avec le contrat nginx de la famille |
| `trailingSlash` | `'never'` | Pris en charge par Starlight, conjointement avec `format: 'file'` |

<Aside type="tip" title="Pour changer le chemin de déploiement, un seul endroit">
`base` doit commencer et finir par une barre oblique. Le `base` d'Astro s'applique à la fois aux chemins de ressources construites, au sitemap et à l'index de recherche pagefind — plus besoin de maintenir un fichier `.env` comme à l'époque de VitePress.
</Aside>

<Aside type="caution" title="Le `base` ne couvre pas deux types de liens">
`base` n'agit que sur ce qu'Astro / Starlight génère lui-même : ressources des pages, barre latérale, pagination, changement de locale, sitemap, index pagefind. **Les deux types suivants ne reçoivent pas automatiquement le préfixe `base`** :

1. **Les `hero.actions[].link` du frontmatter** (les boutons CTA de la page d'accueil avec `template: splash`) — Starlight 0.42.6 les utilise tels quels comme `href`, il faut donc écrire le préfixe complet dans `index.mdx`, par exemple `/lhui/core/guide/quickstart`.
2. **Les liens absolus commençant par `/` dans le corps markdown** — le rendu markdown d'Astro 7 ne concatène pas le `base`.

Dans ce dépôt, le plugin `basePrefixPlugin` présent dans `astro.config.mjs` ajoute automatiquement le préfixe à la construction pour le 2e type, si bien que le corps peut toujours utiliser des chemins absolus comme `/tokens/reference` ; le 1er type exige le préfixe complet écrit à la main. Si vous modifiez `base`, pensez à modifier aussi les 2 boutons hero de la page d'accueil.
</Aside>

## Mise en ligne

Téléversez le contenu de `docs/dist/` dans le répertoire serveur `/home/webuser/nginx/lh-ui/core/`.

## Configuration nginx

```nginx
location ^~ /lhui/core/ {
    alias /home/webuser/nginx/lh-ui/core/;
    index index.html;
    try_files $uri $uri.html $uri/ /lhui/core/index.html;
}
```

 Trois contrats familiaux issus de l'expérience (chacun a été revérifié et reste valable après la migration Starlight) :

1. **Le fallback `try_files` doit porter le préfixe `base`** (`/lhui/core/index.html`), sinon le rafraîchissement d'un lien profond donne une 404
2. **La barre oblique finale de `alias` est indispensable**, utilisée en paire avec `location ^~ /lhui/core/`
3. **`$uri.html` est obligatoire** — avec `build.format: 'file'`, ce site produit des fichiers `page.html` (URL `/lhui/core/page`, sans barre oblique finale) ; nginx s'appuie sur `$uri.html` pour retrouver le fichier réel ; l'enlever provoque des 404 sur les liens profonds

## Auto-vérification post-déploiement

```bash
curl -I https://www.lhgb.top/lhui/core/guide/introduction
grep -c "lhui/core" docs/dist/index.html   # attendu > 0
# Assertion inverse : aucun lien interne sans base ne doit exister dans les artéfacts (le nombre de correspondances doit être 0)
grep -rcE 'href="/(guide|tokens|specs|cases|codegen|artifacts)/' docs/dist/ | grep -v ':0$' || echo OK
```

## Prévisualisation locale

```bash
pnpm docs:dev        # http://localhost:5185/lhui/core/
pnpm docs:preview    # prévisualise la construction de production, avec le même préfixe base
```

Le `base` d'Astro s'applique aussi au serveur de dev (contrairement à VitePress qui distinguait `DOCS_BASE=/` via `.env.development`), donc les chemins locaux **portent également le préfixe `/lhui/core/`** — les URL locales et en ligne ont exactement la même structure, ce qui supprime la charge mentale d'autrefois « pas de préfixe en local, préfixe en ligne ».

## Attribution des ports

| Dépôt | Port dev | base |
| --- | --- | --- |
| lh-ui-vue2 | 5177 | `/lhui/vue2/` |
| lh-ui-plus | 5178 | `/lhui/vue3/` |
| lh-ui-react | 5179 | `/lhui/react/` |
| lh-ui-uniapp | 5187 | `/lhui/uniapp/` |
| lh-ui-android | 5181 | `/lhui/android/` |
| lh-ui-ios | 5182 | `/lhui/ios/` |
| lh-ui-harmony | 5183 | `/lhui/harmony/` |
| lh-ui-windows | 5186 | `/lhui/windows/` |
| **lh-ui-core (ce site)** | **5185** | **`/lhui/core/`** |

La référence faisant autorité pour le déploiement de la famille se trouve dans le dépôt `lh-ui/docs`, fichier `部署/nginx-lhui.conf.md` ; ce document est le manuel d'exploitation que ce dépôt conserve pour lui-même. Une fois le déploiement effectif, le tableau de synthèse de la famille doit être mis à jour (cette modification ne concerne aucun dépôt croisé).
