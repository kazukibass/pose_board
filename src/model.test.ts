import { describe, expect, it } from 'vitest'
import { clonePose, createPose } from './model'

describe('pose model', () => {
  it('creates independent bone rotations', () => {
    const pose = createPose()
    pose.head.x = 1
    expect(pose.hip.x).toBe(0)
  })

  it('deep clones a frame pose', () => {
    const source = createPose()
    const copy = clonePose(source)
    copy.leftUpperArm.z = 1
    expect(source.leftUpperArm.z).toBe(0)
  })
})
