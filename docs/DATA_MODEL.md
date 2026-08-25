# Pose Board データモデル案

目的: v0.1を単純に保ちつつ、中割り・複数カメラ・3Dモデル取込・漫画ページ機能を後から追加可能にする。

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

UI上は「コマ」、内部ではScene Stateとして扱う。

```ts
type Frame = {
  id: string;             // UUID等。配列indexをIDにしない
  name?: string;
  actors: Actor[];
  background: Background;
  overlays: Overlay[];
  cameraId: string;
  duration?: number;      // future
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
  assetId?: string;       // future imported model
};
```

v0.1 UIが1体中心でもデータはactors[]とし、複数人形を阻害しない。

## Transform3D

```ts
type Transform3D = {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
};
```

Rotationの内部単位（degree/radian）は実装開始時に統一する。

## Pose

```ts
type Pose = {
  bones: Record<string, BoneTransform>;
};

type BoneTransform = {
  rotation: { x: number; y: number; z: number };
};
```

## Background

```ts
type Background =
  | { type: "transparent" }
  | { type: "solid"; color: string }
  | {
      type: "image";
      assetId: string;
      x: number;
      y: number;
      scale: number;
    };
```

## Overlay

```ts
type Overlay = TextOverlay | BubbleOverlay;

type TextOverlay = {
  id: string;
  type: "text";
  text: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
};

type BubbleOverlay = {
  id: string;
  type: "bubble";
  bubbleStyle: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
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
  type: "background-image" | "model";
  name: string;
  source: string;
};
```

実装時はBlob URLを永続値として保存しない。IndexedDB、File System Access API、埋め込み方式等から保存方式を決める。

## Future: Camera

v0.1は固定Camera 1つ。

```ts
type Camera = {
  id: string;
  transform: Transform3D;
  projection: "perspective" | "orthographic";
};
```

将来Frame.cameraIdを切り替えることでCamera A/B/Cのカット切替を可能にする。

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
