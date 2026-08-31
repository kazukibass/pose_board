# Pose Board — HANDOFF

このファイルはCodex / Claude / ChatGPT等、作業を担当するエージェント間の引き継ぎ用。

**作業を終了・中断する前に必ず更新すること。**
未完了でも現在地点を残す。次の担当者がチャット履歴を読み直さなくても再開できる状態を目標とする。

---

## Current Status
- Phase: v0.1 release preparation / Rig expansion
- Status: main上で共通Quadruped RigをUI・Stage・JSONへ統合。自動検証成功、手動確認は概ね完了。
- Last updated: 2026-08-31
- Last agent: Codex
- GitHub Pages: GitHub Actions方式で公開済み。初回deploy成功、`https://kazukibass.github.io/pose_board/`のHTTP 200を確認済み。
- Pages path fix: 背景画像は`import.meta.env.BASE_URL`経由で参照する。`/backgrounds/...`の絶対パスはProject Pagesで404となり白画面を起こすため使用しない。

## ACTIVE WORK — 最初に確認すること

共通Quadruped統合後の状態。新規作業前に`git status`と直近の履歴を確認すること。

### 目的
- Human Rigを壊さず、動物種を限定しない共通Primitive Quadruped Rigを追加する。
- 犬/猫固有のPose presetは作らない。Poseはユーザーが作成する。
- Neutralは **胴体水平 / 前後4脚を約90°下向き** とする。

### 実装済み
- `src/QuadrupedRig.tsx`
- Box / Sphere / Capsule / Coneのみで構成した簡易四足素体。
- 胴体水平。
- 前脚2本・後脚2本はNeutral状態で垂直下向き。
- prototypeでは既存Human Pose schemaをAdapterとして再利用し、前脚=Arm chain、後脚=Leg chainへ対応させている。
- Head / Neck / Tail相当を最低限のPrimitiveで表現。
- Stageへ接続し、既存のRig Presetメニューから「四足歩行（テンプレート）」を選択可能。
- 四足選択時は専用8フレームWalkへ切り替わる。同側は後脚→前脚、反対側は半周期ずらし、左右対応関節の変化量の絶対値を揃えている。
- Humanと同じ関節選択・XYZ回転UIを再利用し、選択関節へ回転リングとXYZ矢印を表示。
- Project JSONの`rig.presetId`に`quadruped`を保存し、読込時にも復元。
- Rig TypeとBody PresetのUI分離は未実装。現状は単一のPresetメニューで切り替える。

## What
- `docs/ARCHITECTURE.md` / `docs/DATA_MODEL.md`へScene Layer Systemを反映済み。
- 2D Overlay / 3D Stage / 2D Backgroundのサンドイッチ構造を採用。
- Overlay/Backgroundのみ子Layerを持ち、3D Stageを跨ぐ並べ替えは禁止。
- v0.1の3D Actor UIは1体。
- mainの作業ツリーで共通Quadruped prototypeをStage/UI/保存読込へ統合。

## Why
Pose BoardはBlender化させず、簡単な素体でPoseとコマを素早く作ることを優先する。四足も犬/猫を別々に作り込まず共通Rigを1つ用意する。

現行のFrame / Undo / Playbackとの互換性を優先し、QuadrupedもHuman用Pose schemaをAdapterとして再利用している。

## Where
mainで読む順:
1. `HANDOFF.md`
2. `docs/DEVELOPMENT_RULES.md`
3. `docs/ARCHITECTURE.md`
4. `docs/DATA_MODEL.md`
5. `docs/ROADMAP.md`

Quadruped実装:
1. `src/QuadrupedRig.tsx`
2. `src/Rig.tsx`
3. `src/Stage.tsx`
4. `src/model.ts`
5. `src/App.tsx`

## What's Next
1. Quadrupedの左右振幅とJSON round-tripを保証する自動テストを追加。
2. Human → Quadruped → Human切替時の編集データ置換仕様を確定する。現状はPreset切替時にWalk全8フレームを読み直す。
3. 旧JSON（`rig.presetId`なし）がHumanとして確実に復元されることを確認・テストする。
4. PNG/ZIP出力とDesktop/Mobile Drawerでの切替を最終確認する。
5. Rig TypeとBody Presetを分離するかは別タスクとして設計する（現時点では未実装）。

## Verification Required
- `npm test`: 成功
- `npm run lint`: 成功
- `npm run build`: 成功
- 手動確認: ユーザー確認で概ねOK。四足時の回転矢印欠落は修正済み。
- 未完了: 左右振幅・JSON互換の自動テスト、PNG/ZIP、Desktop/Mobileの最終回帰確認。
- 公開確認: GitHub ActionsのDeploy GitHub Pagesと公開URLのHTTP応答は確認済み。`?from=portfolio`時の共通ナビは実URLでDesktop/Mobileの目視確認が残る。

## Known Issues / Open Questions
- `BoneName / Pose`は現在Human専用。prototypeでは互換AdapterとしてHuman Bone名を再利用。
- 正式版でRigType別Bone schemaへ分離するか、共通semantic chain層を置くかはbranch検証後に決める。
- Tail専用Boneは現行schemaにない。Tail編集はv0.1必須にしない。
- 犬/猫別の体型Presetは今回対象外。
- Preset切替は現在のFrame編集内容を保持せず、選択RigのWalkサンプルへ置換する。
- `rig.presetId`が欠落または未知値の場合、読込処理は現在選択中のRigを明示的にHumanへ戻さない。この旧JSON fallbackは要改善。
- Pose Lab / IKはv0.1公開後のExperimental Feature候補。

## Changed Files (Quadruped integration)
- Code: `src/App.tsx`, `src/Rig.tsx`, `src/Stage.tsx`, `src/QuadrupedRig.tsx`
- Docs: `HANDOFF.md`, `README.md`, `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md`, `docs/FUNCTIONAL_SPEC.md`, `docs/REQUIREMENTS.md`, `docs/ROADMAP.md`, `docs/UI_SPEC.md`

## Public Preview Configuration
- `vite.config.ts` uses `/pose_board/` only for production builds; local Vite development remains rooted at `/`.
- `.github/workflows/deploy-pages.yml` runs install, test, lint, and build before deploying `dist` through GitHub Pages on `main` pushes or manual dispatch.
- `index.html` loads the portfolio shell. It activates only with `?from=portfolio`; desktop uses the shared 56px nav and mobile uses the slim brand button, without changing direct-access UI.
- The landing-page repository is intentionally not changed in this repository task.

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

## 作業委譲方針
- 定型修正・テスト追加・調査は、軽量サブエージェントへ優先的に委譲する。
- 独立した実装作業は、利用可能であればGemini / Copilot等の外部モデルへ委譲する。
- 主担当は設計判断、差分レビュー、統合、コミットを担当する。
- 外部モデルへ依頼する際は、既存の未コミット変更を保持するよう明記する。
- 外部モデルの出力は必ずレビューし、`npm test` / `npm run lint` / `npm run build`を再実行する。
- 秘密情報やAPIキーをプロンプトに含めない。
- 外部CLIを直接起動できない場合は、コピペ可能な依頼文をユーザーへ渡す。
