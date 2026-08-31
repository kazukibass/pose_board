# Pose Board Roadmap

## Phase 0 — Technical PoC

目的: 企画の最小ループがブラウザで成立することを確認。

- Three.js Stage
- Human primitive rig 1体
- 関節選択
- XYZ回転
- Frame state保存
- Frame複製
- 2〜8コマ程度をパラパラ再生

この段階では見た目を作り込まない。

## Phase 1 — v0.1 Core

- Timeline可変長化
- Add / Duplicate / Delete / Reorder
- FPS / Loop
- Actor transform
- Human preset群
- Common Quadruped Rig（prototype統合済み）
- Quadruped 8-frame walk sample（prototype統合済み）
- Rig Type / Body Preset UI分離（未実装）
- SD 2-head / 4-head
- Transparent / Solid / Image background
- Text
- Speech Bubble
- Project Save / Load
- PNG export

### v0.1 Definition of Done

「人形をポーズ → コマ複製 → 少し動かす」を繰り返し、任意数のコマを編集画面でパラパラ再生し、保存して後日再編集・画像出力できる。

## Phase 1.5 — Usability

候補:
- Undo / Redo
- Keyboard shortcuts
- Onion Skin
- Pose reset
- Mirror pose
- Copy/Paste pose
- Rig visibility options
- Sprite Sheet export
- GIF export

## Phase 2 — Pose Assistance

- Bone rotation limits
- Pose preset
- 3D inbetween
- Frame duration
- Playback range

中割りはここで初めて扱う。AIを必須にしない。

## Phase 3 — Stage Expansion

- Multiple Actors UI
- 3D props import
- GLB/glTF import
- Multiple fixed cameras
- Camera cut selection per Frame

カメラのシームレス移動は引き続き低優先度。

## Phase 4 — Custom Character

- Rigged model import
- Bone mapping UI
- Imported model pose editing
- Standard human/quadruped mapping preset

Pose Board内でモデリングは行わない。

## Far Future — Comic / Storyboard Page

- Page作成
- Panel分割
- FrameをPanelへ配置
- Panel resize / reorder
- Page export

既存Frame/Sceneをそのまま再利用する。

## Explicit Non-Goals

以下はロードマップ上でも原則別ツール領域。
- 本格3Dモデリング
- 3D背景制作
- Sculpt
- Texture painting
- Physics simulation
- 高度な映像編集
- 内蔵AI画像/動画生成
