---
title: "Couche de résolution — resolve.ts"
---

> Résolution des références et fusion du mode sombre.

`resolveTokens(files: LoadedTokenFile[]): ResolveResult` est la fonction centrale, organisée en trois parties :

## Valeur de retour

```ts
interface ResolveResult {
  tokenSet: TokenSet                    // Le jeu de jetons clairs + la table des surcharges sombres
  orphanDarkPaths: string[]             // Les chemins sombres orphelins (pour le rapport verify)
  refMap: Map<string, string>           // path -> la chaîne ref brute (les clés sombres portent le préfixe dark:)
}
```

## Première partie : l'aplatissement du mode clair

Tous les `flat` des fichiers non sombres sont fusionnés en une `rawMap` unique :

```ts
if (rawMap.has(path)) throw new Error(`Chemin de jeton défini en double : ${path} (fichier ${file.fileName})`)
```

Chaque enregistrement porte trois valeurs :

| Champ | Signification |
| --- | --- |
| `token` | Le `ResolvedToken` en cours d'assemblage (le type prenant d'abord la valeur de repli `raw.type ?? file.defaultType`) |
| `raw` / `ref` | La valeur brute et la chaîne de référence |
| `ownType` | **Le type déclaré par la feuille elle-même**, utilisé spécifiquement pour distinguer « déclaré par la feuille » et « valeur par défaut au niveau fichier » |

`ownType` est la clé des trois niveaux de priorité des types : une fois la résolution des refs revenue, **c'est uniquement lorsque `ownType === undefined`** que le type de la cible de la référence est adopté.

## Deuxième partie : la résolution des refs

La fonction interne `resolveRef(path, chain): { value, type? }` :

1. `rawMap.get(path)` n'existe pas → lève `Le jeton référencé n'existe pas : <path>`
2. La cible est elle-même un ref → appel récursif `resolveRef(entry.ref, [...chain, path])`
3. `chain.includes(path)` → lève `Cycle de références de jetons détecté : a -> b -> a`
4. Une valeur littérale est atteinte → retourne `{ value, type }`

La boucle principale, pour chaque entrée possédant un ref :

```ts
refMap.set(path, entry.ref)                    // Enregistre la relation de référence
const resolved = resolveRef(entry.ref, [path])
entry.token.value = resolved.value             // Cuit en valeur littérale
entry.token.refChain = [entry.ref]             // Enregistre la chaîne de référence
if (entry.ownType === undefined && resolved.type !== undefined) {
  entry.token.type = resolved.type             // Le type suit la source de vérité
}
```

Enfin :

```ts
if (entry.token.type === undefined) {
  throw new Error(`Le jeton ${path} n'a pas de type (ni type propre, ni $type de niveau fichier)`)
}
assertTypedValue(entry.token.type, value)      // Validation sémantique
```

Les résultats sont triés par chemin (ordre lexicographique) et l'index `byPath` est construit.

## Troisième partie : les surcharges sombres

Les fichiers sombres ne déclarent que **les clés devant être surchargées**.

**La vue des espaces de noms sombres** : tous les `flat` des fichiers sombres sont d'abord à nouveau aplatis en une `darkRawMap` (`path -> { value, ref }`).

**La fonction interne `resolveDarkRef(path, chain): TokenValue`** — la résolution au plus proche des refs sombres :

| Cas | Comportement |
| --- | --- |
| La cible est dans `darkRawMap` et c'est un ref | On suit la chaîne récursivement **au sein de l'espace de noms sombre** (un ref sombre vers un sombre est la prise de valeur d'un même thème), avec là aussi une détection de cycles |
| La cible est dans `darkRawMap` et c'est une valeur littérale | Retourne la valeur sombre |
| La cible **n'est pas** dans `darkRawMap` | **Repli sur l'espace de noms clair** : `resolveRef(path, chain).value` |

**Le parcours des entrées sombres** :

```ts
if (raw.ref) {
  // La cible doit exister dans byPath / rawMap / darkRawMap, au moins l'un des trois
  if (!byPath.has(raw.ref) && !rawMap.has(raw.ref) && !darkRawMap.has(raw.ref)) {
    throw new Error(`La référence du jeton sombre ${path} n'existe pas : ${raw.ref}`)
  }
  value = resolveDarkRef(raw.ref, [path])
  refMap.set(`dark:${path}`, raw.ref)    // La clé sombre porte le préfixe
}
const type = raw.type ?? byPath.get(path)?.type
if (!type) { orphanDarkPaths.push(path); continue }   // Type manquant → on saute cette clé
assertTypedValue(type, value)
if (!byPath.has(path)) orphanDarkPaths.push(path)     // Orphelin → tout de même écrit dans la table des surcharges
dark.set(path, value)
```

## Les chemins sombres orphelins

Deux types d'anomalies **n'interrompent pas le codegen** ; elles sont simplement consignées dans `orphanDarkPaths` pour le rapport de `pnpm verify:tokens` :

- Une clé sombre **sans type** (ni type propre, ni clé de même nom dans le jeu clair dont hériter) → **la clé est sautée et n'est pas écrite dans la table des surcharges**
- Une clé sombre **inexistante dans le jeu clair** (orpheline) → **écrite dans la table des surcharges**, mais signalée dans le rapport

Voir [Fusion du mode sombre](../tokens/dark-mode).

## Comment chaque cible consomme `dark`

`dark` est une `Map<path, TokenValue>` aplatie ; chaque cible décide ensuite comment l'émettre (Kotlin / Swift / ArkTS utilisent un espace de noms `LhDarkTokens` indépendant ; C utilise la redéfinition de macros de même nom). Voir [Les cinq cibles](./targets).
