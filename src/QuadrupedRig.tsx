import { ThreeEvent } from '@react-three/fiber'
import type { BoneName, Pose, Rotation } from './model'

type Props = { pose: Pose; actorRotation: Rotation; selected: BoneName; onSelect: (bone: BoneName) => void }
type PartProps = { bone: BoneName; pose: Pose; selected: BoneName; onSelect: (bone: BoneName) => void; children: React.ReactNode }

const body = '#9b7b61'
const limb = '#b28e70'
const joint = '#d0a98a'

function Part({ bone, pose, selected, onSelect, children }: PartProps) {
  const select = (event: ThreeEvent<PointerEvent>) => { event.stopPropagation(); onSelect(bone) }
  return <group onPointerDown={select}>
    {children}
    {selected === bone && <mesh renderOrder={999} userData={{ editorOnly: true }}>
      <sphereGeometry args={[.22, 18, 14]} />
      <meshBasicMaterial color="#ff8a1f" transparent opacity={.45} depthTest={false} />
    </mesh>}
  </group>
}

function FrontLeg({ side, pose, selected, onSelect }: Props & { side: 'left' | 'right' }) {
  const sign = side === 'left' ? -1 : 1
  const shoulder = `${side}Shoulder` as BoneName
  const upper = `${side}UpperArm` as BoneName
  const lower = `${side}LowerArm` as BoneName
  const paw = `${side}Hand` as BoneName
  return <group position={[sign * .48, 0, 1.0]} rotation={Object.values(pose[shoulder]) as [number, number, number]}>
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
  return <group position={[sign * .48, 0, -1.0]} rotation={Object.values(pose[upper]) as [number, number, number]}>
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
  return <group position={[0, -.28, 0]} rotation={Object.values(actorRotation) as [number, number, number]}>
    <group position={[0, .55, 0]} rotation={Object.values(pose.hip) as [number, number, number]}>
      <Part bone="hip" {...{ pose, selected, onSelect }}><mesh><boxGeometry args={[1.05, .72, 2.35]} /><meshStandardMaterial color={body} /></mesh></Part>
      <FrontLeg side="left" {...{ pose, actorRotation, selected, onSelect }} />
      <FrontLeg side="right" {...{ pose, actorRotation, selected, onSelect }} />
      <RearLeg side="left" {...{ pose, actorRotation, selected, onSelect }} />
      <RearLeg side="right" {...{ pose, actorRotation, selected, onSelect }} />
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
