import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { chromium } from 'playwright'
import { preview } from 'vite'
import JSZip from 'jszip'

const origin = 'http://127.0.0.1:43127'
const url = origin + '/pose_board/'
const legacy = {
  version: '0.1',
  rotationUnit: 'radian',
  rig: { type: 'primitive-rig' },
  backgroundPreset: 'none',
  studioBackdrop: 'green',
  playback: { fps: 4, loop: false },
  cameras: [{ fov: 45, ratio: 'landscape' }],
  frames: [
    { id: 'legacy-1', name: 'First', pose: { leftUpperArm: { x: 0.25, y: 0, z: 0 } }, actorRotation: { x: 0, y: 0.15, z: 0 } },
    { id: 'legacy-2', name: 'Second', pose: { leftUpperArm: { x: -0.75, y: 0, z: 0 } }, actorRotation: { x: 0, y: -0.45, z: 0 } },
  ],
}

const server = await preview({ base: '/pose_board/', preview: { host: '127.0.0.1', port: 43127, strictPort: true } })
let browser
try {
  browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader'] })
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true })
  // Only the locally built app and synthetic fixture are in scope. Block all
  // remote resources, including the optional portfolio shell.
  await context.route('**/*', (route) => {
    const target = new URL(route.request().url())
    return target.origin === origin || ['data:', 'blob:'].includes(target.protocol) ? route.continue() : route.abort()
  })
  const page = await context.newPage()
  page.setDefaultTimeout(20000)
  // A runner with no WebGL2 must not falsely pass image export checks.
  const webgl = await page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl2')
    if (!gl) return false
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  })
  console.log('WebGL2 available:', webgl)
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto(url)
  await page.getByRole('button', { name: 'EN', exact: true }).click()
  const setup = page.getByRole('button', { name: /Scene setup/ })
  const bodyPreset = page.getByRole('combobox', { name: 'Body preset' })
  if (!await bodyPreset.isVisible()) await setup.click()
  const fileMenu = page.locator('details.file-menu')
  const openFileMenu = async () => {
    if (!await fileMenu.getAttribute('open').then((attribute) => attribute !== null)) {
      await fileMenu.locator('summary').click()
    }
  }
  const load = async (filename, buffer) => {
    await openFileMenu()
    const [chooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: 'Load JSON', exact: true }).click(),
    ])
    await chooser.setFiles({ name: filename, mimeType: 'application/json', buffer })
    await page.waitForFunction(() => document.querySelectorAll('.frames > button').length === 2)
    assert.equal(await bodyPreset.inputValue(), 'adult')
    assert.equal(await page.locator('.frames > button').count(), 2)
    assert.equal(await page.getByRole('combobox', { name: 'Frames per second' }).inputValue(), '4')
    assert.equal(await page.getByRole('checkbox', { name: 'Loop' }).isChecked(), false)
  }
  const download = async (name) => {
    await openFileMenu()
    const [file] = await Promise.all([
      page.waitForEvent('download', { timeout: 60000 }),
      page.getByRole('button', { name, exact: true }).click(),
    ])
    assert.equal(await file.failure(), null)
    const path = await file.path()
    assert.ok(path, 'download must be present')
    return readFile(path)
  }
  const verifyFrames = (project) => {
    assert.equal(project.rig.presetId, 'adult')
    assert.deepEqual(project.frames.map(({ id, name, pose, actorRotation }) => ({
      id, name, pose: { leftUpperArm: pose.leftUpperArm }, actorRotation,
    })), legacy.frames)
    assert.deepEqual(project.playback, legacy.playback)
    assert.equal(project.backgroundPreset, legacy.backgroundPreset)
    assert.equal(project.studioBackdrop, legacy.studioBackdrop)
  }

  await bodyPreset.selectOption('quadruped')
  assert.equal(await bodyPreset.inputValue(), 'quadruped')
  assert.equal(await page.locator('.frames > button').count(), 8)
  await load('legacy.json', Buffer.from(JSON.stringify(legacy)))
  const exported = await download('Project JSON')
  verifyFrames(JSON.parse(exported.toString('utf8')))
  console.log('PASS legacy import from quadruped, adult fallback and frame values retained in actual JSON download')
  await bodyPreset.selectOption('quadruped')
  await load('exported.json', exported)
  verifyFrames(JSON.parse((await download('Project JSON')).toString('utf8')))
  console.log('PASS exported Project JSON round trip')

  if (webgl) {
    await page.waitForFunction(() => {
      const canvas = document.querySelector('canvas')
      return canvas?.width > 0 && canvas.height > 0 && !!canvas.getContext('webgl2')
    })
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    // Check the bytes arriving in real downloads; decode without external I/O
    // and reject uniform (blank) images, not just files with a PNG extension.
    const verifyPng = async (buffer) => {
      assert.deepEqual([...buffer.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10])
      assert.equal(buffer.readUInt32BE(16), 1280)
      assert.equal(buffer.readUInt32BE(20), 720)
      const colors = await page.evaluate(async (encoded) => {
        const image = new Image()
        image.src = 'data:image/png;base64,' + encoded
        await image.decode()
        const canvas = document.createElement('canvas')
        canvas.width = 160
        canvas.height = 90
        const context = canvas.getContext('2d')
        context.drawImage(image, 0, 0, 160, 90)
        const pixels = context.getImageData(0, 0, 160, 90).data
        const distinct = new Set()
        for (let i = 0; i < pixels.length; i += 4) distinct.add(pixels.slice(i, i + 4).join(','))
        return distinct.size
      }, buffer.toString('base64'))
      assert.ok(colors > 4, 'PNG must not be an empty or uniform frame')
    }
    await verifyPng(await download('Current PNG'))
    const zip = await JSZip.loadAsync(await download('All PNGs ZIP'), { checkCRC32: true })
    assert.deepEqual(Object.keys(zip.files).sort(), ['frame-001.png', 'frame-002.png'])
    const first = await zip.file('frame-001.png').async('nodebuffer')
    const second = await zip.file('frame-002.png').async('nodebuffer')
    await verifyPng(first)
    await verifyPng(second)
    assert.notDeepEqual(first, second, 'different test poses must render different PNGs')
    assert.equal(await page.locator('.frames > button.active').innerText(), '01')
    console.log('PASS PNG and CRC-valid ZIP: two non-blank, distinct 1280x720 frames, current frame restored')
    assert.deepEqual(errors, [])
  } else {
    console.log('::warning::SKIPPED PNG/ZIP rendering checks: WebGL2 unavailable on this runner')
  }

  // This is viewport-only emulation, not iPhone hardware/safe-area validation.
  if (await fileMenu.getAttribute('open') !== null) await fileMenu.locator('summary').click()
  await page.setViewportSize({ width: 390, height: 844 })
  const drawer = page.locator('#bone-panel')
  await page.getByRole('button', { name: 'Menu', exact: true }).click()
  assert.equal(await drawer.getAttribute('data-nav-state'), 'expanded')
  await page.getByRole('button', { name: 'Close menu', exact: true }).click()
  assert.equal(await drawer.getAttribute('data-nav-state'), 'collapsed')
  const geometry = await page.evaluate(() => {
    const within = (selector) => {
      const box = document.querySelector(selector).getBoundingClientRect()
      return box.left >= 0 && box.right <= innerWidth + 1 && box.top >= 0 && box.bottom <= innerHeight + 1
    }
    return { player: within('.player'), timeline: within('.timeline'), noOverflow: document.documentElement.scrollWidth <= innerWidth }
  })
  assert.deepEqual(geometry, { player: true, timeline: true, noOverflow: true })
  console.log('PASS 390x844 viewport: drawer state, player and timeline geometry (not real-device safe areas)')
} finally {
  await browser?.close()
  await new Promise((resolve, reject) => server.httpServer.close((error) => error ? reject(error) : resolve()))
}
