---
title: "Définitions de types — types.ts"
---

> L'ensemble des définitions de types partagées par tous les modules de codegen. Aucune dépendance à une API de plateforme ; usage interne de la chaîne d'outils de compilation, ces types n'entrent jamais dans un artéfact d'exécution.

[Aperçu du pipeline](./pipeline) présente les quatre interfaces principales (`CodegenTarget` / `CodegenInput` / `GeneratedFile` / `TokenSet`) ; cette page est la référence complète.

## Côté jetons

### `TokenType`

```ts
type TokenType =
  | 'color'
  | 'dimension'
  | 'number'
  | 'string'
  | 'shadow'
  | 'duration'
  | 'cubicBezier'
```

Correspond une à une aux énumérations `$type` / `type` de `tokens/schema.json`. Les contraintes sur les valeurs neutres de chaque type se trouvent dans [Format des jetons](../tokens/token-format), et leur analyse dans [Couche de formatage](./format).

### `TokenValue`

```ts
type TokenValue = string | number | number[]
```

La valeur neutre d'un jeton : une valeur de couleur hexadécimale / un `rgba()` / une chaîne avec unité (`"12px"`, `"50%"`, `"0.3s"`) / un nombre pur (le type `number`) / un tableau de quatre Bézier. Toute syntaxe propre à une plateforme est interdite.

### `RawToken`

```ts
interface RawToken {
  value?: TokenValue       // La valeur littérale (l'un des deux, value ou ref)
  ref?: string             // Le chemin pointillé d'un autre jeton, résolu statiquement et cuit à la compilation
  type?: TokenType         // En l'absence de déclaration, hérite du $type du fichier / du groupe
  description?: string
  nativeOnly?: boolean     // Marque un ajout de la lignée native (pas un élément d'alignement avec la lignée web)
}
```

Une feuille (un jeton) dans les fichiers JSON sources, correspondant directement au nœud `token` du schéma. `value` et `ref` sont mutuellement exclusifs (le `anyOf` du schéma impose un choix obligatoire entre les deux).

### `ResolvedToken`

```ts
interface ResolvedToken {
  path: string             // Le chemin pointillé, par exemple color.primary.default
  type: TokenType
  value: TokenValue        // La valeur littérale cuite (le ref est déjà résolu)
  refChain?: string[]      // Lorsque la valeur provient de la résolution d'un ref, enregistre les chemins de référence originaux (y compris les chaînes indirectes)
  description?: string
  nativeOnly?: boolean
}
```

Le produit de `resolveTokens`. `refChain` n'existe que lorsque le jeton provient d'une référence ; il sert à la documentation et au débogage pour retrouver la chaîne de référence originale.

### `DarkOverrides`

```ts
type DarkOverrides = Map<string, TokenValue>
```

Les surcharges sombres déjà résolues : path -> valeur. Les clés sont les chemins clairs de même nom (le `$namespace` de `color-dark.json` est aligné avec celui du mode clair, afin que les clés de surcharge retombent sur le même chemin).

### `TokenSet`

```ts
interface TokenSet {
  tokens: ResolvedToken[]              // Les jetons clairs
  byPath: Map<string, ResolvedToken>   // Recherche rapide par chemin
  dark: DarkOverrides                  // path -> valeur de la surcharge sombre
}
```

Le `ResolveResult.tokenSet` retourné par `resolveTokens` ; c'est l'entrée de toutes les cibles. `byPath` sert, lors de la fusion du mode sombre, à retrouver le type et la description du jeton clair correspondant.

## Côté contrats (specs)

### `ComponentSpec`

```ts
interface ComponentSpec {
  name: string             // L'identifiant du contrat (kebab-case, par exemple 'button')
  component: string        // Le nom d'affichage (par exemple 'Button bouton')
  since?: string           // La version d'introduction
  description: string
  props: SpecProp[]
  events?: SpecEvent[]
  slots?: SpecSlot[]
  behaviors?: string[]
  tokenRefs?: string[]     // Les chemins complets des jetons consommés par ce composant
}
```

La correspondance des types de `specs/<name>.json`, chargé par `loadSpecs()` avec validation du schéma.

### `SpecProp`

```ts
interface SpecProp {
  name: string
  type: 'string' | 'number' | 'boolean' | 'enum' | 'tokenRef' | 'node' | 'array'
  values?: string[]        // Uniquement pour enum : l'ensemble des valeurs de l'énumération
  default?: unknown        // La valeur par défaut (omise = pas de valeur par défaut)
  required?: boolean
  description: string
}
```

Le `type` correspond à l'énumération à sept valeurs de `specs/schema.json`. Parmi elles, `tokenRef` (un chemin pointillé de jeton) et `node` (une référence de nœud) sont des valeurs réservées, actuellement inutilisées par les 15 contrats existants.

### `SpecEvent`

```ts
interface SpecEvent {
  name: string
  payload?: { name: string; type: SpecProp['type']; description?: string }[]
  description: string
}
```

### `SpecSlot`

```ts
interface SpecSlot {
  name: string
  description: string
}
```

## Côté cas (cases)

### `ComponentCases`

```ts
interface ComponentCases {
  component: string        // Le nom du composant, en correspondance avec ComponentSpec.name
  cases: GoldenCase[]      // Au moins un cas (le schéma impose minItems: 1)
}
```

### `GoldenCase`

```ts
interface GoldenCase {
  id: string               // L'identifiant du cas (kebab-case, unique dans tout le dépôt)
  name: string             // Une description en une phrase, lisible par un humain
  given: { props?: Record<string, unknown>; state?: Record<string, unknown> }
  when: {
    action: 'render' | 'click' | 'input' | 'focus' | 'blur' | 'custom'
    target?: string
    payload?: unknown
  }
  then: {
    events?: { name: string; assertion: 'emitted' | 'notEmitted'; times?: number; payload?: unknown }[]
    tokens?: { path: string; applied: boolean }[]
    visible?: boolean
    enabled?: boolean
    text?: string
    notes?: string
  }
}
```

La correspondance des types de la structure en trois parties given / when / then. Le `blur` de `when.action` est une valeur réservée, actuellement inutilisée par tous les cas. La sémantique des champs est décrite dans [Format des cas](../cases/case-format).

## Les entrées et les artéfacts de codegen

### `CodegenInput`

```ts
interface CodegenInput {
  tokens: TokenSet
  specs: ComponentSpec[]
  cases: ComponentCases[]
  version: string          // Le numéro de version du package.json, écrit dans le commentaire d'en-tête de chaque artéfact
}
```

Assemblé par `main()`, puis transmis à la fonction `generate()` de chaque cible. Actuellement, les cibles ne consomment que `input.tokens` ; `specs` / `cases` sont réservés à la future génération de documentation, de squelettes de types ou de tests.

### `CodegenTarget`

```ts
interface CodegenTarget {
  name: string             // Le préfixe de journal, par exemple 'android'
  outDir: string           // Le nom du sous-répertoire de dist
  generate(input: CodegenInput): GeneratedFile[]
}
```

Chaque cible de plateforme implémente cette interface. Ajouter une plateforme = ajouter une cible et l'insérer dans le tableau `targets` d'`index.ts`.

### `GeneratedFile`

```ts
interface GeneratedFile {
  relativePath: string     // Le chemin de sortie relatif à dist/<outDir>/
  content: string
}
```

## Modules associés

| Module | Responsabilité |
| --- | --- |
| [Aperçu du pipeline](./pipeline) | L'orchestration d'`index.ts` et un aperçu des interfaces principales |
| [Couche de chargement — load.ts](./load) | Produit les `RawToken` / `ComponentSpec` / `ComponentCases` |
| [Couche de résolution — resolve.ts](./resolve) | Produit le `TokenSet` (`ResolvedToken` + `DarkOverrides`) |
| [Les cinq cibles](./targets) | Consomment le `CodegenInput` et produisent les `GeneratedFile` |
