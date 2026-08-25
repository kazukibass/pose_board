import { ThreeEvent } from '@react-three/fiber'
import { useMemo } from 'react'
import { Euler, Quaternion } from 'three'
import type { BoneName, Pose, Rotation } from './model'

type Props = { pose: Pose; actorRotation: Rotation; selected: BoneName; onSelect: (bone: BoneName) => void }
type PartProps = { bone: BoneName; pose: Pose; selected: BoneName; onSelect: (bone: BoneName) => void; children: React.ReactNode }

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

const skin = '#f1b894'
const suit = '#6578d8'
const limb = '#8794df'

function shadeRigBack(shader: { vertexShader: string; fragmentShader: string }) {
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nvarying float vRigLocalZ;')
    .replace('#include <begin_vertex>', '#include <begin_vertex>\nvRigLocalZ = position.z;')
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', '#include <common>\nvarying float vRigLocalZ;')
    .replace('#include <color_fragment>', '#include <color_fragment>\nfloat rigFrontMix = smoothstep(-0.08, 0.08, vRigLocalZ);\ndiffuseColor.rgb *= mix(0.58, 1.0, rigFrontMix);')
}

function RigMaterial({ color }: { color: string }) {
  return <meshStandardMaterial color={color} onBeforeCompile={shadeRigBack} customProgramCacheKey={() => 'pose-board-rig-back-shading-v1'} />
}

function Arm({ side, pose, selected, onSelect }: Props & { side: 'left' | 'right' }) {
  const sign = side === 'left' ? -1 : 1
  const shoulder = `${side}Shoulder` as BoneName
  const upper = `${side}UpperArm` as BoneName
  const lower = `${side}LowerArm` as BoneName
  const hand = `${side}Hand` as BoneName
  return <group position={[sign * .7, .65, 0]} rotation={Object.values(pose[shoulder]) as [number, number, number]}>
    <Part bone={shoulder} {...{ pose, selected, onSelect }}><mesh><sphereGeometry args={[.19, 20, 16]} /><RigMaterial color={suit} /></mesh></Part>
    <group rotation={Object.values(pose[upper]) as [number, number, number]}>
      <Part bone={upper} {...{ pose, selected, onSelect }}><mesh position={[sign * .36, -.12, 0]} rotation={[0, 0, sign * Math.PI / 2]}><capsuleGeometry args={[.14, .55, 5, 12]} /><RigMaterial color={limb} /></mesh></Part>
      <group position={[sign * .72, -.24, 0]} rotation={Object.values(pose[lower]) as [number, number, number]}>
        <Part bone={lower} {...{ pose, selected, onSelect }}><mesh position={[sign * .34, 0, 0]} rotation={[0, 0, sign * Math.PI / 2]}><capsuleGeometry args={[.12, .5, 5, 12]} /><RigMaterial color={limb} /></mesh></Part>
        <group position={[sign * .7, 0, 0]} rotation={Object.values(pose[hand]) as [number, number, number]}>
          <Part bone={hand} {...{ pose, selected, onSelect }}><mesh><sphereGeometry args={[.15, 16, 12]} /><RigMaterial color={skin} /></mesh></Part>
        </group>
      </group>
    </group>
  </group>
}

function Leg({ side, pose, selected, onSelect }: Props & { side: 'left' | 'right' }) {
  const sign = side === 'left' ? -1 : 1
  const upper = `${side}UpperLeg` as BoneName
  const lower = `${side}LowerLeg` as BoneName
  const foot = `${side}Foot` as BoneName
  return <group position={[sign * .35, 1.15, 0]} rotation={Object.values(pose[upper]) as [number, number, number]}>
    <Part bone={upper} {...{ pose, selected, onSelect }}><mesh position={[0, -.58, 0]}><capsuleGeometry args={[.2, .78, 5, 12]} /><RigMaterial color="#39466f" /></mesh></Part>
    <group position={[0, -1.18, 0]} rotation={Object.values(pose[lower]) as [number, number, number]}>
      <Part bone={lower} {...{ pose, selected, onSelect }}><mesh position={[0, -.55, 0]}><capsuleGeometry args={[.16, .75, 5, 12]} /><RigMaterial color="#50608f" /></mesh></Part>
      <group position={[0, -1.1, 0]} rotation={Object.values(pose[foot]) as [number, number, number]}>
        <Part bone={foot} {...{ pose, selected, onSelect }}><mesh position={[0, -.06, .16]}><boxGeometry args={[.34, .22, .62]} /><RigMaterial color="#242b3d" /></mesh></Part>
      </group>
    </group>
  </group>
}

export function Rig(props: Props) {
  const { pose, actorRotation, selected, onSelect } = props
  return <group rotation={Object.values(actorRotation) as [number, number, number]}>
    <group position={[0, -1.05, 0]} rotation={Object.values(pose.hip) as [number, number, number]}>
    <Part bone="hip" {...{ pose, selected, onSelect }}><mesh position={[0, 1.25, 0]}><boxGeometry args={[.75, .45, .48]} /><RigMaterial color="#39466f" /></mesh></Part>
    <Leg side="left" {...props} /><Leg side="right" {...props} />
    <group position={[0, 1.45, 0]} rotation={Object.values(pose.spine) as [number, number, number]}>
      <Part bone="spine" {...{ pose, selected, onSelect }}><mesh position={[0, .35, 0]}><capsuleGeometry args={[.31, .4, 5, 12]} /><RigMaterial color={suit} /></mesh></Part>
      <group position={[0, .65, 0]} rotation={Object.values(pose.chest) as [number, number, number]}>
        <Part bone="chest" {...{ pose, selected, onSelect }}><mesh position={[0, .35, 0]}><boxGeometry args={[1.15, .75, .48]} /><RigMaterial color={suit} /></mesh></Part>
        <Arm side="left" {...props} /><Arm side="right" {...props} />
        <group position={[0, .84, 0]} rotation={Object.values(pose.neck) as [number, number, number]}>
          <Part bone="neck" {...{ pose, selected, onSelect }}><mesh><cylinderGeometry args={[.16, .18, .3, 16]} /><RigMaterial color={skin} /></mesh></Part>
          <group position={[0, .43, 0]} rotation={Object.values(pose.head) as [number, number, number]}>
            <Part bone="head" {...{ pose, selected, onSelect }}><mesh><sphereGeometry args={[.43, 24, 18]} /><RigMaterial color={skin} /></mesh><mesh position={[0, -.02, .41]}><coneGeometry args={[.08, .2, 12]} /><RigMaterial color={skin} /></mesh></Part>
          </group>
        </group>
      </group>
    </group>
    </group>
  </group>
}
