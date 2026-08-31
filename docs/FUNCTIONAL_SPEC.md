# Pose Board 機能定義書

## F-01 Scene Editor

中央のStage上でSceneを編集する。

Sceneは以下で構成する。
- Backdrop（2D）
- Actors（3D）
- Overlay（2D）
- Camera（v0.1では固定）

## F-02 Primitive Rig

### Human Rig
主要Bone:
- root
- hip
- spine
- chest
- neck
- head
- left/right shoulder
- left/right upperArm
- left/right lowerArm
- left/right hand
- left/right upperLeg
- left/right lowerLeg
- left/right foot

形状はSphere / Box / Cylinder・Line等のプリミティブで構成する。

### Quadruped Rig
主要Bone候補:
- root
- pelvis
- spine
- chest
- neck
- head
- muzzle
- front legs L/R
- rear legs L/R
- tail segments

現行prototypeは犬・猫別Presetを持たず、共通Quadrupedテンプレート1種とする。既存Human Pose schemaとの互換Adapterとして、前脚をArm chain、後脚をLeg chainへ対応させる。Tail専用Boneは持たず、尾はspineへ暫定対応する。

Rig PresetメニューでQuadrupedを選ぶと専用8フレームWalkを読み込む。同側は後脚→前脚、反対側は半周期ずらし、左右対応関節の回転変化量の絶対値を揃える。Preset切替時は現在のFramesを選択RigのWalkへ置換する。

## F-03 Transform

Actor全体:
- Position X/Y/Z
- Rotation X/Y/Z
- Scale（必要に応じて）

Bone:
- Rotation X/Y/Z

操作は画面上の直接操作を主とし、詳細値は補助UIとして扱う。

## F-04 Frame Management

- Add Frame: 新規Sceneを追加
- Duplicate Frame: 現在Sceneを複製
- Delete Frame
- Reorder Frame
- Select Frame
- Thumbnail表示

コマ数に製品上の固定制限を設けない。性能保護が必要になった場合のみ警告等を検討する。

## F-05 Flipbook Preview

必須:
- Play
- Stop
- Loop ON/OFF
- FPS指定
- 再生中Frame表示

実装は動画生成ではなく、指定間隔でFrame StateをStageへ適用する。

## F-06 Background

Mode:
1. Transparent
2. Solid Color
3. Image

Image設定:
- x / y
- scale
- 必要ならfit: cover / contain

背景に3D座標・奥行き・パース編集機能を持たせない。

## F-07 Text

- 内容入力
- x / y
- width / height
- fontSize
- alignment

初期版では高度な文字組みを扱わない。

## F-08 Speech Bubble

- bubble body
- tail
- text
- x / y
- size

初期版は少数の吹き出し形状プリセットでよい。

## F-09 Project Save

Scene StateをJSONとして保存する。

画像背景については、ブラウザ内保存方式に応じてBlob/IndexedDB等を検討する。JSON単体で扱う場合は外部画像参照切れへの対策が必要。

## F-10 Project Load

保存したProjectを読み込み、以下を復元する。
- Frame順
- Rig種類
- Pose
- Actor transform
- Background
- Text / Bubble
- Playback settings

現行JSONではRig種類を`rig.presetId`で保存する。Rig TypeとBody Presetを独立フィールドへ分離する設計は未実装。

## F-11 Export

優先順位:
1. Current Frame PNG
2. All Frames PNG
3. Sprite Sheet
4. GIF

Transparent背景ではAlphaを保持する。

## F-12 Undo / Redo

v0.1で実装可能なら優先度高。ポーズ操作は誤操作が発生しやすいため、最低1段階より履歴Stack方式が望ましい。

## 将来機能

### Onion Skin
前後Frameを半透明表示。

### Inbetween
2つのFrame間のtransform / bone rotationを補間して新規Frameを作る。AIは不要。

### Multiple Fixed Cameras
Camera A/B/Cを保存し、FrameごとにCamera IDを選択。連続カメラアニメーションは別機能とする。

### Imported 3D Objects
GLB/glTF等を小道具として配置。position / rotation / scaleのみ。

### Imported Rigged Character
外部Rigを標準BoneへマッピングしてPose Board上で操作。

### Comic Page Mode
既存SceneをPage上のPanelへ参照配置する。Scene自体を複製せず、同じScene資産をTimelineとPage Layoutから利用できる設計を目指す。
