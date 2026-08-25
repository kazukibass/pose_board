# Pose Board — HANDOFF

このファイルはCodex / Claude / ChatGPT等、作業を担当するエージェント間の引き継ぎ用。

**作業を終了・中断する前に必ず更新すること。**
未完了でも現在地点を残す。次の担当者がチャット履歴を読み直さなくても再開できる状態を目標とする。

---

## Current Status

- Phase: Phase 0 — Technical PoC
- Status: 実装前 / 仕様策定済み
- Last updated: 2026-08-25
- Last agent: ChatGPT

## What — 何をしたか

- READMEおよびdocs配下にv0.1仕様を作成。
- Primitive Rig、Frame、Playback、2D Background、Overlay、Save/Load、Exportの方針を定義。
- Desktop/Mobile双方のUI要件を定義。
- Playback UIはSVGアイコンを用いた音楽プレイヤー型を採用。
- Phase 0ではHuman primitive rig → Pose → Frame保存/複製 → Flipbook再生までを通す方針。

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

Phase 0 Technical PoCを実装する。

最初のゴール:

1. Webアプリの最小構成を作る。
2. Three.jsでプリミティブHuman Rigを1体表示する。
3. 主要関節を選択してXYZ回転できるようにする。
4. 現在PoseをFrame Stateとして保存する。
5. Frameを複製できるようにする。
6. 複数FrameをTimelineに並べる。
7. SVGの音楽プレイヤー型UIから一定FPSでパラパラ再生する。
8. Desktop/Mobile双方で最低限操作可能か確認する。

**Phase 1以降の機能を先回りして実装しないこと。**

---

## Changed Files

現時点では仕様書のみ。

- `README.md`
- `docs/REQUIREMENTS.md`
- `docs/FUNCTIONAL_SPEC.md`
- `docs/UI_SPEC.md`
- `docs/DATA_MODEL.md`
- `docs/ARCHITECTURE.md`
- `docs/ROADMAP.md`
- `docs/DEVELOPMENT_RULES.md`
- `HANDOFF.md`

## Verification

- 実装前のためBuild/Test未実施。
- GitHub上への仕様書配置まで完了。

## Known Issues / Open Questions

- Frameworkの最終選定は未確定。TypeScript + React系 + Three.jsを推奨。
- Primitive Human Rigの具体的なBone数・Rotation LimitはPoCで調整する。
- Touch操作時の最適な関節操作方法はPoCで検証する。
- Editing ViewとOutput Cameraの分離は将来余地を確保するが、Phase 0で必須ではない。

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
