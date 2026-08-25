# Pose Board — HANDOFF

このファイルはCodex / Claude / ChatGPT等、作業を担当するエージェント間の引き継ぎ用。

**作業を終了・中断する前に必ず更新すること。**
未完了でも現在地点を残す。次の担当者がチャット履歴を読み直さなくても再開できる状態を目標とする。

---

## Current Status

- Phase: Phase 0 — Technical PoC
- Status: 拡張PoC実装済み / Test・Lint・Build・HTTP配信確認済み
- Last updated: 2026-08-26
- Last agent: Codex

## What — 何をしたか

- Vite + React + TypeScript + React Three Fiberの最小Webアプリ構成を追加。
- Three.jsプリミティブで階層型Human Rigを実装。
- Stage上またはリストから主要関節を選択し、XYZスライダーで回転できるUIを実装。
- 可変長Frame Stateの追加・複製・削除・選択を実装。
- SVG音楽プレイヤー型UIでPrevious / Next / First / Play / Pause、FPS、Loop再生を実装。
- Wide/CompactのレスポンシブUIと、Poseモデルの単体テストを追加。
- 起動時に8コマの歩行サンプルを追加。
- UIの英語／日本語切替を追加。
- モデル全体のXYZ回転を追加し、現在コマのみ／全コマ一括の適用範囲を選択可能にした。
- 関節回転にも現在コマのみ／全コマ一括の適用範囲を追加。
- 関節と全身のXYZ回転にdegree数値入力を追加。
- Rig一覧を顔・左右腕・体・左右脚の折りたたみ階層表示へ変更。グループ見出し選択時は階層Rootを選択する。
- 選択関節マーカーをdepth test非依存のオレンジ色リングへ変更し、モデル裏側でも視認可能にした。
- Desktop Layoutを100dvh内へ固定し、Stage / Player / Timelineを維持したまま左右パネル内だけスクロールするよう調整。
- 初期言語を`navigator.language`から自動判定（`ja*`は日本語、それ以外は英語）。手動切替も維持。
- 関節・全身の編集は常に現在コマだけに限定し、「現在値を全コマへ適用」ボタンでのみ一括反映する安全な操作へ変更。
- 直前の一括適用を復元するUndoを追加。
- Editing Viewと固定Output Cameraを分離し、Stage内にCameraHelperによる画角モックと視点リセットを追加。
- 固定Output Cameraからの現在コマPNG出力と、Rig階層・Camera・全Frame Stateを含むJSON出力を追加。
- 全コマを固定Output Cameraから連番PNG（`frame-001.png`形式）としてレンダリングし、ブラウザ内でZIP出力する導線を追加。
- PNG/ZIP出力から選択マーカー、Grid、CameraHelper等のEditor専用表示を除外。
- ArrowLeft / ArrowRightで前後Frameへ移動可能。端ではLoop ONなら反対端へ、OFFなら端で停止。
- PlayerのPrevious / Nextを線なし三角、First / Lastを線付き三角として統一し、Lastボタンを追加。
- 一括適用専用Undoを廃止し、Pose回転・全身回転・Reset・全コマ適用・Frame追加/複製/削除を対象に最大50段のUndo / Redo履歴を追加。
- Sliderは1回のFocus操作を1履歴として記録し、ドラッグ中の大量履歴生成を防止。
- 外部3D Assetを追加せず、プリミティブで三脚付き業務用カメラMockを構築。Output Camera位置とCameraHelperに一致させた。
- Camera MockのLensをActor方向へ180度反転。再生中は自動非表示、Stage左上の「カメラ」ボタンから手動表示切替可能。
- 動作サンプルSelectorを追加。「歩く」と、JSON読込時の「読み込んだプロジェクト」を表示する。ZIP確認用の「激しい動作」は確認完了後に削除済み。
- 歩行サンプルの腕をY=60°基準、X=-100°〜-50°の反対振りへ修正し、肘を曲げて手を頭の斜め下へ配置。
- 全回転Sliderの中央に0°ガイドを追加し、Focus中は強調表示。
- ZIP出力時のFrame更新を`flushSync`で確定してから2 RAF待機し、同一画像が繰り返される問題へ対処。
- Project JSON読込を追加。Frame/Bone/Rotationを正規化し、欠損actorRotationは0で補完。不正データでは現在状態を維持。
- TimelineサムネイルのHTML Drag & Drop並べ替えを追加。選択Frame IDを維持し、Undo / Redo対象にした。
- Primitive Human Rig専用Shaderを追加。Rig Local +Zを正面、-Zを背面とし、背中側のMaterial明度を約58%まで段階的に落として前後を識別可能にした。外部Modelには適用しない。
- Rig Rest PoseをProject JSONの`rig.restPose`として保存・復元し、関節Resetを固定0°ではなくImport時Rest Rotationへ戻す処理へ変更。旧JSONでは0°を補完。
- 選択関節Markerへ0°基準のLocal Axisを追加（X=赤、Y=緑、Z=青）。選択Bone自身のQuaternionを打ち消すため、Bone回転後も親座標系の0°基準位置に残る。
- Local Axis直線を短く細い半透明Guideへ調整し、Marker球面の周囲へ正方向を示すXYZ色別の円弧矢印を追加。Editor専用で画像出力には含めない。
- Rotation円弧をさらに細線化（tube 0.006）し、直線Axisより円弧矢印をPrimary Guideに調整。
- Camera Control PanelをStage左上へ追加。Camera Mock表示切替、Output Camera一致視点、見下ろす3人称視点、Zoom 0.6x〜2.0、横16:9/縦9:16を操作可能。
- Output CameraをActor全身が収まりやすい`(0, 1.1, 8.2)`へ移動し、targetを`(0, 0.1, 0)`へ変更。Camera Mockも位置・下向き角度を同期。
- PNG/ZIPを選択比率の実寸（横1280x720 / 縦720x1280）で一時Renderして保存し、完了後Editor Canvas寸法を復元。
- Camera Zoom/RatioをProject JSONへ保存・復元。
- 3人称Editing ViewをOutput Camera Mockも視野に入る`(9, 6.8, 13)`へ変更。
- Camera View時に選択比率の実出力Frameを白細線＋オレンジCornerでOverlay表示。Frame内がOutput Camera FOVと一致するようStage寸法・Frame占有率からEditing Camera FOVを補正。
- Playback中、Frame Pose/Actor Rotation/Camera設定のSignatureが変わったFrameだけPNG Captureし、軽量JPEG Thumbnailへ縮小してTimelineへCache表示。未生成FrameはStick Figure fallback。
- ユーザー提供`pose-board-project-2.json`の8コマ歩行を基準に、脚を4コマShiftした左右対称の整数degreeへ整理。肩振りも左右対称・控えめな振幅へ修正。
- Walk Sampleの肩X回転を8点の正弦波状`[0,-18,-25,-18,0,18,25,18]`へ変更し、右肩を常に同量の逆符号として完全な逆位相にした。
- Camera ViewではOrbitControlsを無効化し、Drag/Scrollによる視点ずれを防止。画角変更はCamera Zoom Sliderのみに限定。
- ImageGenで地方都市の飲食店街を描いたPop Style背景を生成し、`public/backgrounds/local-city-street.png`へ保存。
- 背景画像をStage奥`z=-3`の18x10.125 Planeへ貼った固定2D書き割りとして実装。外部3D背景・奥行き編集は追加していない。
- Output Cameraを水平化。position/targetのYをともに1.1へ揃え、全身収容のためZを9.2へ後退。Camera Mockの下向き回転も解除。
- Camera View切替時にEditing Cameraのposition/up/lookAt/roll/FOVを明示的にOutput Cameraへ同期し、3人称Orbit姿勢の残留で書き割りが傾く可能性を除去。BackdropもRotation=0を明示。
- 書き割りの中心高を出力カメラの注視点（Y=1.1）へ揃え、最大ズームアウト0.60×・横長16:9の画角を覆う固定サイズへ拡大。1.00×ではその中央部分が見える。
- ESLint 9 flat configを追加し、`npm run lint`を実行可能にした。
- Camera設定Panelを初期状態で折り畳み、Camera Mock表示ボタンとは別のChevronで展開できるようにした。
- 再生開始時のEditing Viewを記憶してCamera Viewへ強制切替し、再生停止時は停止経路にかかわらず元のEditing Viewへ復帰するようにした。
- 画像背景をなし（透過）・地方都市・街の公園・リビングの4種へ拡張。公園とリビングはImageGen生成素材をProject内へ保存した。背景なし時だけ白・グレー・グリーンのStudio Backgroundを選択可能。
- 人型の体格プリセットを成人標準・成人細身・子ども・4頭身・2頭身の5種追加。既存Bone/Pose互換を維持した全身比率＋頭部比率変更とし、足元の接地位置を補正した。
- 背景・体格プリセットをProject JSONへ保存・復元する。
- 画像背景へ「なし（透過）」を追加。白・グレー・グリーンバックは独立したStudio Background設定へ分離し、OFFにすると選択済み画像背景へ戻る。画像背景とStudio Backgroundの両方をJSONへ保存・復元する。
- 背景競合を避けるためStudio Backgroundは画像背景が「なし」の時だけ選択可能に変更。画像背景選択時はStudio Backgroundを自動OFFにし、描画側でも画像背景を優先する。
- UI導線をScene設定→Joint選択/編集→Frame/Playback→File出力の順に整理。Headerの4出力ボタンはFile Menuへ、左Panelの体格・動作・背景群はScene設定Accordionへ集約し、どちらも初期状態で閉じる。
- 左PanelのJoint選択もSection全体をAccordion化し、初期状態を閉じる。展開後の部位Group単位の開閉状態は維持する。

## Why — なぜそうしたか

Pose BoardはBlender等の簡易版ではなく、3Dデッサン人形を使って短時間でコマ送りの絵コンテを作る専用ツールとするため。

中心ループは以下。

**Pose → Duplicate/Add → Adjust → Play**

高機能化より、このループの速さと分かりやすさを優先する。

## Where — どこを見ればよいか

最初に以下を読むこと。

1. `README.md`
2. `docs/DEVELOPMENT_RULES.md`
3. `docs/REQUIREMENTS.md`
4. `docs/FUNCTIONAL_SPEC.md`
5. `docs/UI_SPEC.md`
6. `docs/DATA_MODEL.md`
7. `docs/ARCHITECTURE.md`
8. `docs/ROADMAP.md`
9. この `HANDOFF.md`

仕様が衝突した場合は、プロダクト境界について `DEVELOPMENT_RULES.md` を優先し、実装範囲について `ROADMAP.md` の現在Phaseを優先する。

## What's Next — 次に何をするか

1. 整理後UIのDesktop/Mobile表示、File Menu、Scene/Joint Accordionを実機確認
2. 体格5種の接地・関節Marker位置と、画像/Studio/透過背景のPNG・ZIP出力を実機確認
3. 関節回転 → Frame複製 → 調整 → Playの中心操作感を継続確認
4. 実機確認で見つかった問題を修正

**Phase 1以降の機能を先回りして実装しないこと。**

---

## Changed Files

- `package.json`
- `package-lock.json`
- `index.html`
- `vite.config.ts`
- `eslint.config.js`
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `src/main.tsx`
- `src/App.tsx`
- `src/Stage.tsx`
- `src/Rig.tsx`
- `src/model.ts`
- `src/model.test.ts`
- `src/icons.tsx`
- `src/styles.css`
- `public/backgrounds/local-city-street.png`
- `public/backgrounds/neighborhood-park.png`
- `public/backgrounds/apartment-living-room.png`
- `README.md`
- `HANDOFF.md`

## Verification

- Runtime: Node.js v22.23.2 / npm v10.9.8（nvm）
- 依存導入: `npm install` 成功、262 packages、0 vulnerabilities
- ZIP出力用に`jszip`を追加。合計275 packages、0 vulnerabilities。
- Test: `npm test` 成功、1 file / 2 tests passed（2026-08-26再確認）
- Lint: `npm run lint` 成功（ESLint 9 flat config、2026-08-26確認）
- Build: `npm run build` 成功、598 modules transformed（2026-08-26再確認）
- HTTP check: 既存の`127.0.0.1:43127`からApp、公園背景、リビング背景がすべて200 OK（2026-08-26確認）
- Dev server: ユーザーが固定port 43127を管理。必要時に未起動ならAgent側で起動してよい。
- Manual check: ユーザーによる継続的なブラウザ確認あり。直近のUI Accordion整理後は最終確認待ち。

## Known Issues / Open Questions

- Rotation Limitは未設定（PoCでは -180°〜180°）。
- Touch操作時の関節選択とOrbitControlsの競合は実機確認が必要。
- PoCではOrbitControlsをEditing Viewとして利用。Output Camera Stateへの保存はしていない。
- Production bundleはThree.jsを含み約1.22 MB（gzip約342 KB）。Viteのchunk size warningあり。PoCでは許容し、必要ならPhase 1でcode splittingを検討。
- 開発サーバーはユーザー管理。Agentは確認に必要で未起動の場合のみ固定port 43127で起動する。
- ZIPの全FrameブラウザダウンロードはBuild確認済みだが、実ブラウザでのファイル内容確認は未実施。
- Timeline Drag & DropはDesktop向け。Mobile長押しDragは未実装。
- 歩行JSONは受領・整数degreeへの整理・左右対称化まで反映済み。最終的な見た目はManual Check後に微調整する。
- Thumbnail生成・Camera Mock再表示・Camera Frameの視覚確認はBuild済みだが実ブラウザManual Check未実施。

## Important Decisions

- FrameworkはTypeScript + React + Vite + React Three Fiberを選定。
- 回転は内部でradian、UI表示/入力はdegreeに統一。
- Frameは安定UUIDを持つ可変長配列とし、Pose複製はdeep copyする。

## Do Not Do

- Blenderのような本格3D Editorへ拡張しない。
- 3D背景を実装しない。
- AI画像/動画生成を内蔵しない。
- 自動中割りをPhase 0で実装しない。
- シームレスなCamera animationを実装しない。
- 8コマ固定のデータ構造にしない。

---

# Agent Handoff Template

以降の担当者は作業終了時、このテンプレートに沿って上部のCurrent Status以下を更新する。

```md
## Current Status
- Phase:
- Status:
- Last updated:
- Last agent:

## What — 何をしたか
- 

## Why — なぜそうしたか
- 

## Where — どこを変更したか
- `path/to/file`

## What's Next — 次に何をするか
1. 
2. 

## Changed Files
- 

## Verification
- 実行したcommand:
- Build:
- Test:
- Manual check:

## Known Issues / Open Questions
- 

## Important Decisions
- 

## Do Not Do / 注意事項
- 
```

## Handoff Rules

1. 作業終了前に必ず `HANDOFF.md` を更新する。
2. 作業途中で制限・エラー・時間切れになりそうな場合も、実装より先に現在地点を残す。
3. 「完了」と書く場合はVerificationを記載する。
4. 未確認事項を推測で「動作済み」にしない。
5. 次担当にチャット履歴の再読を要求しない。必要情報はRepository内へ残す。
6. 重要な設計変更を行った場合は該当docsも同時更新する。
7. 仕様と実装が食い違った場合は、差分を隠さずKnown IssuesまたはImportant Decisionsへ記録する。
