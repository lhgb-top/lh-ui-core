---
title: "ケースフォーマット"
---

各 `cases/<name>.json` はコンポーネントの**ゴールデンケース**の集合です：端をまたいで翻訳できる振る舞いレベルのアサーション。形式は `cases/schema.json` が厳格に制約します。

## 設計理念

> ロジックは共有せず、振る舞いを共有する。

各ネイティブ端は**テストコードを一切共有せず**、同一の cases に従って手作業でローカルテスト（JUnit / XCTest / ohpm test / C 単体テスト）へ翻訳します。cases が記述するのは**振る舞い**のみ（どんな条件で、何を行い、何を期待するか）で、端固有の API は一切含みません。

## トップレベルの構造

```json
{
  "$schema": "./schema.json",
  "component": "button",
  "cases": [ ... ]
}
```

- `component`：kebab-case。**同名 spec の `name` と一致しなければならない**
- `cases`：少なくとも 1 件

## 三段構成

各用例は `id` / `name` / `given` / `when` / `then` が必須です：

```json
{
  "id": "disabled-blocks-click",
  "name": "無効状態では onClick を発火しない",
  "given": { "props": { "disabled": true } },
  "when": { "action": "click" },
  "then": {
    "events": [{ "name": "onClick", "assertion": "notEmitted" }],
    "enabled": false
  }
}
```

### given（前置条件）

| フィールド | 説明 |
| --- | --- |
| `props` | 初期 props。**キーは同名 spec の props に存在しなければならない** |
| `state` | 初期のコンポーネント状態。**自由なキー**で、端固有のシナリオに使う（例 `{ "text": "ボタン" }`） |

### when（アクション）

| フィールド | 説明 |
| --- | --- |
| `action` | **必須**。6 つの値のいずれか（下記参照） |
| `target` | アクションの対象（スロット名、子コンポーネント名など） |
| `payload` | アクションのペイロード（input のテキストなど） |

**6 種類のアクション**：`render`（レンダリング）/ `click`（クリック）/ `input`（入力）/ `focus`（フォーカスを得る）/ `blur`（フォーカスを失う。**予約済み、現在使用しているコンポーネントはない**）/ `custom`（カスタム。**`target` で説明しなければならない**）。

### then（アサーション）

| フィールド | 説明 |
| --- | --- |
| `events` | イベントアサーションの配列 |
| `tokens` | トークン適用アサーションの配列 |
| `visible` | 可視であることを期待するか |
| `enabled` | 操作可能であることを期待するか |
| `text` | レンダリングされることを期待するテキスト |
| `notes` | 端に依存しない補足のアサーション説明（自然言語） |

**イベントアサーション**：

```json
{
  "name": "onValueChange",
  "assertion": "emitted",
  "times": 1,
  "payload": { "value": "青花瓷" }
}
```

- `name`：**同名 spec の events に存在しなければならない**
- `assertion`：`emitted`（発火する）または `notEmitted`（発火しない）
- `times`：任意。期待する発火回数
- `payload`：任意。期待するペイロード（**深い比較**）

**トークンアサーション**：

```json
{ "path": "button.height.large", "applied": false }
```

`path` はトークンのフルパスで、`applied` はそのトークンが**レンダリング結果に適用されるかどうか**をアサートします。`applied: false` の**逆アサーション**は寸法の排他性の回帰に使います（small サイズを選んだなら、`button.height.large` は消費されるべきではない、など）。

## 完全な例

```json
{
  "id": "small-size-uses-small-tokens",
  "name": "small サイズは small の寸法トークンを消費する",
  "given": { "props": { "size": "small" } },
  "when": { "action": "render" },
  "then": {
    "tokens": [
      { "path": "button.height.small",   "applied": true },
      { "path": "button.fontSize.small", "applied": true },
      { "path": "button.height.large",   "applied": false }
    ]
  }
}
```

```json
{
  "id": "clearable-emits-empty-value",
  "name": "クリアボタンが空値を発火する",
  "given": { "props": { "value": "既存", "clearable": true } },
  "when": { "action": "custom", "payload": { "call": "clear" } },
  "then": {
    "events": [{ "name": "onValueChange", "assertion": "emitted", "times": 1, "payload": { "value": "" } }]
  }
}
```

## spec との関係

`pnpm verify:specs` が検証します：

- `given.props` のキーがすべて spec の props に存在するか
- `then.events[].name` がすべて spec の events に存在するか

そのため**spec の props / events 名を変更するときは cases も同期して変更しなければなりません**。

## 現在のコンポーネント一覧

15 のコンポーネントで、用例の総数はバージョンによって変わります。すべての用例は [ゴールデンケースリファレンス](./reference) を参照してください。
