# Pose Board — HANDOFF

## Current Status
- Active branch: `feature/quadruped-rig`
- Status: Common Quadruped Rig prototype implemented; Stage/UI integration and verification pending.
- Last updated: 2026-08-26
- Last agent: ChatGPT

## What
- `src/QuadrupedRig.tsx`: common dog/cat-compatible primitive quadruped template.
- Neutral: torso horizontal; four legs approximately 90 degrees downward.
- Primitive only: box/sphere/capsule/cone.
- Temporary adapter: Human Arm chains drive front legs; Human Leg chains drive rear legs.

## What's Next
1. Wire QuadrupedRig into Stage.
2. Add Rig Type selector Human / Quadruped, separate from Human Body Preset.
3. Persist Rig Type with old JSON defaulting to Human.
4. Verify Human -> Quadruped -> Human does not mutate Human poses.
5. Verify neutral geometry, joint rotation, playback, JSON, PNG/ZIP, Desktop/Mobile.
6. Run npm test / npm run lint / npm run build.
7. Update HANDOFF before PR/merge.

## Verification
Not run yet. Do not merge until integration and regression checks pass.

## Known Issues
- Stage/UI not wired yet.
- Human labels are temporary for the quadruped adapter.
- Tail editing is not required for v0.1.
- Dog/cat-specific pose presets are intentionally out of scope.
