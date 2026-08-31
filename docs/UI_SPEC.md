# Pose Board UI仕様

## 基本方針

ユーザーが最も頻繁に行う操作を中央に寄せる。

**Pose → Duplicate/Add → Adjust → Play**

Blender型の多数のパネルを避け、初見でも触れるUIを優先する。

UIの質感・操作思想は既存のKanpeで重視した「本番中でも迷わない大きな操作領域」「情報の優先順位が一目で分かる」「スマホで窮屈にしない」を引き継ぐ。

Pose Boardでは特にPlaybackを音楽プレイヤーとして扱う。再生系操作は単なる小さなツールボタンではなく、常に視認しやすい主要UIとする。

## 共通デザイン原則

- 再生操作は音楽プレイヤー型UI。
- Playを中央かつ最も大きなPrimary Actionにする。
- Previous / Next Frame、Play/Pause、First/Last等はSVGアイコンを使用する。
- 絵文字や文字記号を再生アイコン代わりに使用しない。
- SVGはcurrentColor等でテーマに追従できる実装を優先する。
- ボタンは見た目より広いHit Areaを確保する。
- 状態は色だけでなく形・選択表示等でも判別可能にする。
- 編集対象以外の情報を常時大量表示しない。
- DesktopとMobileで機能を分断せず、同じProjectを同じ概念で編集する。

## Desktop Layout

```text
┌──────────────────────────────────────────────┐
│ Pose Board              Save / Load / Export │
├──────────┬───────────────────────┬───────────┤
│ Rig      │                       │ Selected  │
│ Preset   │                       │ Object    │
│          │       3D STAGE        │ Controls  │
│ BG       │                       │           │
│ Text     │                       │ XYZ       │
│ Bubble   │                       │           │
├──────────┴───────────────────────┴───────────┤
│  00:03     |◀  ◀   [ ▶ ]   ▶  ▶|    8 FPS  │
├──────────────────────────────────────────────┤
│ [01][02][03][04][05][06][07] ...       [＋] │
└──────────────────────────────────────────────┘
```

DesktopではStageを最大限広く取り、左右の設定領域は折りたたみ可能にする。

### Desktop要件

- Stageを画面の主役にする。
- Timelineは常時アクセス可能な位置を優先する。
- Playback BarはStageとTimelineの間、または上部固定領域に置く。
- Playback Barはウィンドウ幅が広くても散らばらず、ひとまとまりのPlayerとして見えること。
- キーボードショートカットは将来追加可能にするが、マウス操作だけで完結させる。
- 詳細XYZ数値編集はDesktopで利用しやすくする。

## Mobile Layout

MobileはDesktopを縮小しない。Stage / Player / Timelineを中心に再構成する。

```text
┌──────────────────────┐
│ Pose Board       ☰   │
├──────────────────────┤
│                      │
│       3D STAGE       │
│          ○           │
│         /|\          │
│         / \          │
│                      │
├──────────────────────┤
│ 00:03   ◀  [ ▶ ]  ▶  │
│        Loop   8 FPS   │
├──────────────────────┤
│ [01][02][03][04] → ＋ │
├──────────────────────┤
│ 選択中: Left Elbow   │
│ X ─────●─────        │
│ Y ───●───────        │
│ Z ───────●───        │
└──────────────────────┘
```

### Mobile要件

- Portraitを主要レイアウトとして成立させる。
- Landscapeでも破綻しない。
- hover操作禁止。
- 主要Tap Targetは指で確実に押せる大きさを確保する。
- Timelineは横スクロール。
- Frameは長押しDrag等で並べ替え可能にする。
- Side Panel相当の機能はBottom Sheet / Drawerへ移す。
- Stageを設定画面で覆い尽くさない。
- 選択関節のXYZ操作はStage下部のSlider/Controlとして表示可能にする。
- 数値入力はAdvanced扱いとし、通常操作では必須にしない。
- Safe Area（ノッチ / Dynamic Island / Home Indicator等）を考慮する。
- ブラウザのアドレスバー伸縮によるviewport変動を考慮する。
- pinch等のブラウザ標準挙動と3D操作が衝突しないよう設計する。

## Editing View と Output Camera

完成コマのCameraは固定を原則とする一方、編集時に関節の裏側を確認する必要がある。

将来的に以下を分離可能な設計とする。

- Output Camera: コマに記録される固定構図。
- Editing View: ポーズ編集のため一時的に回り込める視点。

Editing Viewを動かしてもOutput Cameraの構図を意図せず変更しないこと。

v0.1で自由Editing Viewを実装しない場合でも、データモデル上でCameraとEditor Viewを同一状態に固定しすぎない。

## Stage

- Output Cameraは固定。
- Actorを選択できる。
- 関節を選択して回転できる。
- モデル全体の移動・回転ができる。
- 背景はStage背面の2Dレイヤー。
- Text/BubbleはStage前面の2Dレイヤー。
- Mobileでは小さな関節そのものより広いHit Areaを設定できるようにする。

## Timeline

各Frameをサムネイルで表示する。

操作:
- Tap/Click: 選択
- Drag / Long Press Drag: 並べ替え
- +: 追加
- Duplicate: 現在コマ複製
- Delete: 削除

大量Frameでは横スクロールする。コマ数によってサムネイルを極端に縮小しない。

選択Frameと再生中Frameを明確に区別する。

## Playback Player

Pose Boardの特徴的UIとして扱う。

### 必須操作

- Play / Pause
- Stopまたは先頭へ戻る操作
- Previous Frame
- Next Frame
- Loop ON/OFF
- FPS
- Current Frame / Total Frames または経過表示

### Visual

- Play/Pauseを中央の大きな円形ボタン等で強調する。
- Previous/NextはPlayより一段弱いVisual Hierarchyにする。
- SVGアイコンを統一セットとして管理する。
- Active/Disabled/Pressed状態を用意する。
- 再生中も現在FrameがTimeline上で追従して分かるようにする。

### Behavior

編集 → Play → 違和感を発見 → Stop → 該当Frame編集 → Play、を数秒で繰り返せること。

動画生成やExportを挟まない。

## Rig Preset Menu

現行選択肢:
- Adult
- Slender adult
- Child
- SD 4-head
- SD 2-head
- Quadruped template

Quadrupedは犬・猫別に分けない。現行PoCではRig TypeとBody Presetを同じメニューで扱い、Quadruped選択時は専用8フレームWalkへ切り替える。

Human/Quadrupedとも、選択関節にはXYZ方向の矢印と回転リングを表示する。

Mobileでは一覧を常駐させずDrawer / Sheetから選択する。

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

背景は2D Backdropであり、3D回転機能は持たせない。

## Overlay Menu

### Text
Add Text → Stageに追加 → 直接編集。

### Bubble
Add Bubble → 種類選択 → Stage配置 → テキスト編集。

Mobileでは文字入力時のSoftware Keyboard表示によってStage/対象Overlayが完全に隠れないよう考慮する。

## 操作の段階表示

通常画面では詳細数値を隠す。

1. 関節を直接選択・操作
2. 選択対象用の簡易Controlを表示
3. 必要な場合のみAdvancedを開く
4. X/Y/Z数値を直接調整

## Responsive Breakpoint Philosophy

特定端末名でUIを分岐するのではなく、利用可能幅と入力方式を基準にする。

- Wide: Desktop layout
- Compact: Mobile layout
- Intermediate: Stageを優先しPanelをDrawer化

タッチ対応PC/Tabletも想定し、`pointer` API等でMouse/Touch/Penを共通化できる実装を優先する。

## Accessibility / Polish

- SVG buttonにはaria-labelを付与する。
- Keyboard focusを視認可能にする。
- アイコンのみで意味が不明瞭な機能にはTooltip/Labelを提供する。
- Motion reduction設定を尊重できるようにする。
- UI Animationは操作理解を助ける範囲に留める。
- ボタン押下、Frame選択、再生状態などに明確なFeedbackを返す。

## UI完成度の基準

「機能が動く」だけを完成としない。

- 主要操作の位置が毎回変わらない。
- Playを探さない。
- 現在どのFrameを触っているか迷わない。
- 現在どのBone/Actorを触っているか迷わない。
- Mobileで誤タップを連発しない。
- Desktopで無駄な余白のためStageが狭くならない。
- 操作後に何が起きたか視覚的に理解できる。

Pose Boardでは、この操作感まで含めてUI要件とする。
