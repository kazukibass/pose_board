# Pose Board 技術方針

## 基本方針

ブラウザ中心・ローカルファーストで構築し、v0.1ではバックエンドを必須にしない。

## 推奨構成

- TypeScript
- React系UI
- Three.js（3D Stage）
- Canvas / DOM / SVGのいずれかを2D Overlay用途に利用
- IndexedDB等をローカルプロジェクト保存に検討

フレームワークの最終選定は実装開始時に決める。

## Rendering Layers

```text
2D Overlay
  Text / Speech Bubble
        ↓
3D Stage
  Primitive Rig Actor(s)
        ↓
2D Backdrop
  Transparent / Solid / Image
```

3DなのはActor Layerだけとする。

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
- 固定Camera
- Camera animationなし

Actor側のposition / rotationで向きと配置を表現する。

## Frame Playback

動画ファイルを生成しない。

```text
Play
 ↓
Timer / requestAnimationFrame
 ↓
FPSから次Frame時刻を判定
 ↓
Frame StateをStageへ適用
 ↓
Loop or Stop
```

編集画面そのものを高速に切り替える。

## State Management

ProjectをSingle Source of Truthとする。

最低限分離する状態:
- project data
- selected frame
- selected actor/bone/overlay
- playback state
- transient editor state

再生中の一時状態を保存Projectへ混ぜない。

## Save Strategy

Pose/SceneはJSON中心なので軽量。

背景画像などBinary Assetが入るため、以下を比較して決定する。
- JSON + IndexedDB
- ZIP形式 project package
- File System Access API併用

v0.1では「ユーザーが明示的に保存/読込できること」を優先する。

## Export

Stageの3D Canvasと2D Backdrop/Overlayを合成して画像化する必要がある。

実装方法はPoCで検証する。

Transparent modeではalphaを保持する。

## Security / Rights Boundary

- v0.1はユーザー画像をサーバーへ送信しない構成を優先する。
- AI生成APIを内蔵しない。
- 外部3Dモデル取込を実装する際はファイル形式・容量・不正データへの検証を追加する。
- ユーザーが読み込む画像/モデルの権利はユーザー側で確認する旨を利用時に明示できる設計を検討する。
