---
title: "Artéfacts docs"
---

**Chemin** : `dist/docs/`

Il s'agit de la cinquième cible du codegen (`docsTarget`), et de la **seule cible qui n'utilise pas de modèles handlebars** — elle assemble des chaînes de caractères directement en code.

## Les trois artéfacts

### `tokens.md` — la table de référence rapide des jetons

Organisé en sections `##` par **espace de noms de premier niveau** (button / cell / checkbox / color / dialog / icon / input / loading / motion / navbar / picker / radio / radius / shadow / spacing / switch / tag / textarea / toast / typography / zIndex), chaque section étant un tableau à cinq colonnes :

```markdown
## button

| Jeton | Type | Clair | Sombre | Description |
| --- | --- | --- | --- | --- |
| `button.borderRadius` | dimension | 2px | — | Le rayon du bouton suit le rayon global |
| `button.height.medium` | dimension | 40px | — | Ajout natif ; hauteur du bouton moyen (par défaut) |
| `color.primary.default` | color | #2B4C7C → #2b4c7c | #3D649E → #3d649e | Couleur principale (indigo — bleu de la 青花瓷 (porcelaine bleue et blanche)) |
```

Particularités :

- La colonne des jetons contient des **chemins pointillés complets**
- La colonne des couleurs affiche deux valeurs : « valeur brute → minuscule normalisée »
- Les éléments `nativeOnly` sont signalés dans la colonne de description par « ajout natif »
- La colonne sombre contient `—` en l'absence de surcharge (actuellement, le mode sombre ne surcharge que `color.*`)

### `tokens.light.json` — instantané aplati du mode clair

```json
{
  "button.borderRadius": "2px",
  "button.fontWeight": 400,
  "button.height.medium": "40px",
  "color.primary.default": "#2B4C7C"
}
```

Une correspondance aplatie `{ path -> valeur cuite }`, destinée à une consommation machine.

### `tokens.dark.json` — table des surcharges sombres

```json
{
  "color.focus": "#7FA6D9",
  "color.selected": "#B1C1D8",
  …
}
```

Ne contient que **les clés surchargées** (toutes dans `color.*` ; le nombre exact varie selon les versions), triées par chemin.

## Consommateurs

| Consommateur | Ce qu'il utilise |
| --- | --- |
| **Ce site de documentation** | Ne consomme pas directement `dist/docs/` — la page [Référence des jetons](../tokens/reference) est une page `.astro` qui rend en temps réel via **la même** chaîne `loadTokenFiles` + `resolveTokens`, toujours synchronisée avec la source |
| Les sites de documentation de la famille | Intègrent `tokens.md` comme aide-mémoire des jetons |
| L'alignement des cibles | `tokens.light.json` / `tokens.dark.json` pour les comparaisons à la compilation |
| Le filtrage des documents de référence | Le marquage `nativeOnly` sert à la liste des « jetons ajoutés natifs » |

## Garde d'en-tête

Le début de `tokens.md` :

```html
<!-- Ce fichier est généré automatiquement par @lh-ui/core. Ne le modifiez pas à la main. Source : @lh-ui/core tokens -->
```

Même principe que la bannière « ne pas modifier à la main » de chaque cible (ligne rouge 6).

## Différence avec la page de référence du site

| | `dist/docs/tokens.md` | Page de référence des jetons du site |
| --- | --- | --- |
| Moment de génération | `pnpm codegen` | `pnpm docs:build` / `docs:dev` |
| Source des données | Le `tokenSet` en mémoire du codegen | La page `.astro` ré-exécute `loadTokenFiles` + `resolveTokens` via son frontmatter |
| Forme | Tableau markdown statique | Tableau Astro interactif (filtres, aperçus des couleurs) |
| Emplacement | `dist/` (gitignore, hors contrôle de version) | Page du site (artéfacts de construction dans `docs/dist/`) |

Les deux empruntent **la même chaîne d'analyse**, donc les valeurs sont toujours identiques ; la différence ne porte que sur la présentation et le point d'entrée de la construction.
