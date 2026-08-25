# Pose Board 開発原則

## 1. Blenderを作らない

機能追加時は必ず「絵コンテを速く作るために必要か」を判断する。

高度な3D制作機能が欲しい場合は、Pose Boardへ追加するより外部ツールで作成して取り込む方法を優先する。

## 2. 最短操作を守る

中心ループ:

**Pose → Duplicate/Add → Adjust → Play**

このループの操作数・待ち時間を増やす変更は慎重に扱う。

## 3. 3Dは必要最小限

3D:
- Actor
- 将来のProps / Imported Model

2D:
- Background
- Text
- Bubble
- Timeline
- Comic Page

## 4. 背景を3D化しない

斜めの背景が必要なら、その角度の画像をユーザーが用意する。

背景はTransparent / Color / ImageのBackdropで完結させる。

## 5. AI生成を本体へ入れない

Pose Boardの責任範囲は構図・ポーズ・コマ・絵コンテの作成と出力まで。

生成物をどのAI・作画・外注工程へ渡すかはユーザーに委ねる。

## 6. コマ数を製品仕様で固定しない

8コマ等はPreset/Exampleであり、データ構造は可変長。

## 7. Frameは画像ではなくScene State

Poseを後から編集できることを守る。

## 8. 将来機能は余白だけ確保する

中割り、漫画ページ、複数カメラ、外部3Dモデル等を想定するが、そのために現在のUIを複雑化しない。

## 9. ローカルファースト

可能な限りユーザーの素材をブラウザ内で処理する。

## 10. 機能追加チェック

新機能を追加する前に以下を確認する。

- 絵コンテ作成速度を上げるか？
- 初見ユーザーの理解を妨げないか？
- 既存の中心ループを壊さないか？
- 外部ツールに任せた方が良くないか？
- v0.1で本当に必要か？

## 11. Agent Handoffは必須

Codex / Claude / ChatGPT等、担当エージェントは作業を終了または中断する前に、Repository rootの `HANDOFF.md` を必ず更新する。

最低限、4Wを残す。

- **What**: 何をしたか
- **Why**: なぜそうしたか
- **Where**: どのファイル・箇所を変更したか
- **What's Next**: 次に何をするか

加えて以下を記録する。

- Changed Files
- Verification（Build / Test / Manual check）
- Known Issues / Open Questions
- Important Decisions
- 次担当への注意事項

未完了でも現在地点を残す。制限・エラー・時間切れが予想される場合は、実装を続けて記録を失うより `HANDOFF.md` の更新を優先する。

次担当者が過去のチャット履歴を再読しなくてもRepositoryだけで作業を再開できる状態を完成条件とする。

重要な設計変更を行った場合は `HANDOFF.md` だけでなく、対応する `docs/` も同時に更新する。
