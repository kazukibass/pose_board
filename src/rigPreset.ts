import type { RigPreset } from './Rig'

export const rigPresets: readonly RigPreset[] = ['adult', 'slender', 'child', 'chibi4', 'chibi2', 'quadruped']

// Legacy projects without a recognized preset must load as the default human rig,
// not whichever rig happens to be selected before import.
export const normalizeRigPreset = (value: unknown): RigPreset =>
  rigPresets.find((preset) => preset === value) ?? 'adult'
