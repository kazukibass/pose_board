# Pose Board データモデル案

目的: v0.1を単純に保ちつつ、2D Layer、中割り、複数カメラ、3Dモデル取込、漫画ページ機能を後から拡張可能にする。

## Project

```ts
type Project = {
  version: string;
  id: string;
  name: string;
  frames: Frame[];
  playback: PlaybackSettings;
  assets: Asset[];
  pages?: ComicPage[]; // future
};
```

## Frame / Scene

Sceneは「Background 2D Layers / 3D Actor / Overlay 2D Layers」のサンドイッチ構造。

```ts
type Frame = {
  id: string;
  name?: string;
  backgroundLayers: BackgroundLayer[];
  actor: Actor;
  overlayLayers: OverlayLayer[];
  cameraId: string;
  duration?: number; // future
};
```

v0.1では3D Actorを1体に限定する。将来複数Actorが必要になった場合に`actor -> actors[]`へ移行可能なよう、Actor IDと型を維持する。

## Layer Common

```ts
type LayerBase = {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  order: number;
};
```

Background/Overlayの子レイヤーは各領域内でのみ並べ替える。

- BackgroundLayerは3D Stageを越えて前へ出せない。
- OverlayLayerは3D Stageを越えて後ろへ移せない。
- 3D Stage自体は通常の2D Layer Stackに含めない。

## Background Layers

```ts
type BackgroundLayer =
  | SolidLayer
  | ImageLayer;

type SolidLayer = LayerBase & {
  type: "solid";
  color: string;
};
```

完全透過はBackground Layerが存在しない、または全Background Layerが非表示の状態として表現可能。

## Overlay Layers

```ts
type OverlayLayer =
  | ImageLayer
  | TextLayer
  | BubbleLayer;
```

将来Shape / Annotation等を追加可能。

## Image Layer

Image LayerはBackground/Overlay双方で再利用する。

```ts
type ImageLayer = LayerBase & {
  type: "image";
  assetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number; // 2D rotation only, optional
};
```

用途例:
- 背景画像
- 前景ハリボテ
- ロゴ
- 効果線
- 注釈画像

3D transformは持たせない。

## Text Layer

```ts
type TextLayer = LayerBase & {
  type: "text";
  text: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
  align?: "left" | "center" | "right";
};
```

## Bubble Layer

```ts
type BubbleLayer = LayerBase & {
  type: "bubble";
  bubbleStyle: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  tailDirection?: number;
};
```

## Actor

```ts
type Actor = {
  id: string;
  type: "primitive-rig" | "imported-model";
  presetId?: string;
  transform: Transform3D;
  pose?: Pose;
  assetId?: string; // future imported model
};
```

v0.1 UIではActor × 1。Preset/Rigを切り替えて使用する。

現行PoCのProject JSONはActor内ではなくトップレベルの`rig`に定義を保存する。

```ts
type CurrentRig = {
  type: "primitive-rig";
  presetId: "adult" | "slender" | "child" | "chibi4" | "chibi2" | "quadruped";
  groups: unknown;
  restPose: Pose;
};
```

`quadruped`は独立したRig Typeではなく暫定的な`presetId`である。Rig Type / Body Preset分離は未実装。QuadrupedもHuman用Bone名を互換Adapterとして再利用し、前脚=Arm chain、後脚=Leg chain、尾=spineへ対応する。

## Transform3D

```ts
type Transform3D = {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
};
```

## Pose

```ts
type Pose = {
  bones: Record<string, BoneTransform>;
};

type BoneTransform = {
  rotation: { x: number; y: number; z: number };
};
```

## Playback

```ts
type PlaybackSettings = {
  fps: number;
  loop: boolean;
};
```

## Asset

```ts
type Asset = {
  id: string;
  type: "image" | "model";
  name: string;
  source: string;
};
```

実装時はBlob URLを永続値として保存しない。IndexedDB、File System Access API、埋め込み方式等から保存方式を決める。

## Future: Camera

```ts
type Camera = {
  id: string;
  transform: Transform3D;
  projection: "perspective" | "orthographic";
};
```

将来Frame.cameraIdを切り替えることでCamera A/B/Cのカット切替を可能にする。

## Future: Multiple Actors

必要になった時点で以下へMigrationする。

```ts
type Frame = {
  // ...
  actors: Actor[];
  // ...
};
```

v0.1では複数Actor UIを先回りして実装しない。

## Future: Comic Page

```ts
type ComicPage = {
  id: string;
  panels: Panel[];
};

type Panel = {
  id: string;
  frameId: string;
  x: number;
  y: number;
  width: number;
  height: number;
};
```

Frameを複製せず参照することで、Timelineと漫画ページで同一Sceneを利用できる。
