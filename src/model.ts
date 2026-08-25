export type Axis = 'x' | 'y' | 'z'
export type Rotation = Record<Axis, number>
export type BoneName =
  | 'hip' | 'spine' | 'chest' | 'neck' | 'head'
  | 'leftShoulder' | 'leftUpperArm' | 'leftLowerArm' | 'leftHand'
  | 'rightShoulder' | 'rightUpperArm' | 'rightLowerArm' | 'rightHand'
  | 'leftUpperLeg' | 'leftLowerLeg' | 'leftFoot'
  | 'rightUpperLeg' | 'rightLowerLeg' | 'rightFoot'

export type Pose = Record<BoneName, Rotation>
export type Frame = { id: string; name: string; pose: Pose; actorRotation: Rotation }

export const boneNames: BoneName[] = [
  'hip', 'spine', 'chest', 'neck', 'head',
  'leftShoulder', 'leftUpperArm', 'leftLowerArm', 'leftHand',
  'rightShoulder', 'rightUpperArm', 'rightLowerArm', 'rightHand',
  'leftUpperLeg', 'leftLowerLeg', 'leftFoot',
  'rightUpperLeg', 'rightLowerLeg', 'rightFoot',
]

export const boneLabels: Record<BoneName, string> = {
  hip: 'Hip', spine: 'Spine', chest: 'Chest', neck: 'Neck', head: 'Head',
  leftShoulder: 'L Shoulder', leftUpperArm: 'L Upper Arm', leftLowerArm: 'L Forearm', leftHand: 'L Hand',
  rightShoulder: 'R Shoulder', rightUpperArm: 'R Upper Arm', rightLowerArm: 'R Forearm', rightHand: 'R Hand',
  leftUpperLeg: 'L Thigh', leftLowerLeg: 'L Shin', leftFoot: 'L Foot',
  rightUpperLeg: 'R Thigh', rightLowerLeg: 'R Shin', rightFoot: 'R Foot',
}

const zero = (): Rotation => ({ x: 0, y: 0, z: 0 })
export const createRotation = (): Rotation => zero()
export const createPose = (): Pose => Object.fromEntries(boneNames.map((name) => [name, zero()])) as Pose
export const clonePose = (pose: Pose): Pose => structuredClone(pose)
export const makeId = () => crypto.randomUUID()
