import { useFrame, type ThreeElements } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { perforated } from './textures'

export type V3 = [number, number, number]

/** Box positioned by the corner with the lowest x, y and z – easier to measure than the center point */
export function Bx({ at, size, children, ...rest }: { at: V3; size: V3; children?: ReactNode } & ThreeElements['mesh']) {
  return (
    <mesh position={[at[0] + size[0] / 2, at[1] + size[1] / 2, at[2] + size[2] / 2]} {...rest}>
      <boxGeometry args={size} />
      {children}
    </mesh>
  )
}

type MatProps = ThreeElements['meshStandardMaterial']

export const Steel = ({ color = '#191b1f', ...p }: MatProps) => (
  <meshStandardMaterial color={color} metalness={0.55} roughness={0.5} {...p} />
)
export const Plastic = ({ color = '#131518', ...p }: MatProps) => (
  <meshStandardMaterial color={color} metalness={0.05} roughness={0.62} {...p} />
)
export const Alu = ({ color = '#a9afb7', ...p }: MatProps) => (
  <meshStandardMaterial color={color} metalness={0.9} roughness={0.34} {...p} />
)
export const Copper = (p: MatProps) => <meshStandardMaterial color="#c9793f" metalness={0.95} roughness={0.28} {...p} />
export const Gold = (p: MatProps) => <meshStandardMaterial color="#d9ac45" metalness={1} roughness={0.3} {...p} />
export const Led = ({ color, intensity = 2.6 }: { color: string; intensity?: number }) => (
  <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} roughness={0.4} />
)

/** Perforated plate: the holes are real holes, so you can see the fans behind */
export function MeshPanel({
  size,
  color,
  ...rest
}: { size: [number, number]; color: string } & ThreeElements['mesh']) {
  const tex = perforated(size[0] / 11, size[1] / 19)
  return (
    <mesh {...rest}>
      <planeGeometry args={size} />
      <meshStandardMaterial
        color={color}
        metalness={0.5}
        roughness={0.5}
        alphaMap={tex}
        alphaTest={0.4}
        alphaToCoverage
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

/** Text or marking laid flat on top of a surface */
export function Label({
  tex,
  size,
  glow = 0,
  ...rest
}: { tex: THREE.Texture; size: [number, number]; glow?: number } & ThreeElements['mesh']) {
  return (
    <mesh userData={{ noShadow: true }} {...rest}>
      <planeGeometry args={size} />
      <meshStandardMaterial
        map={tex}
        transparent
        depthWrite={false}
        roughness={0.7}
        polygonOffset
        polygonOffsetFactor={-4}
        emissive={glow ? '#ffffff' : '#000000'}
        emissiveMap={glow ? tex : null}
        emissiveIntensity={glow}
      />
    </mesh>
  )
}

/** Many identical boxes drawn in one call – used for cooling fins and keys */
export function Boxes({
  size,
  positions,
  children,
}: {
  size: V3
  positions: V3[]
  children: ReactNode
}) {
  const ref = useRef<THREE.InstancedMesh>(null!)
  const key = positions.length
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    positions.forEach((p, i) => {
      m.setPosition(p[0], p[1], p[2])
      ref.current.setMatrixAt(i, m)
    })
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.computeBoundingBox()
    ref.current.computeBoundingSphere()
  }, [positions])
  return (
    <instancedMesh key={key} ref={ref} args={[undefined, undefined, positions.length]}>
      <boxGeometry args={size} />
      {children}
    </instancedMesh>
  )
}

/** Fins stacked along one axis from `from` to `to` */
export function Fins({
  axis,
  from,
  to,
  pitch,
  center,
  plate,
  color = '#aab0b8',
}: {
  axis: 0 | 1 | 2
  from: number
  to: number
  pitch: number
  /** Center in the two other axes (the value of `axis` is ignored) */
  center: V3
  /** Fin size (the thickness along `axis`) */
  plate: V3
  color?: string
}) {
  const positions = useMemo(() => {
    const out: V3[] = []
    for (let v = from; v <= to; v += pitch) {
      const p: V3 = [...center]
      p[axis] = v
      out.push(p)
    }
    return out
  }, [axis, from, to, pitch, center[0], center[1], center[2]]) // eslint-disable-line
  return (
    <Boxes size={plate} positions={positions}>
      <meshStandardMaterial color={color} metalness={0.85} roughness={0.42} />
    </Boxes>
  )
}

// ───────────────────────────── Vifter ─────────────────────────────

const geo = new Map<string, THREE.BufferGeometry>()
function memoGeo(key: string, make: () => THREE.BufferGeometry) {
  let g = geo.get(key)
  if (!g) geo.set(key, (g = make()))
  return g
}

function bladeGeo(rIn: number, rOut: number) {
  return memoGeo(`blade:${rIn.toFixed(1)}:${rOut.toFixed(1)}`, () => {
    const s = new THREE.Shape()
    const a0 = -0.54
    const a1 = 0.09
    const sweep = 0.45
    const rm = (rIn + rOut) / 2
    s.moveTo(rIn * Math.cos(a0), rIn * Math.sin(a0))
    s.quadraticCurveTo(
      rm * Math.cos(a0 + sweep * 0.25),
      rm * Math.sin(a0 + sweep * 0.25),
      rOut * Math.cos(a0 + sweep),
      rOut * Math.sin(a0 + sweep),
    )
    s.absarc(0, 0, rOut, a0 + sweep, a1 + sweep * 0.85, false)
    s.quadraticCurveTo(
      rm * Math.cos(a1 + sweep * 0.7),
      rm * Math.sin(a1 + sweep * 0.7),
      rIn * Math.cos(a1),
      rIn * Math.sin(a1),
    )
    s.absarc(0, 0, rIn, a1, a0, true)
    const g = new THREE.ExtrudeGeometry(s, { depth: 1.4, bevelEnabled: false, curveSegments: 8 })
    g.translate(0, 0, -0.7)
    g.rotateX(0.4)
    return g
  })
}

function frameGeo(size: number, depth: number) {
  return memoGeo(`frame:${size}:${depth}`, () => {
    const h = size / 2
    const r = 9
    const s = new THREE.Shape()
    s.moveTo(-h + r, -h)
    s.lineTo(h - r, -h)
    s.absarc(h - r, -h + r, r, -Math.PI / 2, 0, false)
    s.lineTo(h, h - r)
    s.absarc(h - r, h - r, r, 0, Math.PI / 2, false)
    s.lineTo(-h + r, h)
    s.absarc(-h + r, h - r, r, Math.PI / 2, Math.PI, false)
    s.lineTo(-h, -h + r)
    s.absarc(-h + r, -h + r, r, Math.PI, Math.PI * 1.5, false)
    const hole = new THREE.Path()
    hole.absarc(0, 0, h - 3.5, 0, Math.PI * 2, true)
    s.holes.push(hole)
    const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 40 })
    g.translate(0, 0, -depth / 2)
    return g
  })
}

/** Viftehjulet alene. Roterer rundt lokal z-akse. */
export function Rotor({
  r,
  blades = 9,
  color = '#23262b',
  speed = 1,
  depth = 14,
  led,
}: {
  r: number
  blades?: number
  color?: string
  speed?: number
  depth?: number
  led?: string
}) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((_, dt) => {
    ref.current.rotation.z -= Math.min(dt, 0.05) * 6.5 * speed
  })
  const hub = r * 0.3
  const g = bladeGeo(hub, r)
  return (
    <group ref={ref}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[hub + 1.5, hub + 1.5, depth, 28]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
      </mesh>
      {Array.from({ length: blades }, (_, i) => (
        <mesh key={i} geometry={g} rotation={[0, 0, (i / blades) * Math.PI * 2]}>
          <meshStandardMaterial
            color={color}
            roughness={0.42}
            metalness={0.05}
            emissive={led ?? '#000000'}
            emissiveIntensity={led ? 0.16 : 0}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

/** Complete case fan with frame. The air flows along the local z-axis. */
export function Fan({
  size = 120,
  depth = 25,
  frame = '#141619',
  blade = '#24272c',
  led,
  speed = 1,
  ...rest
}: {
  size?: number
  depth?: number
  frame?: string
  blade?: string
  led?: string
  speed?: number
} & ThreeElements['group']) {
  const r = size / 2 - 5
  return (
    <group {...rest}>
      <mesh geometry={frameGeo(size, depth)}>
        <meshStandardMaterial color={frame} roughness={0.55} metalness={0.1} />
      </mesh>
      <Rotor r={r} color={blade} speed={speed} led={led} depth={depth * 0.6} />
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[0, 0, (i / 4) * Math.PI * 2 + 0.5]} position={[0, 0, -depth / 2 + 2]}>
          <boxGeometry args={[size - 8, 3, 2]} />
          <meshStandardMaterial color={frame} roughness={0.55} />
        </mesh>
      ))}
      {led && (
        <mesh userData={{ noShadow: true }}>
          <torusGeometry args={[size / 2 - 3.6, 1.5, 8, 72]} />
          <Led color={led} intensity={2.2} />
        </mesh>
      )}
    </group>
  )
}

/** Rounded rectangle as a flat shape, for plates with holes */
export function roundedRect(w: number, h: number, r: number, x = 0, y = 0): THREE.Shape {
  const s = new THREE.Shape()
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false)
  s.lineTo(x + w, y + h - r)
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false)
  s.lineTo(x + r, y + h)
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false)
  s.lineTo(x, y + r)
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false)
  return s
}
