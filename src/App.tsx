import { useEffect, useMemo, useRef, useState } from 'react'
import JSZip from 'jszip'
import { flushSync } from 'react-dom'
import { Stage, type BackgroundPreset, type StudioBackdrop } from './Stage'
import type { RigPreset } from './Rig'
import { Icon } from './icons'
import { Axis, BoneName, boneLabels, boneNames, clonePose, createPose, createRotation, makeId, type Frame, type Pose, type Rotation } from './model'

type Language = 'en' | 'ja'
type BoneGroup = 'face' | 'leftArm' | 'rightArm' | 'body' | 'leftLeg' | 'rightLeg'
type SampleId = 'walk' | 'custom'
type OutputRatio = 'landscape' | 'portrait'

const boneGroups: Record<BoneGroup, { root: BoneName; bones: BoneName[] }> = {
  face: { root: 'neck', bones: ['neck', 'head'] },
  leftArm: { root: 'leftShoulder', bones: ['leftShoulder', 'leftUpperArm', 'leftLowerArm', 'leftHand'] },
  rightArm: { root: 'rightShoulder', bones: ['rightShoulder', 'rightUpperArm', 'rightLowerArm', 'rightHand'] },
  body: { root: 'hip', bones: ['hip', 'spine', 'chest'] },
  leftLeg: { root: 'leftUpperLeg', bones: ['leftUpperLeg', 'leftLowerLeg', 'leftFoot'] },
  rightLeg: { root: 'rightUpperLeg', bones: ['rightUpperLeg', 'rightLowerLeg', 'rightFoot'] },
}

const japaneseBoneLabels: Record<BoneName, string> = {
  hip: '腰', spine: '背骨', chest: '胸', neck: '首', head: '頭',
  leftShoulder: '左肩', leftUpperArm: '左上腕', leftLowerArm: '左前腕', leftHand: '左手',
  rightShoulder: '右肩', rightUpperArm: '右上腕', rightLowerArm: '右前腕', rightHand: '右手',
  leftUpperLeg: '左太もも', leftLowerLeg: '左すね', leftFoot: '左足',
  rightUpperLeg: '右太もも', rightLowerLeg: '右すね', rightFoot: '右足',
}

const copy = {
  en: { tagline: 'Pose → Duplicate → Adjust → Play', rig: 'Rig', human: 'Human · 01', samples: 'Motion sample', walk: 'Walk cycle', custom: 'Imported project', selected: 'Selected joint', jointRotation: 'Joint rotation', actorRotation: 'Whole-body rotation', currentFrame: 'Current frame', applyAll: 'Apply to all frames', undo: 'Undo', redo: 'Redo', resetJoint: 'Reset joint', resetActor: 'Reset whole body', resetView: 'Reset to camera', overview: 'Third-person view', camera: 'Camera', zoom: 'Zoom', landscape: 'Landscape 16:9', portrait: 'Portrait 9:16', hint: 'Drag to orbit · Click a body part', tip: 'Edits affect only the current frame. Use Apply to all frames when intended.', loop: 'Loop', frames: 'Frames', total: 'total', duplicate: 'Duplicate', add: 'Add', remove: 'Delete', first: 'First frame', last: 'Last frame', previous: 'Previous frame', next: 'Next frame', play: 'Play', pause: 'Pause', fps: 'Frames per second', exportPng: 'Current PNG', exportZip: 'All PNGs ZIP', exportJson: 'Project JSON', importJson: 'Load JSON', importError: 'Could not load this project JSON.', exporting: 'Exporting…', groups: { face: 'Face', leftArm: 'Left arm', rightArm: 'Right arm', body: 'Body', leftLeg: 'Left leg', rightLeg: 'Right leg' } },
  ja: { tagline: 'ポーズ → 複製 → 調整 → 再生', rig: 'リグ', human: '人型 · 01', samples: '動作サンプル', walk: '歩く', custom: '読み込んだプロジェクト', selected: '選択中の関節', jointRotation: '関節の回転', actorRotation: '全身の回転', currentFrame: '現在のコマ', applyAll: '現在値を全コマへ適用', undo: '戻る', redo: '進む', resetJoint: '関節をリセット', resetActor: '全身回転をリセット', resetView: 'カメラ視点へ戻す', overview: '見下ろす3人称視点', camera: 'カメラ', zoom: 'ズーム', landscape: '横長 16:9', portrait: '縦長 9:16', hint: 'ドラッグで視点移動 · 体をクリックして選択', tip: '編集は現在のコマだけに反映されます。必要な場合だけ全コマへ適用してください。', loop: 'ループ', frames: 'コマ', total: 'コマ', duplicate: '複製', add: '追加', remove: '削除', first: '先頭のコマ', last: '最後のコマ', previous: '前のコマ', next: '次のコマ', play: '再生', pause: '一時停止', fps: 'フレームレート', exportPng: '現在コマPNG', exportZip: '全コマZIP', exportJson: 'プロジェクトJSON', importJson: 'JSON読込', importError: 'このプロジェクトJSONを読み込めませんでした。', exporting: '出力中…', groups: { face: '顔', leftArm: '左腕', rightArm: '右腕', body: '体', leftLeg: '左足', rightLeg: '右足' } },
} as const

const presetLabels = {
  en: {
    rig: { adult: 'Adult', slender: 'Slender adult', child: 'Child', chibi4: '4-head chibi', chibi2: '2-head chibi' },
    background: { none: 'None (transparent)', city: 'Regional city', park: 'Neighborhood park', room: 'Living room' },
    studio: { none: 'Off', white: 'White', gray: 'Gray', green: 'Green screen' },
    rigPreset: 'Body preset', backgroundPreset: 'Background', studioBackdrop: 'Studio backdrop',
  },
  ja: {
    rig: { adult: '成人・標準', slender: '成人・細身', child: '子ども', chibi4: '4頭身', chibi2: '2頭身' },
    background: { none: 'なし（透過）', city: '地方都市', park: '街の公園', room: 'リビング' },
    studio: { none: 'OFF', white: '白', gray: 'グレー', green: 'グリーンバック' },
    rigPreset: '体格プリセット', backgroundPreset: '背景', studioBackdrop: 'スタジオ背景',
  },
} as const

const navigationLabels = {
  en: { file: 'File', project: 'Project', images: 'Image export', sceneSetup: 'Scene setup', joints: 'Joint selection' },
  ja: { file: 'ファイル', project: 'プロジェクト', images: '画像出力', sceneSetup: 'シーン設定', joints: '関節選択' },
} as const

const rigPresets: RigPreset[] = ['adult', 'slender', 'child', 'chibi4', 'chibi2']
const backgroundPresets: BackgroundPreset[] = ['none', 'city', 'park', 'room']
const studioBackdrops: StudioBackdrop[] = ['none', 'white', 'gray', 'green']

const radians = (degrees: number) => degrees * Math.PI / 180

const walkPose = (index: number): Pose => {
  const pose = createPose()
  const leftUpperLeg = [0, 20, 30, 10, -30, -45, -50, -25]
  const leftLowerLeg = [7, 7, 7, 30, 45, 45, 65, 35]
  const leftFoot = [-8, -18, -22, -22, -22, -22, -22, -6]
  const leftShoulder = [0, -18, -25, -18, 0, 18, 25, 18]
  const opposite = (values: number[]) => values[(index + 4) % 8]

  pose.leftUpperLeg.x = radians(leftUpperLeg[index])
  pose.rightUpperLeg.x = radians(opposite(leftUpperLeg))
  pose.leftLowerLeg.x = radians(leftLowerLeg[index])
  pose.rightLowerLeg.x = radians(opposite(leftLowerLeg))
  pose.leftFoot.x = radians(leftFoot[index])
  pose.rightFoot.x = radians(opposite(leftFoot))

  pose.leftShoulder.x = radians(leftShoulder[index])
  pose.rightShoulder.x = radians(-leftShoulder[index])
  pose.leftShoulder.y = radians(-5)
  pose.rightShoulder.y = radians(5)
  pose.leftShoulder.z = radians(55)
  pose.rightShoulder.z = radians(-55)
  pose.leftLowerArm.y = radians(70)
  pose.rightLowerArm.y = radians(-70)
  pose.leftLowerArm.z = radians(12)
  pose.rightLowerArm.z = radians(-12)

  const bodySway = [4, 3, 0, -3, -4, -3, 0, 3][index]
  pose.hip.z = radians(bodySway)
  pose.chest.z = radians(-bodySway * .75)
  pose.spine.x = radians(3)
  pose.head.y = radians(-bodySway * .5)
  return pose
}

const initialFrames = (): Frame[] => Array.from({ length: 8 }, (_, index) => ({
  id: makeId(),
  name: `Walk ${index + 1}`,
  pose: walkPose(index),
  actorRotation: createRotation(),
}))

const normalizeRotation = (value: unknown): Rotation => {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const number = (axis: Axis) => typeof source[axis] === 'number' && Number.isFinite(source[axis]) ? source[axis] : 0
  return { x: number('x'), y: number('y'), z: number('z') }
}

const normalizeFrame = (value: unknown, index: number): Frame => {
  if (!value || typeof value !== 'object') throw new Error('Invalid frame')
  const source = value as Record<string, unknown>
  const poseSource = source.pose && typeof source.pose === 'object' ? source.pose as Record<string, unknown> : {}
  const pose = createPose()
  boneNames.forEach((bone) => { pose[bone] = normalizeRotation(poseSource[bone]) })
  return {
    id: typeof source.id === 'string' && source.id ? source.id : makeId(),
    name: typeof source.name === 'string' ? source.name : `Frame ${index + 1}`,
    pose,
    actorRotation: normalizeRotation(source.actorRotation),
  }
}

const makeThumbnail = (source: string, ratio: OutputRatio) => new Promise<string>((resolve, reject) => {
  const image = new Image()
  image.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = ratio === 'landscape' ? 160 : 90
    canvas.height = ratio === 'landscape' ? 90 : 160
    const context = canvas.getContext('2d')
    if (!context) { reject(new Error('Canvas is unavailable')); return }
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    resolve(canvas.toDataURL('image/jpeg', .72))
  }
  image.onerror = () => reject(new Error('Thumbnail image could not be decoded'))
  image.src = source
})

export function App() {
  const [frames, setFrames] = useState<Frame[]>(initialFrames)
  const [current, setCurrent] = useState(0)
  const [selectedBone, setSelectedBone] = useState<BoneName>('leftUpperArm')
  const [playing, setPlaying] = useState(false)
  const [loop, setLoop] = useState(true)
  const [fps, setFps] = useState(6)
  const [language, setLanguage] = useState<Language>(() => navigator.language.toLowerCase().startsWith('ja') ? 'ja' : 'en')
  const [historyPast, setHistoryPast] = useState<Frame[][]>([])
  const [historyFuture, setHistoryFuture] = useState<Frame[][]>([])
  const [exporting, setExporting] = useState(false)
  const [sampleId, setSampleId] = useState<SampleId>('walk')
  const [cameraVisible, setCameraVisible] = useState(true)
  const [outputZoom, setOutputZoom] = useState(1)
  const [outputRatio, setOutputRatio] = useState<OutputRatio>('landscape')
  const [rigPreset, setRigPreset] = useState<RigPreset>('adult')
  const [backgroundPreset, setBackgroundPreset] = useState<BackgroundPreset>('city')
  const [studioBackdrop, setStudioBackdrop] = useState<StudioBackdrop>('none')
  const [setupOpen, setSetupOpen] = useState(false)
  const [jointsOpen, setJointsOpen] = useState(false)
  const [restPose, setRestPose] = useState<Pose>(() => createPose())
  const [thumbnails, setThumbnails] = useState<Record<string, { signature: string; source: string }>>({})
  const [openGroups, setOpenGroups] = useState<Record<BoneGroup, boolean>>({ face: true, leftArm: true, rightArm: false, body: true, leftLeg: false, rightLeg: false })
  const capturePngRef = useRef<(() => string) | null>(null)
  const importInputRef = useRef<HTMLInputElement | null>(null)
  const editInProgress = useRef(false)
  const dragFrameIndex = useRef<number | null>(null)
  const frame = frames[current]
  const text = copy[language]
  const labels = language === 'ja' ? japaneseBoneLabels : boneLabels
  const presets = presetLabels[language]
  const navigation = navigationLabels[language]

  useEffect(() => {
    if (!playing || frames.length < 2) return
    const timer = window.setInterval(() => setCurrent((index) => {
      if (index < frames.length - 1) return index + 1
      if (loop) return 0
      setPlaying(false); return index
    }), 1000 / fps)
    return () => window.clearInterval(timer)
  }, [playing, fps, loop, frames.length])

  useEffect(() => {
    if (!playing || exporting || !capturePngRef.current) return
    const signature = JSON.stringify({ pose: frame.pose, actorRotation: frame.actorRotation, outputZoom, outputRatio })
    if (thumbnails[frame.id]?.signature === signature) return
    let cancelled = false
    const update = async () => {
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
      const image = capturePngRef.current?.()
      if (!image || cancelled) return
      try {
        const source = await makeThumbnail(image, outputRatio)
        if (!cancelled) setThumbnails((items) => ({ ...items, [frame.id]: { signature, source } }))
      } catch { /* Keep the fallback thumbnail. */ }
    }
    void update()
    return () => { cancelled = true }
  }, [exporting, frame, outputRatio, outputZoom, playing, thumbnails])

  const rotation = frame.pose[selectedBone]
  const degrees = useMemo(() => ({ x: Math.round(rotation.x * 180 / Math.PI), y: Math.round(rotation.y * 180 / Math.PI), z: Math.round(rotation.z * 180 / Math.PI) }), [rotation])
  const actorDegrees = useMemo(() => ({ x: Math.round(frame.actorRotation.x * 180 / Math.PI), y: Math.round(frame.actorRotation.y * 180 / Math.PI), z: Math.round(frame.actorRotation.z * 180 / Math.PI) }), [frame.actorRotation])

  const rotate = (axis: Axis, value: number) => setFrames((items) => items.map((item, index) => index === current ? {
    ...item, pose: { ...item.pose, [selectedBone]: { ...item.pose[selectedBone], [axis]: value * Math.PI / 180 } },
  } : item))
  const rotateActor = (axis: Axis, value: number) => setFrames((items) => items.map((item, index) => index === current ? {
    ...item, actorRotation: { ...item.actorRotation, [axis]: radians(value) },
  } : item))
  const recordHistory = () => { setHistoryPast((items) => [...items.slice(-49), structuredClone(frames)]); setHistoryFuture([]) }
  const beginHistoryEdit = () => { if (!editInProgress.current) { recordHistory(); editInProgress.current = true } }
  const endHistoryEdit = () => { editInProgress.current = false }
  const undo = () => {
    if (!historyPast.length) return
    const previous = historyPast.at(-1)!
    setHistoryFuture((items) => [structuredClone(frames), ...items].slice(0, 50))
    setHistoryPast((items) => items.slice(0, -1)); setFrames(structuredClone(previous)); setCurrent((index) => Math.min(index, previous.length - 1)); setPlaying(false)
  }
  const redo = () => {
    if (!historyFuture.length) return
    const next = historyFuture[0]
    setHistoryPast((items) => [...items.slice(-49), structuredClone(frames)])
    setHistoryFuture((items) => items.slice(1)); setFrames(structuredClone(next)); setCurrent((index) => Math.min(index, next.length - 1)); setPlaying(false)
  }
  const loadWalkSample = () => { setSampleId('walk'); setFrames(initialFrames()); setRestPose(createPose()); setThumbnails({}); setHistoryPast([]); setHistoryFuture([]); setCurrent(0); setPlaying(false) }
  const importJson = async (file: File) => {
    try {
      const source = JSON.parse(await file.text()) as Record<string, unknown>
      if (!Array.isArray(source.frames) || !source.frames.length) throw new Error('Frames are required')
      const importedFrames = source.frames.map(normalizeFrame)
      const playback = source.playback && typeof source.playback === 'object' ? source.playback as Record<string, unknown> : {}
      const rig = source.rig && typeof source.rig === 'object' ? source.rig as Record<string, unknown> : {}
      const restSource = rig.restPose && typeof rig.restPose === 'object' ? rig.restPose as Record<string, unknown> : {}
      const importedRestPose = createPose()
      boneNames.forEach((bone) => { importedRestPose[bone] = normalizeRotation(restSource[bone]) })
      setFrames(importedFrames); setRestPose(importedRestPose); setThumbnails({}); setCurrent(0); setPlaying(false); setSampleId('custom'); setHistoryPast([]); setHistoryFuture([])
      if (typeof playback.fps === 'number' && Number.isFinite(playback.fps)) setFps(Math.max(1, Math.min(60, playback.fps)))
      if (typeof playback.loop === 'boolean') setLoop(playback.loop)
      const camera = Array.isArray(source.cameras) && source.cameras[0] && typeof source.cameras[0] === 'object' ? source.cameras[0] as Record<string, unknown> : {}
      if (typeof camera.fov === 'number' && Number.isFinite(camera.fov) && camera.fov > 0) setOutputZoom(Math.max(.6, Math.min(2, 45 / camera.fov)))
      if (camera.ratio === 'landscape' || camera.ratio === 'portrait') setOutputRatio(camera.ratio)
      if (rigPresets.includes(rig.presetId as RigPreset)) setRigPreset(rig.presetId as RigPreset)
      if (backgroundPresets.includes(source.backgroundPreset as BackgroundPreset)) {
        const importedBackground = source.backgroundPreset as BackgroundPreset
        setBackgroundPreset(importedBackground)
        setStudioBackdrop(importedBackground === 'none' && studioBackdrops.includes(source.studioBackdrop as StudioBackdrop) ? source.studioBackdrop as StudioBackdrop : 'none')
      } else { setBackgroundPreset('city'); setStudioBackdrop('none') }
    } catch {
      window.alert(text.importError)
    } finally {
      if (importInputRef.current) importInputRef.current.value = ''
    }
  }
  const reorderFrame = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= frames.length || to >= frames.length) return
    recordHistory()
    const selectedId = frame.id
    const reordered = [...frames]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(to, 0, moved)
    setFrames(reordered); setCurrent(reordered.findIndex((item) => item.id === selectedId)); setPlaying(false)
  }
  const addFrame = () => { recordHistory(); setFrames((items) => [...items, { id: makeId(), name: `Frame ${items.length + 1}`, pose: createPose(), actorRotation: createRotation() }]); setCurrent(frames.length); setPlaying(false) }
  const duplicate = () => { recordHistory(); const frameCopy = { id: makeId(), name: `Frame ${frames.length + 1}`, pose: clonePose(frame.pose), actorRotation: { ...frame.actorRotation } }; setFrames((items) => [...items.slice(0, current + 1), frameCopy, ...items.slice(current + 1)]); setCurrent(current + 1); setPlaying(false) }
  const remove = () => { if (frames.length === 1) return; recordHistory(); setFrames((items) => items.filter((_, i) => i !== current)); setCurrent(Math.max(0, current - 1)); setPlaying(false) }
  const applyJointToAll = () => {
    recordHistory()
    const source = { ...frame.pose[selectedBone] }
    setFrames((items) => items.map((item) => ({ ...item, pose: { ...item.pose, [selectedBone]: { ...source } } })))
  }
  const applyActorToAll = () => {
    recordHistory()
    const source = { ...frame.actorRotation }
    setFrames((items) => items.map((item) => ({ ...item, actorRotation: { ...source } })))
  }
  const resetSelectedJoint = () => {
    recordHistory()
    const target = { ...restPose[selectedBone] }
    setFrames((items) => items.map((item, index) => index === current ? { ...item, pose: { ...item.pose, [selectedBone]: target } } : item))
  }
  const moveFrame = (direction: -1 | 1) => { setPlaying(false); setCurrent((index) => { const next = index + direction; if (next < 0) return loop ? frames.length - 1 : 0; if (next >= frames.length) return loop ? 0 : frames.length - 1; return next }) }

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (target.matches('input, select, textarea, [contenteditable="true"]')) return
      if (event.key === 'ArrowLeft') { event.preventDefault(); moveFrame(-1) }
      if (event.key === 'ArrowRight') { event.preventDefault(); moveFrame(1) }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })
  const download = (href: string, filename: string) => { const anchor = document.createElement('a'); anchor.href = href; anchor.download = filename; anchor.click() }
  const exportPng = () => { const image = capturePngRef.current?.(); if (image) download(image, `pose-board-frame-${current + 1}.png`) }
  const waitForRender = () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  const exportZip = async () => {
    if (exporting) return
    const originalFrame = current
    setPlaying(false); setExporting(true)
    try {
      const zip = new JSZip()
      for (let index = 0; index < frames.length; index += 1) {
        flushSync(() => setCurrent(index))
        await waitForRender()
        const image = capturePngRef.current?.()
        if (image) zip.file(`frame-${String(index + 1).padStart(3, '0')}.png`, image.split(',')[1], { base64: true })
      }
      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      download(url, 'pose-board-frames.zip')
      setTimeout(() => URL.revokeObjectURL(url), 0)
    } finally {
      setCurrent(originalFrame); setExporting(false)
    }
  }
  const exportJson = () => {
    const project = {
      version: '0.1', id: 'pose-board-poc', name: sampleId === 'walk' ? 'Walking sample' : 'Imported project', rotationUnit: 'radian',
      rig: { type: 'primitive-rig', presetId: rigPreset, groups: boneGroups, restPose },
      backgroundPreset,
      studioBackdrop,
      cameras: [{ id: 'output-camera', projection: 'perspective', position: { x: 0, y: 1.1, z: 9.2 }, target: { x: 0, y: 1.1, z: 0 }, fov: 45 / outputZoom, ratio: outputRatio }],
      frames, playback: { fps, loop }, assets: [],
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }))
    download(url, 'pose-board-project.json'); setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  return <main className="app-shell">
    <header><div><span className="mark">P</span><strong>Pose Board</strong><span className="badge">Technical PoC</span></div><div className="header-tools"><p>{text.tagline}</p><details className="file-menu"><summary>{navigation.file}<span>⌄</span></summary><div className="file-menu-panel"><section><strong>{navigation.project}</strong><button disabled={exporting} onClick={exportJson}>{text.exportJson}</button><button disabled={exporting} onClick={() => importInputRef.current?.click()}>{text.importJson}</button></section><section><strong>{navigation.images}</strong><button disabled={exporting} onClick={exportPng}>{text.exportPng}</button><button disabled={exporting} onClick={exportZip}>{exporting ? text.exporting : text.exportZip}</button></section></div></details><input ref={importInputRef} className="visually-hidden" type="file" accept="application/json,.json" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importJson(file) }} /><div className="language-switch" aria-label="Language"><button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>EN</button><button className={language === 'ja' ? 'active' : ''} onClick={() => setLanguage('ja')}>日本語</button></div></div></header>
    <section className="workspace">
      <aside className="bone-panel">
        <div className="panel-heading"><span>{text.rig}</span><small>{text.human}</small></div>
        <section className="setup-section"><button className="section-toggle" aria-expanded={setupOpen} onClick={() => setSetupOpen((open) => !open)}><span>{navigation.sceneSetup}</span><span>{setupOpen ? '⌃' : '⌄'}</span></button>{setupOpen && <div className="setup-fields"><label className="sample-picker"><span>{presets.rigPreset}</span><select value={rigPreset} onChange={(event) => { setRigPreset(event.target.value as RigPreset); setThumbnails({}) }}>{rigPresets.map((preset) => <option key={preset} value={preset}>{presets.rig[preset]}</option>)}</select></label><label className="sample-picker"><span>{text.samples}</span><select value={sampleId} onChange={(event) => { if (event.target.value === 'walk') loadWalkSample() }}><option value="walk">{text.walk}</option>{sampleId === 'custom' && <option value="custom">{text.custom}</option>}</select></label><label className="sample-picker"><span>{presets.backgroundPreset}</span><select value={backgroundPreset} onChange={(event) => { const preset = event.target.value as BackgroundPreset; setBackgroundPreset(preset); if (preset !== 'none') setStudioBackdrop('none'); setThumbnails({}) }}>{backgroundPresets.map((preset) => <option key={preset} value={preset}>{presets.background[preset]}</option>)}</select></label><label className={`sample-picker ${backgroundPreset !== 'none' ? 'disabled' : ''}`}><span>{presets.studioBackdrop}</span><select value={studioBackdrop} disabled={backgroundPreset !== 'none'} onChange={(event) => { setStudioBackdrop(event.target.value as StudioBackdrop); setThumbnails({}) }}>{studioBackdrops.map((preset) => <option key={preset} value={preset}>{presets.studio[preset]}</option>)}</select></label></div>}</section>
        <button className="section-toggle joint-section-toggle" aria-expanded={jointsOpen} onClick={() => setJointsOpen((open) => !open)}><span>{navigation.joints}</span><span>{jointsOpen ? '⌃' : '⌄'}</span></button>
        {jointsOpen && <div className="bone-list">{(Object.entries(boneGroups) as [BoneGroup, typeof boneGroups[BoneGroup]][]).map(([group, definition]) => <div className="bone-group" key={group}>
          <div className="bone-group-heading"><button className="disclosure" aria-label={openGroups[group] ? 'Collapse' : 'Expand'} aria-expanded={openGroups[group]} onClick={() => setOpenGroups((items) => ({ ...items, [group]: !items[group] }))}>{openGroups[group] ? '⌄' : '›'}</button><button className={definition.bones.includes(selectedBone) ? 'group-selected' : ''} onClick={() => setSelectedBone(definition.root)}>{text.groups[group]}</button></div>
          {openGroups[group] && <div className="bone-group-items">{definition.bones.map((bone) => <button key={bone} className={selectedBone === bone ? 'selected' : ''} onClick={() => setSelectedBone(bone)}>{labels[bone]}</button>)}</div>}
        </div>)}</div>}
      </aside>
      <Stage pose={frame.pose} actorRotation={frame.actorRotation} selected={selectedBone} onSelect={setSelectedBone} hint={text.hint} resetViewLabel={text.resetView} overviewLabel={text.overview} cameraLabel={text.camera} zoomLabel={text.zoom} landscapeLabel={text.landscape} portraitLabel={text.portrait} outputZoom={outputZoom} outputRatio={outputRatio} backgroundPreset={backgroundPreset} studioBackdrop={studioBackdrop} rigPreset={rigPreset} onZoomChange={setOutputZoom} onRatioChange={setOutputRatio} showCamera={cameraVisible && !playing} playing={playing} onToggleCamera={() => setCameraVisible((visible) => !visible)} onCaptureReady={(capture) => { capturePngRef.current = capture }} />
      <aside className="controls-panel">
        <div className="panel-heading selected-heading"><span>{text.selected}</span><small>{labels[selectedBone]}</small><div className="history-actions"><button aria-label={text.undo} disabled={!historyPast.length} onClick={undo}><Icon name="undo" /><span>{text.undo}</span></button><button aria-label={text.redo} disabled={!historyFuture.length} onClick={redo}><Icon name="redo" /><span>{text.redo}</span></button></div></div>
        <h2>{text.jointRotation}</h2>
        <div className="edit-scope-note">{text.currentFrame}</div>
        <div className="axis-controls">{(['x', 'y', 'z'] as Axis[]).map((axis) => <label key={axis}><span className={`axis axis-${axis}`}>{axis.toUpperCase()}</span><span className="range-wrap"><input type="range" min="-180" max="180" value={degrees[axis]} onFocus={beginHistoryEdit} onBlur={endHistoryEdit} onChange={(e) => rotate(axis, Number(e.target.value))} /></span><span className="degree-input"><input aria-label={`${axis.toUpperCase()} rotation`} type="number" min="-180" max="180" value={degrees[axis]} onFocus={beginHistoryEdit} onBlur={endHistoryEdit} onChange={(e) => rotate(axis, Math.max(-180, Math.min(180, Number(e.target.value))))} /><span>°</span></span></label>)}</div>
        <div className="rotation-actions"><button className="reset" onClick={resetSelectedJoint}>{text.resetJoint}</button><button className="apply-all" onClick={applyJointToAll}>{text.applyAll}</button></div>
        <div className="control-divider" />
        <h2>{text.actorRotation}</h2>
        <div className="edit-scope-note">{text.currentFrame}</div>
        <div className="axis-controls actor-controls">{(['x', 'y', 'z'] as Axis[]).map((axis) => <label key={axis}><span className={`axis axis-${axis}`}>{axis.toUpperCase()}</span><span className="range-wrap"><input type="range" min="-180" max="180" value={actorDegrees[axis]} onFocus={beginHistoryEdit} onBlur={endHistoryEdit} onChange={(e) => rotateActor(axis, Number(e.target.value))} /></span><span className="degree-input"><input aria-label={`Whole body ${axis.toUpperCase()} rotation`} type="number" min="-180" max="180" value={actorDegrees[axis]} onFocus={beginHistoryEdit} onBlur={endHistoryEdit} onChange={(e) => rotateActor(axis, Math.max(-180, Math.min(180, Number(e.target.value))))} /><span>°</span></span></label>)}</div>
        <div className="rotation-actions"><button className="reset" onClick={() => { recordHistory(); (['x', 'y', 'z'] as Axis[]).forEach((axis) => rotateActor(axis, 0)) }}>{text.resetActor}</button><button className="apply-all" onClick={applyActorToAll}>{text.applyAll}</button></div>
        <p className="tip">{text.tip}</p>
      </aside>
    </section>
    <section className="player" aria-label="Playback controls">
      <div className="counter"><strong>{String(current + 1).padStart(2, '0')}</strong><span>/ {String(frames.length).padStart(2, '0')}</span></div>
      <div className="transport">
        <button aria-label={text.first} onClick={() => { setCurrent(0); setPlaying(false) }}><Icon name="first" /></button>
        <button aria-label={text.previous} onClick={() => moveFrame(-1)}><Icon name="previous" /></button>
        <button className="play" aria-label={playing ? text.pause : text.play} onClick={() => setPlaying(!playing)}><Icon name={playing ? 'pause' : 'play'} /></button>
        <button aria-label={text.next} onClick={() => moveFrame(1)}><Icon name="next" /></button>
        <button aria-label={text.last} onClick={() => { setCurrent(frames.length - 1); setPlaying(false) }}><Icon name="last" /></button>
      </div>
      <div className="play-settings"><label className="loop"><input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} /> {text.loop}</label><label><select aria-label={text.fps} value={fps} onChange={(e) => setFps(Number(e.target.value))}>{[2, 4, 6, 8, 12, 24].map((v) => <option key={v} value={v}>{v} FPS</option>)}</select></label></div>
    </section>
    <section className="timeline"><div className="timeline-label"><span>{text.frames}</span><small>{frames.length} {text.total}</small></div><div className="frames">{frames.map((item, index) => <button key={item.id} draggable className={index === current ? 'active' : ''} onDragStart={(event) => { dragFrameIndex.current = index; event.dataTransfer.effectAllowed = 'move' }} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move' }} onDrop={(event) => { event.preventDefault(); if (dragFrameIndex.current !== null) reorderFrame(dragFrameIndex.current, index); dragFrameIndex.current = null }} onDragEnd={() => { dragFrameIndex.current = null }} onClick={() => { setCurrent(index); setPlaying(false) }}><span className={`thumb ${outputRatio}`}>{thumbnails[item.id] ? <img src={thumbnails[item.id].source} alt="" /> : <span className="stick">●<br />╱│╲<br />╱ ╲</span>}</span><span>{String(index + 1).padStart(2, '0')}</span></button>)}</div><div className="frame-actions"><button onClick={duplicate} aria-label={text.duplicate}><Icon name="duplicate" /><span>{text.duplicate}</span></button><button onClick={addFrame} aria-label={text.add}><Icon name="plus" /><span>{text.add}</span></button><button onClick={remove} disabled={frames.length === 1} aria-label={text.remove}><Icon name="trash" /><span>{text.remove}</span></button></div></section>
  </main>
}
