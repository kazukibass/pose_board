# Pose Board 技術方針

## 基本方針

ブラウザ中心・ローカルファーストで構築し、v0.1ではバックエンドを必須にしない。

## 推奨構成

- TypeScript
- React系UI
- Three.js（3D Stage）
- Canvas / DOM / SVGのいずれかを2D Layer用途に利用
- IndexedDB等をローカルプロジェクト保存に検討

## Scene Layer System — Sandwich Architecture

Sceneは自由な3D空間ではなく、以下の3層を固定した「サンドイッチ構造」として扱う。

```text
Camera
  ↓
┌──────────────────────────────┐
│ 2D OVERLAY                   │
│ ├ Text                       │
│ ├ Speech Bubble              │
│ ├ Foreground Image           │
│ └ Shape / Annotation (future)│
├──────────────────────────────┤
│ 3D STAGE                     │
│ └ Actor × 1 (v0.1 UI)        │
├──────────────────────────────┤
│ 2D BACKGROUND                │
│ ├ Background Image           │
│ ├ Additional Image Layer     │
│ └ Solid / Green / Transparent│
└──────────────────────────────┘
```

### Layer Boundary

- 2D Overlayと2D Backgroundはそれぞれ複数の子レイヤーを持てる。
- 子レイヤーは同一領域内で並べ替え可能にする。
- Overlayの子レイヤーは3D Stageより後ろへ移動できない。
- Backgroundの子レイヤーは3D Stageより前へ移動できない。
- 3D StageはScene中央の特殊な固定レイヤーとし、通常の2Dレイヤー並べ替え対象にしない。
- これによりPhotoshop/ibisPaint系のレイヤー概念を取り入れつつ、本格画像編集ソフト化を避ける。

### 2D Child Layer Common Features

初期実装で共通化を検討する項目:
- id
- name
- visible
- opacity
- order
- select
- delete
- duplicate

レイヤー種別ごとに位置・サイズ・内容等の固有プロパティを持つ。

### Image Layer

画像取込を「背景画像専用機能」に閉じない。

同じImage LayerをBackground側にもOverlay側にも置ける設計とすることで、以下を可能にする。
- 背景写真
- 前景の机・木・窓枠等のハリボテ
- ロゴ
- 集中線・効果画像
- 手書き注釈画像

ただし画像は2Dのままとし、3D回転・奥行き・衝突判定を持たせない。

## 3D Stage / Actor Policy

v0.1のUIでは3D Actorは1体のみとする。

- Actor/Rigの切替は可能。
- 成人・子供・SD・犬猫等のPresetを選択する。
- 将来Imported GLB/glTF等へ切替可能な余地を残す。
- 複数Actor UI、Actor間の選択・重なり管理はv0.1では実装しない。

データ上はActorに永続IDを持たせ、将来の複数Actor化を阻害しない。

## Primitive Rig

外部モデルを読み込まず、Three.js primitiveをBone階層へ紐付けて人形を構築する。

候補:
- SphereGeometry: 頭・関節
- BoxGeometry: 胸・腰
- CylinderGeometry / Line: 腕・脚
- ConeGeometry: 耳・鼻先・方向表現
- Curve / Tube: 尻尾等

Object3D / GroupをBone Pivotとして利用し、親子階層によって関節運動を表現する。

## Camera

v0.1:
- 固定Output Camera
- Camera animationなし

編集用ViewはOutput Cameraと分離可能な構造を維持する。

## Frame Playback

動画ファイルを生成せず、Frame Stateを指定FPSで順番にStageへ適用する。

2D Background Layers / 3D Actor / 2D Overlay LayersをすべてFrame Stateの一部として切り替え、パラパラ再生する。

## State Management

ProjectをSingle Source of Truthとする。

最低限分離する状態:
- project data
- selected frame
- selected actor/bone/layer
- playback state
- transient editor state

再生中の一時状態を保存Projectへ混ぜない。

## Save Strategy

Pose/SceneはJSON中心なので軽量。

背景・前景画像などBinary Assetが入るため、以下を比較して決定する。
- JSON + IndexedDB
- ZIP形式 project package
- File System Access API併用

## Export

最終出力は以下を1枚へ合成する。

```text
Background Layer Stack
        ↓
3D Stage Render
        ↓
Overlay Layer Stack
        ↓
Final PNG / Frame
```

Transparent modeではalphaを保持する。

## Security / Rights Boundary

- ユーザー画像をサーバーへ送信しない構成を優先する。
- AI生成APIを内蔵しない。
- 外部3Dモデル取込を実装する際はファイル形式・容量・不正データへの検証を追加する。
- ユーザーが読み込む画像/モデルの権利はユーザー側で確認する旨を利用時に明示できる設計を検討する。
