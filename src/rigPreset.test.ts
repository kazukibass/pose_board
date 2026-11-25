import { describe, expect, it } from 'vitest'
import { normalizeRigPreset } from './rigPreset'

describe('project rig preset import', () => {
  it.each(['adult', 'slender', 'child', 'chibi4', 'chibi2', 'quadruped'])(
    'preserves valid preset %s through a JSON round trip',
    (preset) => {
      const project = JSON.parse(JSON.stringify({ rig: { presetId: preset } }))
      expect(normalizeRigPreset(project.rig.presetId)).toBe(preset)
    },
  )

  it.each([undefined, null, 'future-rig', '', 0, {}, ['quadruped']].map((preset) => ({ preset })))(
    'falls back to the adult rig for missing or unrecognized preset $preset',
    ({ preset }) => {
      expect(normalizeRigPreset(preset)).toBe('adult')
    },
  )

  it('normalizes a legacy JSON project without presetId as human after quadruped', () => {
    expect(normalizeRigPreset('quadruped')).toBe('quadruped')
    const legacy = JSON.parse('{"rig":{"type":"primitive-rig"}}')
    expect(normalizeRigPreset(legacy.rig.presetId)).toBe('adult')
  })
})
