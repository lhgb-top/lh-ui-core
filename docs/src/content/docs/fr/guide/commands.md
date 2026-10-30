---
title: "Commandes"
---

## Construction

| Commande | Action |
| --- | --- |
| `pnpm codegen` | Lance une génération, écrit dans `dist/` (suppression avant reconstruction) |
| `pnpm build` | `pnpm codegen && pnpm verify` |

## Validation

| Commande | Action |
| --- | --- |
| `pnpm verify:tokens` | Validation des jetons : schéma + intégrité référentielle + **contraste du texte clé sur sa couleur de fond ≥ 4.5:1 (WCAG AA, seules les paires déclarées sont contrôlées ; exemption de l'état désactivé)** + **inspection des syntaxes propres à une plateforme (blocage de `var()` / `rem` / `sp` / `dp`, etc.)** + rapport des chemins sombres orphelins |
| `pnpm verify:specs` | Validation de la cohérence entre specs et cas |
| `pnpm verify` | La combinaison des deux commandes précédentes |

## Tests et analyse statique

| Commande | Action |
| --- | --- |
| `pnpm test` | Tests par instantanés (vitest run) |
| `pnpm test:watch` | Mode surveillance des tests par instantanés |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | eslint |
| `pnpm lint:fix` | eslint --fix |
| `pnpm format` | Mise en forme prettier des json / md / yml |

## Le site de documentation

| Commande | Action |
| --- | --- |
| `pnpm docs:dev` | Prévisualisation locale sur `http://localhost:5185/lhui/core/` (le base est identique à la production) |
| `pnpm docs:build` | Construction de production (base `/lhui/core/`) |
| `pnpm docs:preview` | Prévisualisation de la construction de production |

## Les releases

| Commande | Action |
| --- | --- |
| `pnpm changeset` | Écrire un changeset |
| `pnpm changeset:status` | Consulter l'état des changesets |
| `pnpm changeset:version` | Modifier les numéros de version selon les changesets |

## La mise à jour des instantanés

Après avoir modifié des jetons ou des modèles, les instantanés échouent obligatoirement ; une fois le bien-fondé confirmé :

```bash
pnpm test -- -u
```

## La liste des scripts

Les scripts de `scripts/` (qui ne sont pas exposés via les scripts npm) :

| Script | Action |
| --- | --- |
| `scripts/verify-tokens.mts` | Le vrai corps de la validation des jetons |
| `scripts/verify-specs.mts` | Le vrai corps de la validation des contrats |
| `scripts/resolve-local-tokens.mjs` | Le garde-fou de la liaison locale |

Les publications passent par changesets (voir « Les releases » ci-dessus) ; il n'y a pas de script de publication supplémentaire.
