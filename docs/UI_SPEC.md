# Pose Board UI仕様

## 基本方針

ユーザーが最も頻繁に行う操作を中央に寄せる。

**Pose → Duplicate/Add → Adjust → Play**

Blender型の多数のパネルを避け、初見でも触れるUIを優先する。

## Desktop Layout

```text
┌──────────────────────────────────────────┐
│ Pose Board      Save  Load       Export  │
├──────────┬───────────────────┬───────────┤
│          │                   │           │
│ Rig      │                   │ Selected  │
│ Preset   │     3D STAGE      │ Object    │
│          │                   │ Controls  │
│ BG       │                   │           │
│ Text     │                   │ XYZ       │
│ Bubble   │                   │           │
├──────────┴───────────────────┴───────────┤
│ ▶  ■  Loop   FPS [8]                     │
├──────────────────────────────────────────┤
│ [01][02][03][04][05][06] ... [ + ]      │
└──────────────────────────────────────────┘
```

## Stage

- Cameraは固定。
- Actorを選択できる。
- 関節を選択して回転できる。
- モデル全体の移動・回転ができる。
- 背景はStage背面の2Dレイヤー。
- Text/BubbleはStage前面の2Dレイヤー。

## Timeline

各Frameをサムネイルで表示。

操作:
- Tap/Click: 選択
- Drag: 並べ替え
- +: 追加
- Duplicate: 現在コマ複製
- Delete: 削除

大量Frameでは横スクロールする。

## Playback Bar

- Play / Pause or Stop
- Loop
- FPS
- Current Frame / Total Frames

編集→再生→停止→修正が途切れないことを最優先する。

## Rig Preset Menu

初期候補:
- Adult Male
- Adult Female
- Boy
- Girl
- Dog
- Cat
- SD 2-head
- SD 4-head

## Background Menu

- Transparent
- White
- Black
- Gray
- Green Screen
- Custom Color
- Import Image

画像背景:
- Position
- Scale
- Fit / Fill（必要なら）

## Overlay Menu

### Text
Add Text → Stageに追加 → 直接編集。

### Bubble
Add Bubble → 種類選択 → Stage配置 → テキスト編集。

## 操作の段階表示

通常画面では詳細数値を隠してよい。

例:
1. 関節を直接ドラッグ/回転
2. 必要な場合のみAdvancedを開く
3. X/Y/Z数値を調整

## Mobile Future

v0.1の主対象はDesktopだが以下を守る。
- hover必須操作を作らない。
- 小さすぎる関節Hit Areaを避ける。
- Timelineは横スクロール可能にする。
- Side panelはDrawerへ変換可能な構造にする。
