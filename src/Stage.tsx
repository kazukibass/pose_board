import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { ContactShadows, OrbitControls, useTexture } from '@react-three/drei'
import { CameraHelper, Object3D, PerspectiveCamera, SRGBColorSpace, Vector2, Vector3 } from 'three'
import type { BoneName, Pose, Rotation } from './model'
import { Rig, type RigPreset } from './Rig'

type OutputRatio = 'landscape' | 'portrait'
export type BackgroundPreset = 'none' | 'city' | 'park' | 'room'
export type StudioBackdrop = 'none' | 'white' | 'gray' | 'green'

const outputPosition = new Vector3(0, 1.1, 9.2)
const outputTarget = new Vector3(0, 1.1, 0)
const backdropDistance = outputPosition.z + 3
const widestOutputFov = 45 / .6
const backdropHeight = 2 * backdropDistance * Math.tan(widestOutputFov * Math.PI / 360)
const backdropWidth = backdropHeight * 16 / 9

function StageBackdrop({ preset, studio }: { preset: BackgroundPreset; studio: StudioBackdrop }) {
  const textures = useTexture([
    '/backgrounds/local-city-street.png',
    '/backgrounds/neighborhood-park.png',
    '/backgrounds/apartment-living-room.png',
  ])
  textures.forEach((texture) => { texture.colorSpace = SRGBColorSpace })
  const imageIndex = { city: 0, park: 1, room: 2 }[preset as 'city' | 'park' | 'room']
  const solidColors: Record<Exclude<StudioBackdrop, 'none'>, string> = { white: '#f8f8f4', gray: '#9ca3af', green: '#19a85b' }
  const activeStudio = preset === 'none' ? studio : 'none'
  if (activeStudio === 'none' && preset === 'none') return null
  return <mesh position={[0, outputTarget.y, -3]} rotation={[0, 0, 0]}>
    <planeGeometry args={[backdropWidth, backdropHeight]} />
    <meshBasicMaterial map={activeStudio === 'none' && imageIndex !== undefined ? textures[imageIndex] : null} color={activeStudio === 'none' ? 'white' : solidColors[activeStudio]} toneMapped={false} />
  </mesh>
}

function EditingCameraFov({ active, fov }: { active: boolean; fov: number }) {
  const { camera } = useThree()
  useEffect(() => {
    if (active && camera instanceof PerspectiveCamera) {
      camera.position.copy(outputPosition)
      camera.up.set(0, 1, 0)
      camera.lookAt(outputTarget)
      camera.rotation.z = 0
      camera.fov = fov
      camera.updateProjectionMatrix()
      camera.updateMatrixWorld()
    }
  }, [active, camera, fov])
  return null
}

function OutputCameraGuide({ onCaptureReady, visible, fov, ratio }: { onCaptureReady: (capture: () => string) => void; visible: boolean; fov: number; ratio: OutputRatio }) {
  const { gl, scene, camera: editingCamera } = useThree()
  const outputCamera = useMemo(() => {
    const camera = new PerspectiveCamera(45, 16 / 9, .1, 30)
    camera.position.copy(outputPosition)
    camera.lookAt(outputTarget)
    camera.updateMatrixWorld()
    return camera
  }, [])
  const helper = useMemo(() => new CameraHelper(outputCamera), [outputCamera])
  helper.userData.editorOnly = true
  helper.visible = visible

  useEffect(() => {
    outputCamera.fov = fov
    outputCamera.aspect = ratio === 'landscape' ? 16 / 9 : 9 / 16
    outputCamera.updateProjectionMatrix()
    helper.update()
  }, [fov, helper, outputCamera, ratio])

  useEffect(() => {
    onCaptureReady(() => {
      const outputSize = ratio === 'landscape' ? { width: 1280, height: 720 } : { width: 720, height: 1280 }
      const originalSize = gl.getSize(new Vector2())
      const originalPixelRatio = gl.getPixelRatio()
      const editorObjects: { visible: boolean; object: Object3D }[] = []
      scene.traverse((object) => {
        if (object.userData.editorOnly) {
          editorObjects.push({ visible: object.visible, object })
          object.visible = false
        }
      })
      gl.setPixelRatio(1)
      gl.setSize(outputSize.width, outputSize.height, false)
      gl.render(scene, outputCamera)
      const image = gl.domElement.toDataURL('image/png')
      editorObjects.forEach(({ object, visible }) => { object.visible = visible })
      gl.setPixelRatio(originalPixelRatio)
      gl.setSize(originalSize.x, originalSize.y, false)
      gl.render(scene, editingCamera)
      return image
    })
  }, [editingCamera, gl, onCaptureReady, outputCamera, ratio, scene])

  return <primitive object={helper} />
}

function StudioCameraMock() {
  return <group position={[0, 1.1, 9.2]} rotation={[0, 0, 0]} userData={{ editorOnly: true }}>
    <mesh><boxGeometry args={[1.05, .62, .78]} /><meshStandardMaterial color="#27303a" /></mesh>
    <mesh position={[0, .05, -.62]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.25, .32, .58, 20]} /><meshStandardMaterial color="#151b22" /></mesh>
    <mesh position={[0, .05, -.92]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.17, .22, .12, 20]} /><meshStandardMaterial color="#6287a6" metalness={.45} roughness={.25} /></mesh>
    <mesh position={[-.37, .47, .08]}><boxGeometry args={[.38, .25, .42]} /><meshStandardMaterial color="#36414d" /></mesh>
    <mesh position={[.68, .04, .08]}><boxGeometry args={[.3, .4, .08]} /><meshStandardMaterial color="#1c222b" /></mesh>
    <mesh position={[0, -.48, 0]}><cylinderGeometry args={[.18, .24, .34, 12]} /><meshStandardMaterial color="#303945" /></mesh>
    <mesh position={[-.42, -1.78, .05]} rotation={[0, 0, -.14]}><cylinderGeometry args={[.055, .08, 2.72, 10]} /><meshStandardMaterial color="#414b58" metalness={.55} /></mesh>
    <mesh position={[.42, -1.78, .05]} rotation={[0, 0, .14]}><cylinderGeometry args={[.055, .08, 2.72, 10]} /><meshStandardMaterial color="#414b58" metalness={.55} /></mesh>
    <mesh position={[0, -1.78, .3]} rotation={[-.14, 0, 0]}><cylinderGeometry args={[.055, .08, 2.72, 10]} /><meshStandardMaterial color="#414b58" metalness={.55} /></mesh>
  </group>
}

type StageProps = { pose: Pose; actorRotation: Rotation; selected: BoneName; onSelect: (bone: BoneName) => void; hint: string; resetViewLabel: string; overviewLabel: string; cameraLabel: string; zoomLabel: string; landscapeLabel: string; portraitLabel: string; outputZoom: number; outputRatio: OutputRatio; backgroundPreset: BackgroundPreset; studioBackdrop: StudioBackdrop; rigPreset: RigPreset; onZoomChange: (zoom: number) => void; onRatioChange: (ratio: OutputRatio) => void; showCamera: boolean; playing: boolean; onToggleCamera: () => void; onCaptureReady: (capture: () => string) => void }

export function Stage({ pose, actorRotation, selected, onSelect, hint, resetViewLabel, overviewLabel, cameraLabel, zoomLabel, landscapeLabel, portraitLabel, outputZoom, outputRatio, backgroundPreset, studioBackdrop, rigPreset, onZoomChange, onRatioChange, showCamera, playing, onToggleCamera, onCaptureReady }: StageProps) {
  const [viewMode, setViewMode] = useState<'camera' | 'overview'>('overview')
  const [cameraMenuOpen, setCameraMenuOpen] = useState(false)
  const [viewKey, setViewKey] = useState(0)
  const [stageSize, setStageSize] = useState({ width: 800, height: 500 })
  const stageRef = useRef<HTMLDivElement | null>(null)
  const viewBeforePlayback = useRef<'camera' | 'overview'>('overview')
  const wasPlaying = useRef(false)
  const cameraView = viewMode === 'camera'
  const resetView = (mode: 'camera' | 'overview') => { setViewMode(mode); setViewKey((key) => key + 1) }
  const editingPosition: [number, number, number] = cameraView ? [outputPosition.x, outputPosition.y, outputPosition.z] : [9, 6.8, 13]
  const editingTarget: [number, number, number] = cameraView ? [outputTarget.x, outputTarget.y, outputTarget.z] : [0, .4, 3.2]
  const outputAspect = outputRatio === 'landscape' ? 16 / 9 : 9 / 16
  const frameSize = useMemo(() => {
    const maxWidth = stageSize.width * .88
    const maxHeight = stageSize.height * .88
    return maxWidth / maxHeight > outputAspect ? { width: maxHeight * outputAspect, height: maxHeight } : { width: maxWidth, height: maxWidth / outputAspect }
  }, [outputAspect, stageSize])
  const outputFov = 45 / outputZoom
  const cameraViewFov = 2 * Math.atan(Math.tan(outputFov * Math.PI / 360) / (frameSize.height / stageSize.height)) * 180 / Math.PI

  useEffect(() => {
    if (!stageRef.current) return
    const observer = new ResizeObserver(([entry]) => setStageSize({ width: entry.contentRect.width, height: entry.contentRect.height }))
    observer.observe(stageRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (playing && !wasPlaying.current) {
      viewBeforePlayback.current = viewMode
      if (viewMode !== 'camera') resetView('camera')
    } else if (!playing && wasPlaying.current && viewMode !== viewBeforePlayback.current) {
      resetView(viewBeforePlayback.current)
    }
    wasPlaying.current = playing
  }, [playing, viewMode])

  return <div className="stage" ref={stageRef}>
    <Canvas key={`${viewMode}-${viewKey}`} camera={{ position: editingPosition, fov: cameraView ? cameraViewFov : 42 }} gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}>
      {(backgroundPreset !== 'none' || studioBackdrop !== 'none') && <color attach="background" args={['#dfe5ee']} />}
      <ambientLight intensity={1.8} />
      <directionalLight position={[4, 7, 5]} intensity={2.2} castShadow />
      <EditingCameraFov active={cameraView} fov={cameraViewFov} />
      <StageBackdrop preset={backgroundPreset} studio={studioBackdrop} />
      <Rig pose={pose} actorRotation={actorRotation} selected={selected} onSelect={onSelect} preset={rigPreset} />
      <OutputCameraGuide onCaptureReady={onCaptureReady} visible={showCamera && !cameraView} fov={outputFov} ratio={outputRatio} />
      {showCamera && !cameraView && <StudioCameraMock />}
      <ContactShadows position={[0, -2.28, 0]} opacity={.22} scale={8} blur={2.5} />
      <gridHelper args={[10, 20, '#bbc5d3', '#d1d8e2']} position={[0, -2.3, 0]} userData={{ editorOnly: true }} />
      <OrbitControls makeDefault enabled={!cameraView} target={editingTarget} enablePan={false} minDistance={5} maxDistance={20} />
    </Canvas>
    <div className="stage-hint">{hint}</div>
    {cameraView && <div className={`output-frame ${outputRatio}`} style={{ width: frameSize.width, height: frameSize.height }}><span>{outputRatio === 'landscape' ? '16:9 · 1280×720' : '9:16 · 720×1280'}</span></div>}
    <div className="camera-controls">
      <div className="camera-menu-heading"><button className={`camera-label ${showCamera ? 'active' : ''}`} aria-pressed={showCamera} onClick={onToggleCamera}>{cameraLabel}</button><button className="camera-menu-toggle" aria-expanded={cameraMenuOpen} aria-label={`${cameraLabel} menu`} onClick={() => setCameraMenuOpen((open) => !open)}>{cameraMenuOpen ? '⌃' : '⌄'}</button></div>
      {cameraMenuOpen && <div className="camera-panel">
        <div className="camera-view-actions"><button className={cameraView ? 'active' : ''} onClick={() => resetView('camera')}>{resetViewLabel}</button><button className={!cameraView ? 'active' : ''} onClick={() => resetView('overview')}>{overviewLabel}</button></div>
        <div className="ratio-switch"><button className={outputRatio === 'landscape' ? 'active' : ''} onClick={() => onRatioChange('landscape')}>{landscapeLabel}</button><button className={outputRatio === 'portrait' ? 'active' : ''} onClick={() => onRatioChange('portrait')}>{portraitLabel}</button></div>
        <label className="camera-zoom"><span>{zoomLabel}</span><input type="range" min="0.6" max="2" step="0.05" value={outputZoom} onChange={(event) => onZoomChange(Number(event.target.value))} /><output>{outputZoom.toFixed(2)}×</output></label>
      </div>}
    </div>
  </div>
}
