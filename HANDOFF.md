# Pose Board — HANDOFF

## Current Status
- Active branch: `feature/quadruped-rig`
- Status: Common Quadruped Rig prototype implemented on branch; Stage/UI integration and verification pending.
- Last updated: 2026-08-26
- Last agent: ChatGPT

## What
- Added `src/QuadrupedRig.tsx` as a common dog/cat-compatible primitive quadruped template.
- Neutral geometry keeps the torso horizontal and all four legs approximately 90 degrees downward.
- Uses only simple primitives (box/sphere/capsule/cone).
- Reuses current Human Pose bone names temporarily as an adapter: Arm chains drive front legs; Leg chains drive rear legs.

## Why
The current `BoneName` and `Pose` schema is Human-specific and is already used by Frame, Undo/Redo, JSON import/export and playback. The quadruped visual prototype is isolated first so those systems are not broken by a premature schema migration.

## Where
- `src/QuadrupedRig.tsx` — implemented prototype.
- Inspect next: `src/Stage.tsx`, `src/App.tsx`, `src/model.ts`, `src/Rig.tsx`.

## What's Next
1. Wire `QuadrupedRig` into Stage.
2. Add a Rig Type selector: Human / Quadruped.
3. Keep Human Body Preset selector separate (Adult/Slender/Child/Chibi4/Chibi2).
4. Persist Rig Type in Project JSON with backward compatibility (missing value => Human).
5. Verify Human -> Quadruped -> Human does not mutate Human poses.
6. Verify quadruped neutral: horizontal torso + four vertical legs.
7. Verify joint rotation, frame duplicate/playback, PNG/ZIP and JSON.
8. Verify Desktop and Mobile Drawer UI.
9. Run `npm test`, `npm run lint`, `npm run build`.
10. Update HANDOFF with results before opening/merging PR.

## Changed Files
- `src/QuadrupedRig.tsx`
- `HANDOFF.md`

## Verification
- Build: not run yet.
- Lint: not run yet.
- Test: not run yet.
- Manual: not run yet; component is intentionally not wired to Stage until the next verification step.

## Known Issues
- Stage/UI does not yet expose the Quadruped prototype.
- Human bone labels are not appropriate for quadruped; do not solve this by breaking the existing Human schema.
- Tail has no dedicated bone in the current schema and is not required for v0.1 editing.
- Dog/cat-specific pose presets are intentionally out of scope; user will create poses.

## Important Decisions
- One common Quadruped Rig, not separate dog/cat rigs for now.
- Neutral only is supplied: torso horizontal, legs down.
- Pose Lab/IK remains post-v0.1 Experimental work.
- Do not merge this branch until integration and regression checks pass.
