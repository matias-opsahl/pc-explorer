import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Battery, Build, DeviceDef, Display, Gpu, LaptopGeom, Ram, Storage } from '../data/types'
import { getParts } from '../logic/evaluate'
import { useEvaluation, useStore } from '../store'
import { Part } from './Part'
import { Alu, Boxes, Bx, Copper, Fins, Gold, Label, Led, Plastic, roundedRect, type V3 } from './prims'
import { pcbTexture, screenTexture, textTexture } from './textures'

/*
 * Millimeter. x går fra venstre mot høyre, y oppover fra bordet, z mot deg.
 * Hengselen ligger altså på negativ z.
 */

const HALF = Math.PI / 2

/** Legger en flat form ned på bordet: formens y blir −z, og tykkelsen går oppover */
function plate(shape: THREE.Shape, t: number, uv = false) {
  const g = new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false, curveSegments: 32 })
  g.rotateX(-HALF)
  if (uv) {
    g.computeBoundingBox()
    const b = g.boundingBox!
    const pos = g.attributes.position
    const tex = g.attributes.uv
    for (let i = 0; i < pos.count; i++) {
      tex.setXY(i, (pos.getX(i) - b.min.x) / (b.max.x - b.min.x), (pos.getZ(i) - b.min.z) / (b.max.z - b.min.z))
    }
  }
  return g
}

function Blower({ r, h }: { r: number; h: number }) {
  const blades = useRef<THREE.InstancedMesh>(null!)
  const spin = useRef<THREE.Group>(null!)
  const n = 40
  const ring = useMemo(() => {
    const s = new THREE.Shape()
    s.absarc(0, 0, r + 1.5, 0, Math.PI * 2, false)
    const hole = new THREE.Path()
    hole.absarc(0, 0, r * 0.6, 0, Math.PI * 2, true)
    s.holes.push(hole)
    return plate(s, 0.7)
  }, [r])
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const p = new THREE.Vector3()
    const one = new THREE.Vector3(1, 1, 1)
    const up = new THREE.Vector3(0, 1, 0)
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      p.set(Math.cos(a) * r * 0.72, 0, Math.sin(a) * r * 0.72)
      q.setFromAxisAngle(up, -a + 0.55)
      m.compose(p, q, one)
      blades.current.setMatrixAt(i, m)
    }
    blades.current.instanceMatrix.needsUpdate = true
    blades.current.computeBoundingBox()
    blades.current.computeBoundingSphere()
  }, [r])
  useFrame((_, dt) => {
    spin.current.rotation.y -= Math.min(dt, 0.05) * 7
  })
  return (
    <group>
      <mesh position={[0, -h / 2 + 0.4, 0]}>
        <cylinderGeometry args={[r + 1.5, r + 1.5, 0.8, 44]} />
        <Plastic color="#0c0d0f" />
      </mesh>
      <mesh>
        <cylinderGeometry args={[r + 1.5, r + 1.5, h, 44, 1, true]} />
        <Plastic color="#0f1012" side={THREE.DoubleSide} />
      </mesh>
      <group ref={spin}>
        <instancedMesh ref={blades} args={[undefined, undefined, n]}>
          <boxGeometry args={[r * 0.44, h - 2.4, 0.7]} />
          <Plastic color="#2a2d33" />
        </instancedMesh>
        <mesh>
          <cylinderGeometry args={[r * 0.3, r * 0.3, h - 1.6, 28]} />
          <Plastic color="#1a1c20" />
        </mesh>
      </group>
      <mesh geometry={ring} position={[0, h / 2 - 0.7, 0]}>
        <Plastic color="#0c0d0f" />
      </mesh>
    </group>
  )
}

function Chip({ at, size, die, vram = 0 }: { at: V3; size: number; die: [number, number]; vram?: number }) {
  const [x, y, z] = at
  return (
    <>
      <Bx at={[x - size / 2, y, z - size / 2]} size={[size, 1, size]}>
        <meshStandardMaterial color="#1f5c40" roughness={0.5} />
      </Bx>
      <Bx at={[x - die[0] / 2, y + 1, z - die[1] / 2]} size={[die[0], 0.8, die[1]]}>
        <meshStandardMaterial color="#56606e" metalness={0.85} roughness={0.3} />
      </Bx>
      {Array.from({ length: vram }, (_, i) => {
        // Minnebrikkene ligger i en vinkel rundt grafikkbrikken
        const side = i < 4
        const k = side ? i : i - 4
        const px = side ? x + size / 2 + 5 : x - size / 2 + k * 16
        const pz = side ? z - size / 2 + k * 14 - 4 : z + size / 2 + 5
        return (
          <Bx key={i} at={[px, y, pz]} size={side ? [11, 1.1, 12.5] : [14, 1.1, 11]}>
            <Plastic color="#101114" />
          </Bx>
        )
      })}
    </>
  )
}

export function LaptopModel({ device, build }: { device: DeviceDef; build: Build }) {
  const g = device.geom as LaptopGeom
  const rgb = useStore((s) => s.rgb)
  const fps = useEvaluation().perf.fps
  const p = useMemo(() => getParts(build), [build])
  const gpu = p.gpu as Gpu
  const ram = p.ram as Ram
  const ssd = p.storage as Storage
  const display = p.display as Display
  const battery = p.battery as Battery

  const { w, d, baseT, lidT } = g
  const yB = 1.5
  const floorY = yB + 2.5
  const topY = yB + baseT
  const yP = floorY + 2.7 // overflaten på hovedkortet
  const [bw, bd] = g.battery
  const bh = Math.min(8, baseT - 8.5)
  const zBatt = d / 2 - 13 - bd // batteriets bakkant
  const zb = zBatt - 6 // hovedkortets forkant
  const fr = Math.min(36, w * 0.1)
  const fx = w / 2 - 20 - fr
  const fz = -d / 2 + 26 + fr
  const fh = Math.min(9, baseT - 9)
  const cz = -d / 2 + 78
  const cx = -w * 0.115
  const gx = w * 0.12
  const soldered = ram.form === 'Loddet'
  const keyGlow = g.keyGlow === '#6fd3ff' ? rgb : g.keyGlow

  const geo = useMemo(() => {
    const s = roundedRect(w - 32, zb - (-d / 2 + 22), 3, -w / 2 + 16, -zb)
    for (const sx of [-1, 1]) {
      const hole = new THREE.Path()
      hole.absarc(sx * fx, -fz, fr + 3, 0, Math.PI * 2, true)
      s.holes.push(hole)
    }
    const pipe = (dz: number, spread: number) => {
      const zf = -d / 2 + 13 + spread
      const curve = new THREE.CatmullRomCurve3(
        [
          [-fx - fr * 0.8, zf],
          [-fx + fr * 0.9, zf],
          [cx - 26, cz - 26 + dz * 0.6],
          [cx, cz + dz],
          [gx, cz + dz],
          [gx + 30, cz - 26 + dz * 0.6],
          [fx - fr * 0.9, zf],
          [fx + fr * 0.8, zf],
        ].map(([x, z]) => new THREE.Vector3(x, 0, z)),
        false,
        'catmullrom',
        0.35,
      )
      return new THREE.TubeGeometry(curve, 90, 3.4, 8)
    }
    return { board: plate(s, 1.2, true), pipes: [pipe(-9, -3.4), pipe(0, 0), pipe(9, 3.4)] }
  }, [w, d, zb, fx, fz, fr, cx, gx, cz])

  // Tastatur
  const cols = Math.floor((w - 40) / 19)
  const kx0 = -((cols - 1) * 19) / 2
  const kz0 = -d / 2 + 36
  const keys = useMemo(() => {
    const out: V3[] = []
    const space = Math.floor(cols / 2) - 3
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < cols; c++) {
        if (r === 5 && c >= space && c < space + 5) continue
        out.push([kx0 + c * 19, topY + 0.9, kz0 + r * 19])
      }
    }
    return { out, spaceX: kx0 + (space + 2) * 19 }
  }, [cols, kx0, kz0, topY])
  const padD = Math.min(84, d / 2 - (kz0 + 6 * 19) - 6)

  // Skjerm
  const diagMm = g.diag * 25.4
  const sh = diagMm / Math.sqrt(1 + g.aspect * g.aspect)
  const sw = sh * g.aspect
  const lidH = d - 10
  const screen = screenTexture(fps, display.hz, g.aspect)

  const battTex = textTexture(512, 128, [
    { t: `${battery.wh} Wh`, size: 70, weight: 700, color: '#c9ced6', y: 0.4, x: 0.05, align: 'left' },
    { t: 'LITIUM-ION  ·  15,4 V', size: 30, weight: 500, color: '#727984', y: 0.78, x: 0.05, align: 'left', spacing: 3 },
  ])
  const ramTex = textTexture(512, 128, [
    { t: `${ram.perStick} GB`, size: 64, weight: 700, color: '#15171a', y: 0.36, x: 0.06, align: 'left' },
    { t: `DDR5-${ram.speed} SO-DIMM`, size: 34, weight: 500, color: '#3b3f46', y: 0.76, x: 0.06, align: 'left' },
  ], '#b4b8bd')
  const ssdTex = textTexture(512, 144, [
    { t: ssd.capacity >= 1000 ? `${ssd.capacity / 1000} TB` : `${ssd.capacity} GB`, size: 64, weight: 700, color: '#15171a', y: 0.36, x: 0.05, align: 'left' },
    { t: `NVMe ${ssd.iface}`, size: 36, weight: 500, color: '#3b3f46', y: 0.74, x: 0.05, align: 'left' },
  ], '#b4b8bd')

  const ramZ = zb - 20
  const boardOut: V3 = [0, 45, 0]

  return (
    <group scale={0.01}>
      {/* Bunndeksel */}
      <Part slot="case" explode={[0, -40, 0]} order={0}>
        <RoundedBox args={[w, 2.5, d]} radius={1.1} smoothness={3} position={[0, yB + 1.25, 0]}>
          <Alu color={g.body} roughness={0.5} metalness={0.5} />
        </RoundedBox>
        {[-1, 1].map((s) => (
          <Bx key={s} at={[-w * 0.36, 0, s * (d / 2 - 24) - 3]} size={[w * 0.72, 1.6, 6]}>
            <Plastic color="#0a0b0c" />
          </Bx>
        ))}
        {[-1, 1].map((s) => (
          <Bx key={s} at={[s * (w / 2 - 26) - 12, floorY, zBatt + bd * 0.15]} size={[24, bh - 1, bd * 0.7]}>
            <Plastic color="#17191c" />
          </Bx>
        ))}
      </Part>

      {/* Batteri */}
      <Part slot="battery" order={1}>
        <RoundedBox args={[bw, bh, bd]} radius={1.2} smoothness={3} position={[0, floorY + 0.4 + bh / 2, zBatt + bd / 2]}>
          <Plastic color="#131417" />
        </RoundedBox>
        {[-1, 0, 1].map((i) => (
          <Bx key={i} at={[i * (bw / 3) - bw / 6 + 3, floorY + 0.4 + bh, zBatt + 4]} size={[bw / 3 - 6, 0.3, bd - 8]}>
            <Plastic color="#1c1e22" />
          </Bx>
        ))}
        <group position={[-bw / 2 + 50, floorY + 0.4 + bh + 0.45, zBatt + bd / 2]} rotation={[-HALF, 0, 0]}>
          <Label tex={battTex} size={[84, 21]} />
        </group>
        <Bx at={[-14, floorY + 1, zBatt - 9]} size={[28, 1.2, 10]}>
          <meshStandardMaterial color="#b3261e" roughness={0.6} />
        </Bx>
      </Part>

      {/* Hovedkort */}
      <Part slot="motherboard" explode={boardOut} order={2}>
        <mesh geometry={geo.board} position={[0, floorY + 1.5, 0]}>
          <meshStandardMaterial map={pcbTexture('green')} roughness={0.55} metalness={0.2} />
        </mesh>
        {Array.from({ length: 9 }, (_, i) => (
          <Bx key={i} at={[-52 + i * 12, yP, -d / 2 + 30]} size={[7, 4, 7]}>
            <Plastic color="#3c4047" />
          </Bx>
        ))}
        {[-1, 1].map((s) =>
          [0, 1, 2].map((i) => (
            <Bx key={`${s}${i}`} at={[s * (w / 2 - 12) - 6, yP, fz + fr + 14 + i * 22]} size={[12, 6, 13]}>
              <Alu color="#9aa0a8" />
            </Bx>
          )),
        )}
        {/* Trådløskort */}
        <Bx at={[-w * 0.34, yP + 1.6, zb - 30]} size={[30, 1, 22]}>
          <meshStandardMaterial color="#12406e" roughness={0.5} />
        </Bx>
        <Bx at={[-w * 0.34 + 6, yP + 2.6, zb - 26]} size={[16, 1, 14]}>
          <Alu color="#c4c8ce" roughness={0.25} />
        </Bx>
        {!soldered &&
          [-1, 1].map((s) => (
            <Bx key={s} at={[s * 38 - 36, yP, ramZ - 21]} size={[72, 3.4, 5]}>
              <Plastic color="#0b0c0e" />
            </Bx>
          ))}
        <Bx at={[w * 0.2 - 4, yP, zb - 28]} size={[5, 3, 22]}>
          <Plastic color="#0b0c0e" />
        </Bx>
      </Part>

      <Part slot="cpu" explode={boardOut} order={2}>
        <Chip at={[cx, yP, cz]} size={30} die={[15, 11]} />
      </Part>
      <Part slot="gpu" explode={boardOut} flash={gpu.id} order={2}>
        <Chip at={[gx + 4, yP, cz]} size={38} die={[21 + gpu.vram * 0.25, 18]} vram={Math.min(8, gpu.vram / 2)} />
      </Part>

      {/* Minne */}
      <Part slot="ram" explode={soldered ? boardOut : [0, 88, 0]} flash={ram.id} order={3} fade={soldered ? undefined : 1}>
        {soldered
          ? [0, 1, 2, 3].map((i) => (
              <Bx key={i} at={[cx - 46 + (i % 2) * 16, yP, cz + 26 + Math.floor(i / 2) * 15]} size={[12, 1.1, 12]}>
                <Plastic color="#0b0c0e" />
              </Bx>
            ))
          : Array.from({ length: ram.sticks }, (_, i) => {
              const x = (i ? 1 : -1) * 38
              return (
                <group key={i} position={[x, yP + 3.6, ramZ]}>
                  <Bx at={[-34.8, 0, -15]} size={[69.6, 1, 30]}>
                    <meshStandardMaterial color="#14402f" roughness={0.5} />
                  </Bx>
                  <Bx at={[-33, 0, -16.4]} size={[66, 1, 1.6]}>
                    <Gold />
                  </Bx>
                  {[-24, -8, 8, 24].map((cxx) => (
                    <Bx key={cxx} at={[cxx - 6, 1, 2]} size={[12, 1, 10]}>
                      <Plastic color="#0b0c0e" />
                    </Bx>
                  ))}
                  <group position={[0, 1.05, -6]} rotation={[-HALF, 0, 0]}>
                    <Label tex={ramTex} size={[52, 13]} />
                  </group>
                </group>
              )
            })}
      </Part>

      {/* Lagring */}
      <Part slot="storage" explode={[0, 88, 0]} flash={ssd.id} order={3} fade={1}>
        <group position={[w * 0.2, yP + 3.2, zb - 28]}>
          <Bx at={[0, 0, 0]} size={[80, 0.9, 22]}>
            <meshStandardMaterial color="#0e2f55" roughness={0.5} />
          </Bx>
          <Bx at={[-2.6, 0, 3]} size={[3, 0.9, 16]}>
            <Gold />
          </Bx>
          {[6, 26, 48].map((x, i) => (
            <Bx key={x} at={[x, 0.9, 3]} size={[i ? 17 : 13, 1.1, i ? 16 : 13]}>
              <Plastic color="#1b1d21" />
            </Bx>
          ))}
          <group position={[42, 2.1, 11]} rotation={[-HALF, 0, 0]}>
            <Label tex={ssdTex} size={[58, 16.3]} />
          </group>
        </group>
      </Part>

      {/* Kjøling */}
      <Part slot="cooler" explode={[0, 130, 0]} order={4} liftFor={['cpu', 'gpu']} fade={1}>
        {[-1, 1].map((s) => (
          <group key={s}>
            <group position={[s * fx, floorY + 0.6 + fh / 2, fz]}>
              <Blower r={fr} h={fh} />
            </group>
            <Fins axis={0} from={s * fx - fr * 0.9} to={s * fx + fr * 0.9} pitch={1.9} center={[0, floorY + 0.6 + fh / 2, -d / 2 + 13]} plate={[0.5, fh, 14]} color="#c08a5a" />
            <Fins axis={2} from={fz - fr * 0.75} to={fz + fr * 0.75} pitch={1.9} center={[s * (w / 2 - 10), floorY + 0.6 + fh / 2, 0]} plate={[11, fh, 0.5]} color="#c08a5a" />
          </group>
        ))}
        {geo.pipes.map((pg, i) => (
          <mesh key={i} geometry={pg} position={[0, yP + 4.6, 0]} scale={[1, 0.42, 1]}>
            <Copper roughness={0.35} />
          </mesh>
        ))}
        {g.vapor ? (
          <RoundedBox args={[gx - cx + 82, 1.6, 66]} radius={0.7} smoothness={2} position={[(cx + gx) / 2 + 2, yP + 2.9, cz]}>
            <Copper roughness={0.32} />
          </RoundedBox>
        ) : (
          <>
            <Bx at={[cx - 18, yP + 2.1, cz - 18]} size={[36, 1.4, 36]}>
              <Copper />
            </Bx>
            <Bx at={[gx - 20, yP + 2.1, cz - 23]} size={[48, 1.4, 46]}>
              <Copper />
            </Bx>
          </>
        )}
      </Part>

      {/* Overdel med tastatur, og lokket hengslet bakerst */}
      <Part slot="case" explode={[0, 220, 0]} order={5} fade={1}>
        <RoundedBox args={[w, 2.5, d]} radius={1.1} smoothness={3} position={[0, topY - 1.25, 0]}>
          <Alu color={g.deck} roughness={0.5} metalness={0.55} />
        </RoundedBox>
        {(
          [
            [[-w / 2, floorY - 1, -d / 2 + 2], [2, baseT - 4, d - 4]],
            [[w / 2 - 2, floorY - 1, -d / 2 + 2], [2, baseT - 4, d - 4]],
            [[-w / 2 + 2, floorY - 1, d / 2 - 2], [w - 4, baseT - 4, 2]],
            [[-w / 2 + 2, floorY - 1, -d / 2], [w - 4, baseT - 4, 2]],
          ] as [V3, V3][]
        ).map(([at, size], i) => (
          <Bx key={i} at={at} size={size}>
            <Alu color={g.body} roughness={0.5} metalness={0.5} />
          </Bx>
        ))}
        <Bx at={[kx0 - 12, topY, kz0 - 11]} size={[(cols - 1) * 19 + 24, 0.25, 6 * 19 + 3]} userData={{ noShadow: true }}>
          <Led color={keyGlow} intensity={0.42} />
        </Bx>
        <Boxes size={[16.2, 1.5, 16.2]} positions={keys.out}>
          <meshStandardMaterial color="#0d0e10" roughness={0.6} />
        </Boxes>
        <Bx at={[keys.spaceX - 46, topY + 0.15, kz0 + 5 * 19 - 8.1]} size={[92, 1.5, 16.2]}>
          <meshStandardMaterial color="#0d0e10" roughness={0.6} />
        </Bx>
        <RoundedBox args={[w * 0.36, 0.5, padD]} radius={0.2} smoothness={2} position={[0, topY + 0.1, kz0 + 6 * 19 - 4 + padD / 2]}>
          <meshStandardMaterial color={g.deck} roughness={0.5} metalness={0.35} />
        </RoundedBox>
        <mesh position={[0, topY + 3.4, -d / 2 + 6]} rotation={[0, 0, HALF]}>
          <cylinderGeometry args={[4.4, 4.4, w * 0.74, 20]} />
          <Alu color={g.body} roughness={0.45} metalness={0.5} />
        </mesh>

        <group position={[0, topY + 3.4, -d / 2 + 6]} rotation={[-0.34, 0, 0]}>
          <Part slot="case" explode={[0, 0, -26]} order={6} fade={1}>
            <RoundedBox args={[w, lidH, 2]} radius={0.9} smoothness={3} position={[0, lidH / 2, -lidT + 1]}>
              <Alu color={g.body} roughness={0.45} metalness={0.55} />
            </RoundedBox>
            {g.logo === 'slash' && (
              <mesh position={[w * 0.08, lidH * 0.52, -lidT - 0.1]} rotation={[0, Math.PI, -0.62]} userData={{ noShadow: true }}>
                <planeGeometry args={[w * 0.92, 2.6]} />
                <Led color="#ffffff" intensity={1.6} />
              </mesh>
            )}
            {g.logo === 'ring' && (
              <mesh position={[0, lidH * 0.5, -lidT - 0.1]} rotation={[0, Math.PI, 0]} userData={{ noShadow: true }}>
                <ringGeometry args={[15, 19, 48]} />
                <Led color={rgb} intensity={2} />
              </mesh>
            )}
            {g.logo === 'bar' && (
              <Bx at={[-w / 2 + 14, lidH * 0.5 - 24, -lidT - 0.5]} size={[9, 48, 0.6]}>
                <Alu color="#d0d4d9" roughness={0.3} />
              </Bx>
            )}
          </Part>
          <Part slot="display" explode={[0, 0, 38]} order={7} fade={1}>
            <RoundedBox args={[w - 1, lidH - 1, lidT - 2]} radius={0.9} smoothness={3} position={[0, lidH / 2, -(lidT - 2) / 2]}>
              <meshStandardMaterial color="#050607" roughness={0.25} metalness={0.3} />
            </RoundedBox>
            <mesh position={[0, lidH - 5 - sh / 2, 0.15]} userData={{ noShadow: true }}>
              <planeGeometry args={[sw, sh]} />
              <meshStandardMaterial color="#000000" emissive="#ffffff" emissiveMap={screen} emissiveIntensity={1.25} roughness={0.3} />
            </mesh>
            <mesh position={[0, lidH - 2.6, 0.2]}>
              <circleGeometry args={[1, 16]} />
              <meshStandardMaterial color="#1b2330" roughness={0.1} metalness={0.8} />
            </mesh>
          </Part>
        </group>
      </Part>
    </group>
  )
}
