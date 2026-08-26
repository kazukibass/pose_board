# Pose Board — HANDOFF

このファイルはCodex / Claude / ChatGPT等、作業を担当するエージェント間の引き継ぎ用。

**作業を終了・中断する前に必ず更新すること。**
未完了でも現在地点を残す。次の担当者がチャット履歴を読み直さなくても再開できる状態を目標とする。

---

## Current Status
- Phase: v0.1 release preparation / Rig expansion
- Status: mainは安定版。四足歩行共通Rigの検証ブランチ `feature/quadruped-rig` が進行中。
- Last updated: 2026-08-26
- Last agent: ChatGPT

## ACTIVE BRANCH — 最初に確認すること

mainでこのファイルを読んだ次担当者は、新規実装を始める前に **`feature/quadruped-rig` をcheckoutして検証すること。**

### 目的
- Human Rigを壊さず、犬/猫で共用できるPrimitive Quadruped Rigを追加する。
- 犬/猫固有のPose presetは作らない。Poseはユーザーが作成する。
- Neutralは **胴体水平 / 前後4脚を約90°下向き** とする。

### branchで追加済み
- `src/QuadrupedRig.tsx`
- Box / Sphere / Capsule / Coneのみで構成した簡易四足素体。
- 胴体水平。
- 前脚2本・後脚2本はNeutral状態で垂直下向き。
- prototypeでは既存Human Pose schemaをAdapterとして再利用し、前脚=Arm chain、後脚=Leg chainへ対応させている。
- Head / Neck / Tail相当を最低限のPrimitiveで表現。

### 重要
**QuadrupedRig本体を追加した段階で、Stage/UIへの切替導線はまだ未接続。**
Human専用`BoneName / Pose`をいきなり破壊的変更しないため、まずRig単体をbranchへ隔離している。

## What
- `docs/ARCHITECTURE.md` / `docs/DATA_MODEL.md`へScene Layer Systemを反映済み。
- 2D Overlay / 3D Stage / 2D Backgroundのサンドイッチ構造を採用。
- Overlay/Backgroundのみ子Layerを持ち、3D Stageを跨ぐ並べ替えは禁止。
- v0.1の3D Actor UIは1体。
- `feature/quadruped-rig`をmainから分岐し、共通Quadruped prototypeを追加。

## Why
Pose BoardはBlender化させず、簡単な素体でPoseとコマを素早く作ることを優先する。四足も犬/猫を別々に作り込まず共通Rigを1つ用意する。

現行のFrame / JSON / Undo / PlaybackはHuman専用Pose schemaを前提としているため、全面改修をmainへ直接入れずbranchで段階検証する。

## Where
mainで読む順:
1. `HANDOFF.md`
2. `docs/DEVELOPMENT_RULES.md`
3. `docs/ARCHITECTURE.md`
4. `docs/DATA_MODEL.md`
5. `docs/ROADMAP.md`

Quadruped検証:
1. checkout `feature/quadruped-rig`
2. `src/QuadrupedRig.tsx`
3. `src/Rig.tsx`
4. `src/Stage.tsx`
5. `src/model.ts`
6. `src/App.tsx`

## What's Next
`feature/quadruped-rig`で以下を実施する。

1. QuadrupedRigをStageへ接続。
2. Scene設定へHuman / Quadruped切替を追加。
3. Rig TypeとBody Presetを分離したUIにする。
4. HumanではAdult / Slender / Child / Chibi4 / Chibi2を維持。
5. Quadrupedは共通素体1種類から開始。
6. Rig TypeのProject JSON保存場所を決め、旧JSON互換を維持。
7. Human → Quadruped → HumanでHuman Poseが壊れないことを確認。
8. Neutralが「胴体水平・四脚90°下向き」になっていることを目視確認。
9. `npm test` / `npm run lint` / `npm run build`。
10. Desktop/Mobileで切替UIを確認。
11. 検証結果をHANDOFFへ追記してからPR/merge判断。

## Verification Required
Quadruped branchは **未検証・未マージ**。

必須:
- Build / Lint / Test
- Human Rig回帰
- Quadruped Neutral Pose
- Joint selection / rotation
- Frame duplicate / playback
- JSON save/load compatibility
- PNG/ZIP export
- Mobile DrawerからRig切替

## Known Issues / Open Questions
- `BoneName / Pose`は現在Human専用。prototypeでは互換AdapterとしてHuman Bone名を再利用。
- 正式版でRigType別Bone schemaへ分離するか、共通semantic chain層を置くかはbranch検証後に決める。
- Tail専用Boneは現行schemaにない。Tail編集はv0.1必須にしない。
- 犬/猫別の体型Presetは今回対象外。
- Pose Lab / IKはv0.1公開後のExperimental Feature候補。

## Release Roadmap
v0.1公開まで:
- Scene Layer System
- Image / Text / Bubble Layer
- Onion Skin
- Pose Copy / Paste
- 左右反転
- 可動域制限 ON/OFF
- Human + common Quadruped Rig
- Desktop/Mobile UI仕上げ
- Save / Load / Export / 実機確認

公開後 Experimental:
- Pose Lab
- Draft Poseを別編集空間で操作し、確定時のみFrameへ反映
- 腕: Shoulder → Elbow → Wrist、脚: Hip → Knee → Ankleの3関節chainに限定したDirect Manipulation
- 細部は通常Parameter Editorで調整

## Do Not Do
- Blenderのような汎用3D Editorへ拡張しない。
- 犬/猫を別々の高精細モデルとして作り込まない。
- Quadruped導入のために既存Human JSONを破壊しない。
- Pose Lab/IKをv0.1公開のブロッカーにしない。
- 3D背景を実装しない。
- AI画像/動画生成を本体へ内蔵しない。

---

## Agent Handoff Rules
作業終了時は最低限以下を更新する。
- What / Why / Where / What's Next
- Changed Files
- Verification (Build / Test / Manual)
- Known Issues / Open Questions
- Important Decisions

未完了でも必ず現在地点を残す。制限やエラーが近い場合は実装継続よりHANDOFF更新を優先する。
