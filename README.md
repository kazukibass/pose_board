# Pose Board

軽量な3Dデッサン人形を使って、コマ送りの動き・構図・会話を素早く作るための絵コンテWebツール。

## コンセプト

**2Dの舞台に、動かせる3D人形を置いて、パラパラ漫画のように絵コンテを作る。**

Blenderのような高機能3D制作ソフトを目指さない。必要なのは「人形を動かす → コマを追加する → 再生して確認する」という短い制作ループ。

## v0.1 の中心機能

- プリミティブで構成した簡易3D Rig
- 関節・モデルのXYZ回転
- 可変長のコマ
- コマ追加 / 複製 / 削除 / 並べ替え
- 編集画面でのパラパラ再生
- FPS変更 / ループ再生
- 透過 / 単色 / 画像背景
- テキストボックス / 吹き出し
- プロジェクト保存・読込
- 静止画・連番等の出力

## 現在のRig

成人・標準 / 成人・細身 / 子ども / 2頭身 / 4頭身 / 共通Quadrupedテンプレート

Quadrupedは犬・猫別ではなく共通素体1種類。プリセット選択時に、左右対応関節の変化量を揃えた専用8フレームWalkを読み込む。現時点ではRig TypeとBody Presetは分離せず、同じRig Presetメニューから選択する。

3Dモデル素材を必須とせず、球・箱・三角/円錐・線/棒・曲線などの単純な形状で表現する。

## やらないこと

v0.1では以下を扱わない。

- AI画像生成 / 動画生成
- 3D背景制作
- 本格的なモデリング
- 物理演算
- 高度なライティング / マテリアル編集
- 自動中割り
- シームレスなカメラアニメーション

## Documents

- [要件定義](docs/REQUIREMENTS.md)
- [機能定義](docs/FUNCTIONAL_SPEC.md)
- [UI仕様](docs/UI_SPEC.md)
- [データモデル](docs/DATA_MODEL.md)
- [技術方針](docs/ARCHITECTURE.md)
- [ロードマップ](docs/ROADMAP.md)
- [開発原則](docs/DEVELOPMENT_RULES.md)

## Development

Technical PoC / v0.1 release preparation is in progress.

```bash
npm install
npm run dev
```

Production verification:

```bash
npm test
npm run lint
npm run build
```

## Public preview

The production build is deployed to GitHub Pages when `main` is pushed:
[https://kazukibass.github.io/pose_board/](https://kazukibass.github.io/pose_board/)

The shared portfolio navigation is opt-in. Open the app with
`?from=portfolio` to enable it; direct visits retain the standalone Pose Board
interface. Before announcing the preview, verify the deployed URL, including
desktop and mobile navigation, after the first successful Pages workflow.

## Status

v0.1 release preparation / Rig expansion
