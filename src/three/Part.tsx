import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import type { SlotId } from '../data/types'
import { useStore } from '../store'

type V3 = [number, number, number]

interface Handle {
  group: THREE.Group
  explode: V3
  /** How far out the part is right now, 0–1 */
  ex: number
}

/** All parts currently drawn, per slot. The camera uses this to find them. */
const registry = new Map<SlotId, Set<Handle>>()

const _box = new THREE.Box3()
const _a = new THREE.Vector3()
const _b = new THREE.Vector3()

const byGroup = new WeakMap<THREE.Object3D, Handle>()

/** The outline of a slot as it looks when the animation is finished */
export function slotBox(slot: SlotId, exploded: boolean, out = new THREE.Box3()): THREE.Box3 {
  out.makeEmpty()
  const set = registry.get(slot)
  if (!set) return out
  for (const h of set) {
    _box.setFromObject(h.group)
    if (_box.isEmpty()) continue
    // The part itself and any parts inside it may still be on the way
    for (let o: THREE.Object3D | null = h.group; o; o = o.parent) {
      const part = byGroup.get(o)
      if (!part || !o.parent) continue
      const d = (exploded ? 1 : 0) - part.ex
      _a.set(0, 0, 0)
      _b.set(part.explode[0] * d, part.explode[1] * d, part.explode[2] * d)
      o.parent.localToWorld(_a)
      o.parent.localToWorld(_b)
      _box.translate(_b.sub(_a))
    }
    out.union(_box)
  }
  return out
}

export function deviceBox(exploded: boolean, out = new THREE.Box3()): THREE.Box3 {
  out.makeEmpty()
  const tmp = new THREE.Box3()
  for (const slot of registry.keys()) out.union(slotBox(slot, exploded, tmp))
  return out
}

const HIGHLIGHT = new THREE.Color('#f0c048')
type Mat = THREE.MeshStandardMaterial & { userData: Record<string, unknown> }

function applyMaterial(m: Mat, ghost: number, hl: number, dense: boolean, fade?: number) {
  const ud = m.userData as {
    o0?: number
    t0?: boolean
    dw0?: boolean
    e0?: THREE.Color
    ei0?: number
    keep?: number
  }
  if (ud.o0 === undefined) {
    // Light surfaces look much better than dark ones when transparent, so they are toned down further
    const c = m.color
    const lum = c ? (c.r + c.g + c.b) / 3 : 0
    ud.keep = THREE.MathUtils.lerp(0.1, 0.03, Math.min(1, lum * 2.2))
    ud.o0 = m.opacity
    ud.t0 = m.transparent
    ud.dw0 = m.depthWrite
    if (m.emissive) {
      ud.e0 = m.emissive.clone()
      ud.ei0 = m.emissiveIntensity
    }
  }
  // Many thin fins on top of each other become a grey haze, so they are removed entirely. Text is dimmed extra.
  m.opacity = ud.o0 * (1 - ghost * (dense ? 1 : fade ?? (ud.t0 ? 0.97 : 1 - ud.keep!)))
  const transparent = ud.t0! || ghost > 0.004
  if (m.transparent !== transparent) {
    m.transparent = transparent
    m.needsUpdate = true
  }
  m.depthWrite = ghost > 0.3 ? false : ud.dw0!
  if (m.emissive && ud.e0) {
    m.emissive.copy(ud.e0).lerp(HIGHLIGHT, hl * 0.32)
    m.emissiveIntensity = ud.ei0! * (1 - ghost * 0.85)
  }
}

/** Walks through the part's own objects, but not into parts that lie inside it */
function walk(o: THREE.Object3D, fn: (m: THREE.Mesh) => void) {
  if ((o as THREE.Mesh).isMesh) fn(o as THREE.Mesh)
  for (const c of o.children) if (!c.userData.partRoot) walk(c, fn)
}

const damp = THREE.MathUtils.damp

interface Props {
  slot: SlotId
  /** Where the part moves in the exploded view, in millimeters */
  explode?: V3
  /** If this changes, the part flashes briefly to show that it was swapped */
  flash?: string
  /** Order in the assembly when the machine appears */
  order?: number
  /** The part moves away when one of these is selected, because it is in their way */
  liftFor?: SlotId[]
  /** How much the part fades out when another part is selected (0–1). Used on parts that sit as lids over others. */
  fade?: number
  children: ReactNode
}

export function Part({ slot, explode = [0, 0, 0], flash, order = 0, liftFor, fade, children }: Props) {
  const ref = useRef<THREE.Group>(null!)
  const st = useRef({ ghost: 0, hl: 0, flash: 0, age: 0, frame: 0 })
  const handle = useRef<Handle>({ group: null!, explode, ex: 1 })
  useEffect(() => {
    handle.current.explode = explode
  })

  useEffect(() => {
    const h = handle.current
    h.group = ref.current
    byGroup.set(h.group, h)
    let set = registry.get(slot)
    if (!set) registry.set(slot, (set = new Set()))
    set.add(h)
    return () => {
      set.delete(h)
      if (!set.size) registry.delete(slot)
    }
  }, [slot])

  const first = useRef(true)
  useEffect(() => {
    if (first.current) first.current = false
    else st.current.flash = 1
  }, [flash])

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const s = st.current
    const h = handle.current
    const { selected, hovered, exploded, mode } = useStore.getState()
    s.age += dt

    const lifted = !!selected && !!liftFor?.includes(selected)
    const exTarget = (exploded || lifted) && mode === 'inspect' ? 1 : 0
    // The parts start scattered and fall into place one by one
    const wait = 0.15 + order * 0.07
    if (s.age > wait) h.ex = damp(h.ex, exTarget, exTarget ? 5 : 4.2, dt)
    if (Math.abs(h.ex - exTarget) < 0.0005) h.ex = exTarget
    ref.current.position.set(explode[0] * h.ex, explode[1] * h.ex, explode[2] * h.ex)

    const ghostT = selected && selected !== slot ? 1 : 0
    const hlT = hovered === slot && mode === 'inspect' ? 1 : 0
    const moving =
      Math.abs(s.ghost - ghostT) > 0.001 || Math.abs(s.hl - hlT) > 0.001 || s.flash > 0.001
    s.ghost = damp(s.ghost, ghostT, 9, dt)
    s.hl = damp(s.hl, hlT, 14, dt)
    s.flash = damp(s.flash, 0, 3.5, dt)
    // New objects may have arrived after a swap, so everything is refreshed at regular intervals
    if (!moving && s.frame++ % 12 !== 0) return
    const hl = Math.max(s.hl, s.flash)
    const cast = s.ghost < 0.5
    walk(ref.current, (mesh) => {
      if (!mesh.userData.noShadow) {
        mesh.castShadow = cast
        mesh.receiveShadow = true
      }
      const dense = (mesh as THREE.InstancedMesh).isInstancedMesh === true
      if (dense) mesh.visible = s.ghost < 0.97
      const m = mesh.material
      if (Array.isArray(m)) for (const x of m) applyMaterial(x as Mat, s.ghost, hl, dense, fade)
      else applyMaterial(m as Mat, s.ghost, hl, dense, fade)
    })
  })

  // A part that is faded out completely should not catch the pointer – then you hit what is behind it
  const active = () => {
    const s = useStore.getState()
    if (s.mode !== 'inspect') return false
    return !(fade !== undefined && fade >= 1 && s.selected && s.selected !== slot)
  }

  return (
    <group
      ref={ref}
      userData={{ partRoot: true }}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        if (!active()) return
        e.stopPropagation()
        useStore.getState().hover(slot)
      }}
      onPointerOut={() => {
        const s = useStore.getState()
        if (s.hovered === slot) s.hover(null)
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        if (!active() || e.delta > 5) return
        e.stopPropagation()
        const s = useStore.getState()
        s.select(s.selected === slot ? null : slot)
      }}
    >
      {children}
    </group>
  )
}
