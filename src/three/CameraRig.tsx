import { CameraControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { SlotId } from '../data/types'
import { useBuild, useDevice, useStore } from '../store'
import { deviceBox, slotBox } from './Part'

type Dir = [number, number, number]

/** Hvilken side hver del ser best ut fra */
const DESKTOP_VIEW: Partial<Record<SlotId, Dir>> = {
  motherboard: [0.16, 0.12, 1],
  cpu: [0.28, 0.3, 1],
  cooler: [0.55, 0.32, 0.8],
  ram: [0.62, 0.24, 0.75],
  gpu: [0.36, -0.44, 0.82],
  storage: [0.2, 0.26, 1],
  psu: [-0.5, 0.34, 0.85],
  case: [0.62, 0.3, 0.74],
}
const LAPTOP_VIEW: Partial<Record<SlotId, Dir>> = {
  display: [0.22, 0.16, 1],
  case: [0.5, 0.5, 0.74],
}
const LAPTOP_INNER: Dir = [0.14, 1, 0.62]
const HOME: Record<'desktop' | 'laptop', Dir> = {
  desktop: [0.62, 0.3, 0.74],
  laptop: [0.48, 0.52, 0.74],
}
/** I sprengskissen ses lagene best litt mer fra siden */
const HOME_EXPLODED: Record<'desktop' | 'laptop', Dir> = {
  desktop: [0.88, 0.3, 0.46],
  laptop: [0.6, 0.24, 0.76],
}

interface Insets {
  l: number
  r: number
  t: number
  b: number
}

/** Hvor mye av skjermen panelene dekker langs hver kant */
function readInsets(): Insets {
  const W = window.innerWidth
  const H = window.innerHeight
  const ins = { l: 0, r: 0, t: 0, b: 0 }
  document.querySelectorAll<HTMLElement>('[data-inset]').forEach((el) => {
    const rc = el.getBoundingClientRect()
    if (!rc.width || !rc.height) return
    const side = el.dataset.inset
    if (side === 'top') ins.t = Math.max(ins.t, rc.bottom)
    else if (side === 'bottom') ins.b = Math.max(ins.b, H - rc.top)
    else if (rc.width > W * 0.7) {
      if (rc.top + rc.height / 2 < H / 2) ins.t = Math.max(ins.t, rc.bottom)
      else ins.b = Math.max(ins.b, H - rc.top)
    } else if (rc.left + rc.width / 2 < W / 2) ins.l = Math.max(ins.l, rc.right)
    else ins.r = Math.max(ins.r, W - rc.left)
  })
  return ins
}

const _center = new THREE.Vector3()
const _size = new THREE.Vector3()
const _pos = new THREE.Vector3()
const _tgt = new THREE.Vector3()
const _box = new THREE.Box3()

export function CameraRig() {
  const controls = useRef<CameraControls>(null)
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const scene = useThree((s) => s.scene)

  const device = useDevice()
  const build = useBuild()
  const mode = useStore((s) => s.mode)
  const selected = useStore((s) => s.selected)
  const exploded = useStore((s) => s.exploded)
  const glass = useStore((s) => s.glass)
  const homeTick = useStore((s) => s.homeTick)

  const insets = useRef<Insets>({ l: 0, r: 0, t: 0, b: 0 })
  const shift = useRef({ x: 0, y: 0, frame: 0 })
  const busy = useRef({ dragging: false, idle: 0 })
  const head = useRef<THREE.PointLight>(null)
  const placed = useRef(false)
  const last = useRef({ key: '', sig: '' })

  useEffect(() => {
    const c = controls.current
    if (!c) return
    const start = () => (busy.current.dragging = true)
    const end = () => {
      busy.current.dragging = false
      busy.current.idle = 0
    }
    c.addEventListener('controlstart', start)
    c.addEventListener('controlend', end)
    return () => {
      c.removeEventListener('controlstart', start)
      c.removeEventListener('controlend', end)
    }
  }, [])

  const sig = JSON.stringify(build)
  const key = `${mode}|${device.id}|${selected}|${exploded}|${glass}|${homeTick}|${size.width}x${size.height}`

  useEffect(() => {
    const c = controls.current
    if (!c) return
    // Byttes bare en del, beholdes vinkelen du har valgt selv
    const keepAngle = last.current.key === key && last.current.sig !== sig
    last.current = { key, sig }
    let raf = 0
    let tries = 0
    const run = () => {
      scene.updateMatrixWorld()
      const s = useStore.getState()
      const ex = s.exploded && s.mode === 'inspect'
      const box = s.selected ? slotBox(s.selected, ex, _box) : deviceBox(ex, _box)
      if (box.isEmpty()) {
        if (tries++ < 40) raf = requestAnimationFrame(run)
        return
      }
      box.getCenter(_center)
      box.getSize(_size)
      // Små deler vises med litt av omgivelsene rundt seg
      const radius = Math.max(0.42, _size.length() / 2)

      const ins = (insets.current = readInsets())
      const W = size.width
      const H = size.height
      const freeW = Math.max(160, W - ins.l - ins.r)
      const freeH = Math.max(160, H - ins.t - ins.b)
      const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
      const half = Math.atan(Math.min((tan * freeH) / H, (tan * freeW) / H))
      const margin = s.selected ? 1.3 : s.mode === 'select' ? 0.98 : 0.92
      const dist = Math.max(0.9, (radius / Math.sin(half)) * margin)

      let dir: Dir
      if (keepAngle) {
        c.getPosition(_pos)
        c.getTarget(_tgt)
        _pos.sub(_tgt).normalize()
        dir = [_pos.x, _pos.y, _pos.z]
      } else if (!s.selected) dir = (ex ? HOME_EXPLODED : HOME)[device.kind]
      else if (device.kind === 'desktop') dir = DESKTOP_VIEW[s.selected] ?? HOME.desktop
      else dir = LAPTOP_VIEW[s.selected] ?? LAPTOP_INNER
      _pos.set(dir[0], dir[1], dir[2]).normalize().multiplyScalar(dist).add(_center)

      c.smoothTime = s.selected ? 0.5 : 0.6
      // Første gang settes kameraet rett på plass, så maskinen er riktig innrammet fra første bilde
      void c.setLookAt(_pos.x, _pos.y, _pos.z, _center.x, _center.y, _center.z, placed.current)
      placed.current = true
    }
    // To bilder ventetid, så nye deler rekker å bli tegnet før de måles
    raf = requestAnimationFrame(() => (raf = requestAnimationFrame(run)))
    return () => cancelAnimationFrame(raf)
  }, [key, sig]) // eslint-disable-line

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const sh = shift.current
    if (sh.frame++ % 8 === 0) insets.current = readInsets()
    const ins = insets.current
    // Flytter bildets midtpunkt til midten av den ledige flaten mellom panelene
    sh.x = THREE.MathUtils.damp(sh.x, (ins.r - ins.l) / 2, 5, dt)
    sh.y = THREE.MathUtils.damp(sh.y, (ins.b - ins.t) / 2, 5, dt)
    camera.setViewOffset(size.width, size.height, sh.x, sh.y, size.width, size.height)

    // Lykt som følger kameraet, så delen du ser på alltid er opplyst
    head.current?.position.copy(camera.position)

    const c = controls.current
    if (!c) return
    // Du kan se oppunder høye deler, men aldri havne under gulvet
    c.getTarget(_tgt)
    c.maxPolarAngle = Math.PI / 2 + Math.asin(THREE.MathUtils.clamp((_tgt.y - 0.3) / c.distance, 0, 0.8))
    const s = useStore.getState()
    const b = busy.current
    b.idle += dt
    const auto = s.mode === 'select' ? b.idle > 2.5 : s.spin && !s.selected && b.idle > 1.2
    if (auto && !b.dragging) void c.rotate(dt * (s.mode === 'select' ? 0.14 : 0.2), 0, false)
  })

  return (
    <>
      <pointLight ref={head} decay={0} intensity={0.6} />
      <CameraControls
        ref={controls}
        makeDefault
        minDistance={0.7}
        maxDistance={24}
        dollySpeed={0.45}
        minPolarAngle={0.1}
        maxPolarAngle={1.6}
        draggingSmoothTime={0.1}
        smoothTime={0.5}
      />
    </>
  )
}
