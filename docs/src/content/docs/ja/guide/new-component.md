---
title: "新規コンポーネントの追加フロー"
---

ネイティブ血脈でコンポーネントを 1 つ追加するには、次の 5 ステップを順どおりに進めます。

## 1. コンポーネント契約 `specs/<name>.json` を書く

props / 列挙 / デフォルト値 / イベント / スロット / 振る舞い / 消費するトークンを宣言します。

```json
{
  "$schema": "./schema.json",
  "name": "stepper",
  "component": "LhStepper",
  "since": "0.1.0",
  "description": "ステッパー：指定範囲内でステップ幅ずつ値を増減する。",
  "props": [
    { "name": "value", "type": "number", "default": 0, "description": "現在値（制御）" },
    { "name": "step", "type": "number", "default": 1, "description": "ステップ幅" },
    { "name": "disabled", "type": "boolean", "default":  false, "description": "無効かどうか" }
  ],
  "events": [
    { "name": "onChange", "payload": [{ "name": "value", "type": "number", "description": "変更後の値" }], "description": "値が変化したときに発火" }
  ],
  "behaviors": [
    "disabled が true のとき：増減ボタンは反応せず、onChange も発火しない"
  ],
  "tokenRefs": ["stepper.height", "stepper.buttonSize"]
}
```

フィールドの制約は [契約フォーマット](../specs/spec-format) を参照してください。

## 2. ゴールデンケース `cases/<name>.json` を書く

端をまたいで保証したい振る舞いごとに、given/when/then のアサーションを 1 つ書きます：

```json
{
  "$schema": "./schema.json",
  "component": "stepper",
  "cases": [
    {
      "id": "disabled-blocks-change",
      "name": "無効状態では onChange を発火しない",
      "given": { "props": { "disabled": true } },
      "when": { "action": "click", "target": "増加ボタン" },
      "then": {
        "events": [{ "name": "onChange", "assertion": "notEmitted" }],
        "enabled": false
      }
    }
  ]
}
```

形式は [ケースフォーマット](../cases/case-format) を参照してください。

## 3. 検証を実行する

```bash
pnpm verify:specs
```

case と spec の一貫性を検証します：case の `given.props` のキーがすべて spec の props に存在するか、`then.events[].name` がすべて spec の events に存在するか、などです。

## 4. コンポーネントレベルのトークンを補う（必要な場合）

コンポーネントが新しい**コンポーネントレベルのトークン**（`stepper.height` など）を導入する場合は、`tokens/components.json` の対応するコンポーネント名前空間にキーを追加します：

```json
"stepper": {
  "height": { "value": "32px", "description": "ステッパーの高さ", "nativeOnly": true },
  "buttonSize": { "value": "24px", "description": "増減ボタンのサイズ" }
}
```

そのうえで：

```bash
pnpm codegen      # dist/ を再生成
pnpm verify:tokens
pnpm test -- -u   # スナップショットを更新
```

新しいトークンが**ブランドレベル**（コンポーネントの寸法ではなく、カラーパレットや間隔スケールなどのグローバル量）の場合は、対応する `tokens/<category>.json` を編集し、ファミリーの `docs/設計言語ベースライン.md` の「変更登記」セクションに登録してください。

## 5. リリース

```bash
pnpm changeset    # changeset を 1 つ書く
pnpm changeset:version
```

core が先にリリースされ、その後、各ネイティブ端がトークン依存のバージョンを上げ、`cases/stepper.json` に従ってケースを手作業でローカルテスト（JUnit / XCTest / ohpm test / C 単体テスト）へ翻訳します。

## チェックリスト

- [ ] `specs/<name>.json` が存在し、`pnpm verify:specs` が通る
- [ ] `cases/<name>.json` が存在し、spec と一致している
- [ ] 新しいトークンが `tokens/` に追加され、`pnpm verify:tokens` が通る
- [ ] `pnpm codegen` が成功し、`pnpm test` のスナップショットが更新済み
- [ ] changeset を書いた
- [ ] （ブランドレベルのトークン）ファミリーのベースラインドキュメントに登録した
