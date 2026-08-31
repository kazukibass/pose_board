import type { ThreeEvent } from '@react-three/fiber'
import { useMemo } from 'react'
import { Euler, Quaternion } from 'three'
import type { BoneName, Pose, Rotation } from './model'

type Props = { pose: Pose; actorRotation: Rotation; selected: BoneName; onSelect: (bone: BoneName) => void }
type PartProps = Pick<Props, 'pose' | 'selected' | 'onSelect'> & { bone: BoneName; children: React.ReactNode }

const body = '#9b7b61'
const limb = '#b28e70'
const joint = '#d0a98a'
const arcEnd = Math.PI * 1.65

function RotationArc({ color, rotation }: { color: string; rotation: [number, number, number] }) {
  return <group rotation={rotation}>
    <mesh><torusGeometry args={[.35, .006, 5, 40, arcEnd]} /><meshBasicMaterial color={color} transparent opacity={.82} depthTest={false} /></mesh>
    <mesh position={[Math.cos(arcEnd) * .35, Math.sin(arcEnd) * .35, 0]} rotation={[0, 0, arcEnd]}>
      <coneGeometry args={[.032, .085, 8]} /><meshBasicMaterial color={color} depthTest={false} />
    </mesh>
  </group>
}

function Part({ bone, pose, selected, onSelect, children }: PartProps) {
  const select = (event: ThreeEvent<PointerEvent>) => { event.stopPropagation(); onSelect(bone) }
  const inverseRotation = useMemo(() => {
    const rotation = pose[bone]
    const quaternion = new Quaternion().setFromEuler(new Euler(rotation.x, rotation.y, rotation.z)).invert()
    return [quaternion.x, quaternion.y, quaternion.z, quaternion.w] as [number, number, number, number]
  }, [bone, pose])
  return <group onPointerDown={select}>
    {children}
    {selected === bone && <group quaternion={inverseRotation} renderOrder={999} userData={{ editorOnly: true }}>
      <mesh><sphereGeometry args={[0.225, 20, 14]} /><meshBasicMaterial color="#ff9f2f" transparent opacity={0.28} depthTest={false} /></mesh>
      <mesh><torusGeometry args={[0.28, 0.035, 10, 28]} /><meshBasicMaterial color="#ff8a1f" depthTest={false} /></mesh>
      <mesh position={[.25, 0, 0]} rotation={[0, 0, -Math.PI / 2]}><cylinderGeometry args={[.008, .008, .5, 6]} /><meshBasicMaterial color="#ef4444" transparent opacity={.55} depthTest={false} /></mesh>
      <mesh position={[.52, 0, 0]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[.03, .08, 8]} /><meshBasicMaterial color="#ef4444" transparent opacity={.65} depthTest={false} /></mesh>
      <mesh position={[0, .25, 0]}><cylinderGeometry args={[.008, .008, .5, 6]} /><meshBasicMaterial color="#22b65c" transparent opacity={.55} depthTest={false} /></mesh>
      <mesh position={[0, .52, 0]}><coneGeometry args={[.03, .08, 8]} /><meshBasicMaterial color="#22b65c" transparent opacity={.65} depthTest={false} /></mesh>
      <mesh position={[0, 0, .25]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.008, .008, .5, 6]} /><meshBasicMaterial color="#3b82f6" transparent opacity={.55} depthTest={false} /></mesh>
      <mesh position={[0, 0, .52]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[.03, .08, 8]} /><meshBasicMaterial color="#3b82f6" transparent opacity={.65} depthTest={false} /></mesh>
      <RotationArc color="#ef4444" rotation={[0, Math.PI / 2, 0]} />
      <RotationArc color="#22b65c" rotation={[Math.PI / 2, 0, 0]} />
      <RotationArc color="#3b82f6" rotation={[0, 0, 0]} />
    </group>}
  </group>
}

function FrontLeg({ side, pose, selected, onSelect }: Props & { side: 'left' | 'right' }) {
  const sign = side === 'left' ? -1 : 1
  const shoulder = `${side}Shoulder` as BoneName
  const upper = `${side}UpperArm` as BoneName
  const lower = `${side}LowerArm` as BoneName
  const paw = `${side}Hand` as BoneName
  return <group position={[sign * .48, 0, 1]} rotation={Object.values(pose[shoulder]) as [number, number, number]}>
    <Part bone={shoulder} {...{ pose, selected, onSelect }}><mesh><sphereGeometry args={[.18, 16, 12]} /><meshStandardMaterial color={joint} /></mesh></Part>
    <group rotation={Object.values(pose[upper]) as [number, number, number]}>
      <Part bone={upper} {...{ pose, selected, onSelect }}><mesh position={[0, -.48, 0]}><capsuleGeometry args={[.13, .65, 5, 10]} /><meshStandardMaterial color={limb} /></mesh></Part>
      <group position={[0, -.98, 0]} rotation={Object.values(pose[lower]) as [number, number, number]}>
        <Part bone={lower} {...{ pose, selected, onSelect }}><mesh position={[0, -.42, 0]}><capsuleGeometry args={[.11, .55, 5, 10]} /><meshStandardMaterial color={limb} /></mesh></Part>
        <group position={[0, -.86, 0]} rotation={Object.values(pose[paw]) as [number, number, number]}>
          <Part bone={paw} {...{ pose, selected, onSelect }}><mesh position={[0, -.04, .12]}><boxGeometry args={[.3, .18, .46]} /><meshStandardMaterial color={joint} /></mesh></Part>
        </group>
      </group>
    </group>
  </group>
}

function RearLeg({ side, pose, selected, onSelect }: Props & { side: 'left' | 'right' }) {
  const sign = side === 'left' ? -1 : 1
  const upper = `${side}UpperLeg` as BoneName
  const lower = `${side}LowerLeg` as BoneName
  const paw = `${side}Foot` as BoneName
  return <group position={[sign * .48, 0, -1]} rotation={Object.values(pose[upper]) as [number, number, number]}>
    <Part bone={upper} {...{ pose, selected, onSelect }}><mesh><sphereGeometry args={[.19, 16, 12]} /><meshStandardMaterial color={joint} /></mesh></Part>
    <mesh position={[0, -.48, 0]}><capsuleGeometry args={[.14, .65, 5, 10]} /><meshStandardMaterial color={limb} /></mesh>
    <group position={[0, -.98, 0]} rotation={Object.values(pose[lower]) as [number, number, number]}>
      <Part bone={lower} {...{ pose, selected, onSelect }}><mesh position={[0, -.42, 0]}><capsuleGeometry args={[.12, .55, 5, 10]} /><meshStandardMaterial color={limb} /></mesh></Part>
      <group position={[0, -.86, 0]} rotation={Object.values(pose[paw]) as [number, number, number]}>
        <Part bone={paw} {...{ pose, selected, onSelect }}><mesh position={[0, -.04, .12]}><boxGeometry args={[.32, .18, .48]} /><meshStandardMaterial color={joint} /></mesh></Part>
      </group>
    </group>
  </group>
}

export function QuadrupedRig({ pose, actorRotation, selected, onSelect }: Props) {
  const props = { pose, actorRotation, selected, onSelect }
  return <group position={[0, -.28, 0]} rotation={Object.values(actorRotation) as [number, number, number]}>
    <group position={[0, .55, 0]} rotation={Object.values(pose.hip) as [number, number, number]}>
      <Part bone="hip" {...{ pose, selected, onSelect }}><mesh><boxGeometry args={[1.05, .72, 2.35]} /><meshStandardMaterial color={body} /></mesh></Part>
      <FrontLeg side="left" {...props} /><FrontLeg side="right" {...props} />
      <RearLeg side="left" {...props} /><RearLeg side="right" {...props} />
      <group position={[0, .08, 1.35]} rotation={Object.values(pose.neck) as [number, number, number]}>
        <Part bone="neck" {...{ pose, selected, onSelect }}><mesh rotation={[Math.PI / 2, 0, 0]}><capsuleGeometry args={[.2, .38, 5, 10]} /><meshStandardMaterial color={limb} /></mesh></Part>
        <group position={[0, .08, .58]} rotation={Object.values(pose.head) as [number, number, number]}>
          <Part bone="head" {...{ pose, selected, onSelect }}><mesh><sphereGeometry args={[.4, 20, 16]} /><meshStandardMaterial color={body} /></mesh><mesh position={[0, -.05, .38]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[.18, .45, 12]} /><meshStandardMaterial color={joint} /></mesh></Part>
        </group>
      </group>
      <group position={[0, .1, -1.35]} rotation={Object.values(pose.spine) as [number, number, number]}>
        <Part bone="spine" {...{ pose, selected, onSelect }}><mesh position={[0, .15, -.55]} rotation={[Math.PI / 2.5, 0, 0]}><capsuleGeometry args={[.09, .85, 4, 8]} /><meshStandardMaterial color={limb} /></mesh></Part>
      </group>
    </group>
  </group>
}
