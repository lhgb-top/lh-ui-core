---
title: "Structure des répertoires"
---

```
lh-ui-core/
├── tokens/       L'unique source de vérité des jetons de conception (sources JSON neutres, schéma compris)
├── specs/        Les contrats de composants (props / énumérations / valeurs par défaut / événements / slots / comportements)
├── cases/        Les cas dorés (des assertions comportementales traduisibles d'une plateforme à l'autre)
├── codegen/      Les outils du codegen (TS/Node) : src/ + templates/
├── dist/         Les artéfacts du codegen (générés, modification à la main interdite)
├── scripts/      Les scripts de validation et de release
├── tests/        Les tests par instantanés et les méta-tests des jetons
└── docs/         Le code source du site de documentation développeur (Astro Starlight, ce site)
```

## La responsabilité de chaque répertoire

### `tokens/` — l'unique source de vérité des jetons

Des sources JSON neutres, indépendantes de toute plateforme, dont le format est contraint strictement par `tokens/schema.json`. 9 fichiers de données au total :

| Fichier | Espace de noms | Contenu |
| --- | --- | --- |
| `color.json` | `color` | La palette : les couleurs sémantiques organisées en default / hover / active / bg / border |
| `color-dark.json` | `color` (identique au mode clair) | Les surcharges incrémentales du mode sombre (ne déclare que les clés qui diffèrent du mode clair) |
| `components.json` | `""` (chaîne vide) | Les jetons de niveau composant : `button.*`, `input.*`, etc. |
| `typography.json` | `typography` | Les familles de polices / les tailles / les graisses / les interlignes |
| `spacing.json` | `spacing` | L'échelle d'espacement xs–xxl |
| `radius.json` | `radius` | Les rayons des coins |
| `shadow.json` | `shadow` | Les ombres |
| `motion.json` | `motion` | Les durées + les easing (Bézier) |
| `z-index.json` | `zIndex` | L'élévation |

Le nombre exact de feuilles par fichier varie selon les versions ; la page [Référence des jetons](../tokens/reference) fait foi — écrire un chiffre en dur dans le texte finit inévitablement par être dépassé.

Voir [Format des jetons](../tokens/token-format) et [Espaces de noms et chemins pointillés](../tokens/namespace).

### `specs/` — les contrats de composants

Un fichier JSON par composant : noms de props / types / énumérations / valeurs par défaut / événements / slots / notes de comportement / la liste des jetons consommés. Le format est contraint strictement par `specs/schema.json`. Voir [Format des contrats](../specs/spec-format).

### `cases/` — les cas dorés

Un fichier JSON par composant : des assertions comportementales given/when/then traduisibles d'une plateforme à l'autre, que chaque dépôt de tests natif traduit manuellement en tests locaux. Le format est contraint strictement par `cases/schema.json`. Voir [Format des cas](../cases/case-format).

### `codegen/` — l'outil de génération

```
codegen/
├── src/
│   ├── index.ts      Le point d'entrée de l'orchestration en CLI (le vrai corps de `pnpm codegen`)
│   ├── types.ts      Toutes les définitions de types (n'entre jamais dans les artéfacts d'exécution)
│   ├── load.ts       Le chargement JSON + la validation de schéma Ajv + l'aplatissement
│   ├── resolve.ts    La résolution des refs + la fusion du mode sombre
│   ├── format.ts     L'analyse des valeurs neutres / la mise en forme par cible
│   ├── tree.ts       Le chemin aplati → l'arborescence
│   ├── render.ts     L'encapsulation Handlebars
│   └── targets/      Les cinq cibles android / ios / harmony / windows / docs
└── templates/        Les modèles handlebars de chaque cible (7 fichiers .hbs)
```

Voir [Aperçu du pipeline](../codegen/pipeline).

### `dist/` — les artéfacts générés

**Modification à la main interdite** (liste dans `.gitignore`). Disposition :

```
dist/
├── android/top/lhgb/ui/tokens/   LhTokens.kt, LhDarkTokens.kt
├── ios/Sources/LhUITokens/       LhTokens.swift, LhDarkTokens.swift, LhShadow.swift
├── harmony/tokens/               LhTokens.ets, LhDarkTokens.ets, LhShadow.ets
├── c/include/lh_ui/              lh_tokens.h, lh_dark_tokens.h
└── docs/                         tokens.md, tokens.light.json, tokens.dark.json
```

Voir [Artéfacts](../artifacts/android).

### `scripts/` — les scripts de validation et de release

`verify-tokens.mts` (validation des jetons : schéma + intégrité référentielle + rapport des chemins sombres orphelins), `verify-specs.mts` (cohérence entre specs et cas), `resolve-local-tokens.mjs` (le garde-fou de la liaison locale). Les releases passent par changesets (voir [Commandes](./commands)).

### `tests/` — les tests par instantanés

`codegen-snapshot.spec.ts` reflète l'ensemble de `dist/` (les fichiers d'instantanés entrent dans le contrôle de version) ; `tokens.spec.ts` lance les méta-tests des jetons.

### `docs/` — ce site

Le code source du site Astro Starlight (configuration dans `docs/astro.config.mjs`, contenu dans `docs/src/content/docs/`). Les trois pages de référence (jetons / contrats / cas) sont des pages `.astro` sous `docs/src/pages/` qui, à la compilation, appellent directement les fonctions de chargement et de résolution du codegen pour rendre à partir des sources JSON — aucune maintenance manuelle des tableaux. Voir [Déploiement](../deployment) pour le déploiement.
