import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { Build, Case, Cooler, Cpu, Gpu, Motherboard, Psu, Ram, Storage } from '../data/types'
import { getParts } from '../logic/evaluate'
import { useStore } from '../store'
import { Part } from './Part'
import { Alu, Bx, Copper, Fan, Fins, Gold, Label, Led, MeshPanel, Plastic, Rotor, Steel, roundedRect, type V3 } from './prims'
import { pcbTexture, textTexture } from './textures'

/*
 * Alt måles i millimeter. x går fra bakveggen mot fronten, y oppover fra bunnen,
 * og z fra høyre sidepanel mot glasset. Hovedkortet står altså i xy-planet.
 */

const PCB = 1.6
const BOARD = { ATX: { w: 244, h: 305 }, mATX: { w: 244, h: 244 } }
const SOCKET = { u: 112, v: 80 }
const DIMM_U = [178, 187.5, 197, 206.5]
const PCIE_V = 165
const HALF = Math.PI / 2

function layout(cs: Case, mb: Motherboard) {
  const { w: W, h: H, d: D } = cs.dims
  const tray = Math.max(18, W - cs.coolerMax - 20)
  const boardZ = tray + 7
  const surf = boardZ + PCB
  const boardX = 12
  const boardTop = H - 46
  return {
    W, H, D, tray, boardZ, surf, boardX, boardTop,
    board: BOARD[mb.form],
    shroudTop: 112,
    sx: boardX + SOCKET.u,
    sy: boardTop - SOCKET.v,
    cpuTop: surf + 7.5,
  }
}
type L = ReturnType<typeof layout>

// ───────────────────────────── Kabinett ─────────────────────────────

function CaseModel({ cs, l, rgb, glass }: { cs: Case; l: L; rgb: string; glass: boolean }) {
  const { W, H, D, tray, shroudTop, boardTop, boardX, board } = l
  const dark = cs.color === 'black'
  const body = dark ? '#17191d' : '#b4b9bf'
  const inner = dark ? '#0f1114' : '#a4a9b0'
  const metal = dark ? 0.55 : 0.18
  const t = 2
  const fanFrame = dark ? '#131518' : '#bfc4ca'
  const fanBlade = dark ? '#272b31' : '#cdd1d6'
  const led = cs.style === 'slats' ? undefined : rgb
  const fs = cs.fanSize >= 140 ? 140 : 120
  const fanY = boardTop - 80
  const fanZ = tray + 115
  const frontY0 = (cs.frontFans === 3 ? 22 : 44) + fs / 2
  const brand = textTexture(512, 96, [{ t: cs.brand.toUpperCase(), size: 54, weight: 600, color: dark ? '#5b616b' : '#6f757d', y: 0.52, spacing: 6 }])

  const S = (at: V3, size: V3, color = body) => (
    <Bx at={at} size={size}>
      <Steel color={color} metalness={metal} />
    </Bx>
  )
  const slotRows = Math.floor((boardTop - PCIE_V - 10 - shroudTop - 12) / 20.32) + 1
  const slatCount = Math.floor((W - 10) / 11.4)

  return (
    <>
      <Part slot="case" order={0}>
        {/* Bunn, høyre side og tak */}
        {S([0, -t, 0], [D, t, W])}
        {S([0, 0, -t], [D, H, t])}
        {S([0, H, 0], [34, t, W])}
        {S([D - 50, H, 0], [50, t, W])}
        {S([34, H, 0], [D - 84, t, 14])}
        {S([34, H, W - 14], [D - 84, t, 14])}
        <MeshPanel size={[D - 84, W - 28]} color={body} position={[34 + (D - 84) / 2, H + 1, W / 2]} rotation={[-HALF, 0, 0]} />

        {/* Bakvegg: I/O-felt, viftegitter, utvidelsesspor og åpning til strømforsyningen */}
        {S([-t, boardTop + 12, 0], [t, H - boardTop - 12, W])}
        {S([-t, boardTop - 165, 0], [t, 177, tray + 55])}
        <Bx at={[-t - 0.7, boardTop - 160, tray + 9]} size={[0.9, 162, 46]}>
          <Alu color="#8b9199" />
        </Bx>
        {[18, 46, 74, 102, 126].map((v, i) => (
          <Bx key={i} at={[-t - 1.4, boardTop - v - 16, tray + 14]} size={[1, i === 4 ? 26 : 16, i % 2 ? 30 : 16]}>
            <Plastic color="#08090b" />
          </Bx>
        ))}
        <MeshPanel
          size={[W - tray - 55, 177]}
          color={body}
          position={[-1, boardTop - 165 + 88.5, tray + 55 + (W - tray - 55) / 2]}
          rotation={[0, -HALF, 0]}
        />
        {S([-t, 100, 0], [t, boardTop - 265, W])}
        {Array.from({ length: slotRows }, (_, i) => (
          <Bx key={i} at={[-t - 0.7, boardTop - PCIE_V - 18 - i * 20.32, tray + 10]} size={[0.9, 16, 122]}>
            <Alu color="#7d838b" roughness={0.5} />
          </Bx>
        ))}
        {S([-t, 0, 0], [t, 100, tray + 4])}
        {S([-t, 0, tray + 158], [t, 100, W - tray - 158])}
        {S([-t, 92, tray + 4], [t, 8, 154])}
        {S([-t, 0, tray + 4], [t, 3, 154])}

        {/* Hovedkortbrett med kabelgjennomføringer */}
        {S([0, shroudTop, tray - t], [D - 58, H - shroudTop, t], inner)}
        {[70, 155, 240].map(
          (v) =>
            boardTop - v - 62 > shroudTop + 8 && (
              <Bx key={v} at={[boardX + board.w + 10, boardTop - v - 62, tray - 0.4]} size={[24, 62, 0.8]}>
                <Plastic color="#050607" />
              </Bx>
            ),
        )}

        {/* Deksel over strømforsyningen */}
        {S([0, shroudTop - t, tray], [D - 62, t, W - tray - 3], inner)}
        {S([0, 0, W - 5], [D - 62, shroudTop, t], inner)}
        {S([D - 64, 0, tray], [t, shroudTop, W - tray - 3], inner)}
        <Label tex={brand} size={[110, 20.6]} position={[D - 140, shroudTop / 2, W - 2.6]} />

        {/* Front */}
        {cs.style === 'mesh' ? (
          <>
            {S([D, 0, 0], [14, H, 16])}
            {S([D, 0, W - 16], [14, H, 16])}
            {S([D, H - 18, 16], [14, 18, W - 32])}
            {S([D, 0, 16], [14, 22, W - 32])}
            <MeshPanel size={[W - 32, H - 40]} color={body} position={[D + 12, 22 + (H - 40) / 2, W / 2]} rotation={[0, HALF, 0]} />
          </>
        ) : (
          <>
            {S([D, 0, 0], [16, 26, W])}
            {S([D, H - 18, 0], [16, 18, W])}
            <MeshPanel size={[W - 4, H - 44]} color="#0a0b0d" position={[D + 3, 26 + (H - 44) / 2, W / 2]} rotation={[0, HALF, 0]} />
            {Array.from({ length: slatCount }, (_, i) => (
              <Bx key={i} at={[D + 4, 26, 6 + i * 11.4]} size={[12, H - 44, 7.4]}>
                <meshStandardMaterial color="#8a5c3a" roughness={0.78} metalness={0} />
              </Bx>
            ))}
          </>
        )}

        {/* Føtter og knapper på toppen */}
        {[24, D - 70].map((x) =>
          [14, W - 40].map((z) => (
            <Bx key={`${x}${z}`} at={[x, -18, z]} size={[46, 16, 26]}>
              <Plastic color={cs.style === 'slats' ? '#9a7a3e' : '#0b0c0e'} />
            </Bx>
          )),
        )}
        <Bx at={[D - 44, H + t, W - 62]} size={[32, 1, 50]}>
          <Plastic color="#0b0c0e" />
        </Bx>
        <mesh position={[D - 28, H + t + 1.6, W - 24]}>
          <cylinderGeometry args={[6.5, 6.5, 2.4, 28]} />
          <Alu color={cs.style === 'slats' ? '#b08d45' : '#9aa0a8'} />
        </mesh>
        {[40, 54].map((z) => (
          <Bx key={z} at={[D - 34, H + t + 0.6, W - z - 9]} size={[12, 1, 5]}>
            <Plastic color="#1f6fd0" />
          </Bx>
        ))}

        {/* Vifter: kald luft inn foran, varm luft ut bak */}
        {Array.from({ length: cs.frontFans }, (_, i) => (
          <Fan
            key={i}
            size={fs}
            frame={fanFrame}
            blade={fanBlade}
            led={led}
            position={[D - 21, frontY0 + i * (fs + 6), (W + tray) / 2]}
            rotation={[0, HALF, 0]}
          />
        ))}
        <Fan size={120} frame={fanFrame} blade={fanBlade} led={led} position={[16, fanY, fanZ]} rotation={[0, HALF, 0]} speed={1.15} />
      </Part>

      {glass && (
        <Part slot="case" explode={[0, 0, 300]} order={9}>
          <Bx at={[3, 3, W]} size={[D - 6, H - 6, 3]} raycast={() => null} userData={{ noShadow: true }}>
            <meshPhysicalMaterial
              color="#9db3c9"
              transparent
              opacity={0.11}
              roughness={0.03}
              metalness={0.1}
              envMapIntensity={1.8}
              depthWrite={false}
            />
          </Bx>
          {(
            [
              [[0, 0, W], [D, 7, 3.4]],
              [[0, H - 7, W], [D, 7, 3.4]],
              [[0, 7, W], [7, H - 14, 3.4]],
              [[D - 7, 7, W], [7, H - 14, 3.4]],
            ] as [V3, V3][]
          ).map(([at, size], i) => (
            <Bx key={i} at={at} size={size} raycast={() => null} userData={{ noShadow: true }}>
              <Plastic color="#07080a" />
            </Bx>
          ))}
        </Part>
      )}
    </>
  )
}

// ───────────────────────────── Hovedkort ─────────────────────────────

function Heatsink({ at, size, n = 5, axis = 1, color = '#2b2f36' }: { at: V3; size: V3; n?: number; axis?: 0 | 1; color?: string }) {
  const base = size[2] * 0.5
  const pitch = size[axis] / n
  return (
    <>
      <Bx at={at} size={[size[0], size[1], base]}>
        <Alu color={color} roughness={0.5} />
      </Bx>
      {Array.from({ length: n }, (_, i) => {
        const a: V3 = [...at]
        a[axis] += i * pitch + pitch * 0.14
        a[2] += base
        const s: V3 = [...size]
        s[axis] = pitch * 0.72
        s[2] = size[2] - base
        return (
          <Bx key={i} at={a} size={s}>
            <Alu color={color} roughness={0.5} />
          </Bx>
        )
      })}
    </>
  )
}

function MotherboardModel({ mb, l, rgb }: { mb: Motherboard; l: L; rgb: string }) {
  const { board } = l
  const atx = mb.form === 'ATX'
  const tex = pcbTexture('black')
  const chip = textTexture(256, 256, [
    { t: mb.chipset, size: 84, weight: 700, color: '#c9ced6', y: 0.44 },
    { t: mb.brand.toUpperCase(), size: 40, weight: 500, color: '#7b828c', y: 0.72, spacing: 4 },
  ])
  // u/v er avstand fra kortets bakre og øvre kant
  const on = (u: number, v: number, len: number, z = 0): V3 => [u, -(v + len), PCB + z]
  const slot = (v: number, shielded: boolean) => (
    <>
      <Bx at={on(56, v, 8)} size={[90, 8, 11]}>
        {shielded ? <Alu color="#b5bac2" roughness={0.3} /> : <Plastic color="#0c0d0f" />}
      </Bx>
      <Bx at={on(146, v - 1, 10)} size={[7, 10, 9]}>
        <Plastic color="#d8dade" />
      </Bx>
    </>
  )
  const m2 = (u: number, v: number, w: number, z: number) => (
    <>
      <Bx at={on(u, v, 26, z)} size={[w, 26, 4]}>
        <Alu color="#30343b" roughness={0.42} />
      </Bx>
      <Bx at={on(u + 5, v + 11.5, 3, z + 4)} size={[w - 10, 3, 0.5]}>
        <Alu color="#565c66" />
      </Bx>
    </>
  )
  return (
    <group position={[l.boardX, l.boardTop, l.boardZ]}>
      <Bx at={[0, -board.h, 0]} size={[board.w, board.h, PCB]}>
        <meshStandardMaterial map={tex} roughness={0.55} metalness={0.25} />
      </Bx>

      {/* I/O-deksel og porter som stikker ut bak */}
      <Bx at={on(0, 4, 138)} size={[46, 138, 38]}>
        <Plastic color="#17191d" />
      </Bx>
      <Bx at={on(34, 14, 118, 38)} size={[3, 118, 1.2]} userData={{ noShadow: true }}>
        <Led color={rgb} intensity={2} />
      </Bx>
      <Bx at={on(-9, 8, 132)} size={[12, 132, 30]}>
        <Alu color="#9097a0" />
      </Bx>

      {/* Kjøleribber over spenningsregulatorene (VRM) */}
      <Heatsink at={on(50, 22, 96)} size={[20, 96, 30]} n={7} />
      <Heatsink at={on(74, 5, 20)} size={[86, 20, 26]} n={6} axis={0} />
      {Array.from({ length: 8 }, (_, i) => (
        <Bx key={i} at={on(74, 32 + i * 10.6, 7)} size={[7, 7, 6]}>
          <Plastic color="#3a3d44" />
        </Bx>
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <Bx key={i} at={on(84 + i * 10.6, 29, 7)} size={[7, 7, 6]}>
          <Plastic color="#3a3d44" />
        </Bx>
      ))}
      <Bx at={on(166, 0.5, 5)} size={[38, 5, 12]}>
        <Plastic color="#0c0d0f" />
      </Bx>

      {/* Sokkel */}
      <Bx at={on(SOCKET.u - 23, SOCKET.v - 23, 46)} size={[46, 46, 3.4]}>
        <Plastic color="#22252a" />
      </Bx>
      {(
        [
          [SOCKET.u - 29, SOCKET.v - 29, 58, 5],
          [SOCKET.u - 29, SOCKET.v + 24, 58, 5],
          [SOCKET.u - 29, SOCKET.v - 24, 5, 48],
          [SOCKET.u + 24, SOCKET.v - 24, 5, 48],
        ] as const
      ).map(([u, v, w, len], i) => (
        <Bx key={i} at={on(u, v, len, 1)} size={[w, len, 4.2]}>
          <Alu color="#aeb3ba" roughness={0.3} />
        </Bx>
      ))}
      <Bx at={on(SOCKET.u + 31, SOCKET.v - 24, 44, 2)} size={[2, 44, 2]}>
        <Alu color="#c8ccd2" />
      </Bx>

      {/* Minnespor */}
      {DIMM_U.map((u, i) => (
        <group key={u}>
          <Bx at={on(u - 3.3, 10, 142)} size={[6.6, 142, 7.5]}>
            <Plastic color={i % 2 ? '#101114' : '#2c2f35'} />
          </Bx>
          <Bx at={on(u - 3.6, 5, 6)} size={[7.2, 6, 10]}>
            <Plastic color="#d8dade" />
          </Bx>
        </group>
      ))}
      <Bx at={on(229, 56, 52)} size={[10, 52, 13]}>
        <Plastic color="#0c0d0f" />
      </Bx>

      {/* M.2-plasser med kjøleplate, utvidelsesspor og brikkesett */}
      {m2(90, 123, 92, 5.5)}
      <Bx at={on(92, 132, 8, 0)} size={[5, 8, 5.5]}>
        <Plastic color="#0c0d0f" />
      </Bx>
      {slot(161, true)}
      {m2(70, 178, 112, 3)}
      <Bx at={on(186, 160, 82)} size={[52, 82, 11]}>
        <Alu color="#272a30" roughness={0.45} />
      </Bx>
      <Label tex={chip} size={[44, 44]} position={[212, -201, PCB + 11.3]} />
      <Bx at={on(187, 163, 76, 11)} size={[1.6, 76, 0.8]} userData={{ noShadow: true }}>
        <Led color={rgb} intensity={1.6} />
      </Bx>
      {slot(222, false)}
      {atx && (
        <>
          {m2(70, 246, 112, 3)}
          {slot(283, false)}
        </>
      )}
      <Bx at={on(236, 172, 56)} size={[8, 56, 14]}>
        <Plastic color="#0c0d0f" />
      </Bx>
      <mesh position={[164, -(board.h - 20), PCB + 1.6]} rotation={[HALF, 0, 0]}>
        <cylinderGeometry args={[10, 10, 3.2, 28]} />
        <Alu color="#c4c8ce" roughness={0.25} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <Bx key={i} at={on(18 + i * 36, board.h - 9, 5)} size={[16, 5, 8]}>
          <Plastic color="#0c0d0f" />
        </Bx>
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[12 + i * 7, -(board.h - 34), PCB + 5]} rotation={[HALF, 0, 0]}>
          <cylinderGeometry args={[2.6, 2.6, 10, 14]} />
          <Gold />
        </mesh>
      ))}
    </group>
  )
}

// ───────────────────────────── Prosessor ─────────────────────────────

function CpuModel({ cpu, l }: { cpu: Cpu; l: L }) {
  const amd = cpu.brand === 'AMD'
  const m = cpu.short.toUpperCase().match(/^(RYZEN \d|CORE ULTRA \d) (.+)$/)
  const tex = textTexture(256, 256, [
    { t: amd ? 'AMD' : 'intel', size: amd ? 58 : 64, weight: 700, color: '#2f3237', y: 0.24 },
    { t: m?.[1] ?? '', size: 44, weight: 600, color: '#3a3d43', y: 0.52, spacing: 2 },
    { t: m?.[2] ?? cpu.short, size: 56, weight: 700, color: '#2f3237', y: 0.78 },
  ])
  const w = amd ? 37 : 33
  const h = amd ? 37 : 41
  return (
    <group position={[l.sx, l.sy, l.surf]}>
      <Bx at={[-20, -20, 3.2]} size={[40, 40, 1.2]}>
        <meshStandardMaterial color={amd ? '#1d5a3a' : '#22503f'} roughness={0.5} />
      </Bx>
      <Bx at={[-w / 2, -h / 2, 4.4]} size={[w, h, 3.1]}>
        <meshStandardMaterial color="#d6dae0" metalness={0.72} roughness={0.3} />
      </Bx>
      <Label tex={tex} size={[w - 5, w - 5]} position={[0, 0, 7.62]} />
    </group>
  )
}

// ───────────────────────────── CPU-kjøler ─────────────────────────────

function Tower({ x, y, z, h, wide, depth }: { x: number; y: number; z: number; h: number; wide: number; depth: number }) {
  return (
    <>
      <Fins axis={2} from={z + 38} to={z + h - 4} pitch={2.5} center={[x, y, 0]} plate={[depth, wide, 0.6]} />
      <Bx at={[x - depth / 2, y - wide / 2, z + h - 2.5]} size={[depth, wide, 2.5]}>
        <Alu color="#2a2d33" roughness={0.4} />
      </Bx>
      {[-0.4, -0.24, -0.08, 0.08, 0.24, 0.4].map((f) => (
        <mesh key={f} position={[x, y + f * wide, z + 6 + (h - 5) / 2]} rotation={[HALF, 0, 0]}>
          <cylinderGeometry args={[3, 3, h - 5, 14]} />
          <Copper />
        </mesh>
      ))}
    </>
  )
}

/** Slange mellom pumpe og radiator */
function Hose({ points }: { points: V3[] }) {
  const key = points.flat().join(',')
  const g = useMemo(
    () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), 40, 5.6, 10),
    [key], // eslint-disable-line
  )
  useEffect(() => () => g.dispose(), [g])
  return (
    <mesh geometry={g}>
      <meshStandardMaterial color="#0b0c0e" roughness={0.75} />
    </mesh>
  )
}

function CoolerModel({ cooler, cs, l, rgb }: { cooler: Cooler; cs: Case; l: L; rgb: string }) {
  const { sx, sy, cpuTop: z, H, D, tray } = l
  const noctua = cooler.brand === 'Noctua'
  const frame = noctua ? '#d8c7ab' : '#131518'
  const blade = noctua ? '#6a4636' : '#2a2e34'
  const h = cooler.height
  const base = (
    <>
      <Bx at={[sx - 21, sy - 21, z]} size={[42, 42, 9]}>
        <Alu color="#bfc3c9" roughness={0.25} />
      </Bx>
      <Bx at={[sx - 42, sy - 6, z + 9]} size={[84, 12, 4]}>
        <Steel color="#2a2d32" />
      </Bx>
    </>
  )

  if (cooler.type === 'stock') {
    return (
      <>
        {base}
        <mesh position={[sx, sy, z + 23]} rotation={[HALF, 0, 0]}>
          <cylinderGeometry args={[45, 38, 22, 44, 1]} />
          <Alu color="#8e949c" roughness={0.5} />
        </mesh>
        {Array.from({ length: 30 }, (_, i) => (
          <mesh key={i} position={[sx, sy, z + 23]} rotation={[0, 0, (i / 30) * Math.PI]}>
            <boxGeometry args={[92, 1, 23]} />
            <Alu color="#aab0b8" />
          </mesh>
        ))}
        <mesh position={[sx, sy, z + 44]} rotation={[HALF, 0, 0]}>
          <cylinderGeometry args={[47, 47, 18, 44, 1, true]} />
          <Plastic color="#111316" side={THREE.DoubleSide} />
        </mesh>
        <group position={[sx, sy, z + 44]}>
          <Rotor r={43} blades={7} color="#1c1e22" depth={14} />
        </group>
      </>
    )
  }

  if (cooler.type === 'aio') {
    const radLen = cooler.radiator + 34
    const x0 = Math.min(D - radLen - 40, Math.max(40, (D - radLen) / 2 + 20))
    const zr = tray + 48
    const yr = H - 8 - 27
    const fanY = yr - 13
    const hose = (dz: number): V3[] => [
      [sx + 26, sy + 8 + dz, z + 26],
      [sx + 62, sy + 22 + dz, z + 62],
      [x0 + radLen - 34, yr - 86, zr + 60 + dz],
      [x0 + radLen - 9, yr - 26, zr + 60 + dz],
      [x0 + radLen - 9, yr + 6, zr + 60 + dz],
    ]
    return (
      <>
        <Bx at={[sx - 22, sy - 22, z]} size={[44, 44, 4]}>
          <Copper />
        </Bx>
        <mesh position={[sx, sy, z + 24]} rotation={[HALF, 0, 0]}>
          <cylinderGeometry args={[33, 35, 40, 48]} />
          <Plastic color="#101215" />
        </mesh>
        <mesh position={[sx, sy, z + 44.4]} rotation={[HALF, 0, 0]}>
          <cylinderGeometry args={[30, 30, 1, 48]} />
          <meshStandardMaterial color="#050608" roughness={0.1} metalness={0.6} />
        </mesh>
        <mesh position={[sx, sy, z + 45]} userData={{ noShadow: true }}>
          <torusGeometry args={[24, 1.6, 10, 64]} />
          <Led color={rgb} />
        </mesh>
        <Bx at={[sx + 20, sy - 4, z + 14]} size={[14, 28, 22]}>
          <Plastic color="#101215" />
        </Bx>
        {[-9, 9].map((dz) => (
          <Hose key={dz} points={hose(dz)} />
        ))}
        {/* Radiator i toppen med vifter under */}
        <Bx at={[x0, yr, zr]} size={[radLen, 27, 120]}>
          <Steel color="#0d0e10" roughness={0.6} />
        </Bx>
        <Fins axis={0} from={x0 + 20} to={x0 + radLen - 20} pitch={3} center={[0, yr - 0.4, zr + 60]} plate={[0.7, 1, 108]} color="#3b3f46" />
        {Array.from({ length: cooler.fans }, (_, i) => (
          <Fan
            key={i}
            position={[x0 + 17 + 60 + i * 120, fanY, zr + 60]}
            rotation={[HALF, 0, 0]}
            led={cs.style === 'slats' ? undefined : rgb}
            speed={1.1}
          />
        ))}
      </>
    )
  }

  const big = h >= 165
  const wide = big ? 146 : 122
  const fs = big ? 140 : 120
  const fanZ = z + h - 2 - fs / 2
  const label = textTexture(256, 64, [{ t: cooler.brand.toUpperCase(), size: 36, color: noctua ? '#d8c7ab' : '#8d939c', y: 0.55, spacing: 5 }])

  if (cooler.type === 'single') {
    return (
      <>
        {base}
        <Bx at={[sx - 5, sy - wide * 0.42, z + 7]} size={[10, wide * 0.84, 5]}>
          <Copper />
        </Bx>
        <Tower x={sx} y={sy} z={z} h={h} wide={wide} depth={48} />
        <Label tex={label} size={[60, 15]} position={[sx, sy, z + h + 0.3]} />
        <Fan size={fs} frame={frame} blade={blade} position={[sx + 37, sy, fanZ]} rotation={[0, -HALF, 0]} />
      </>
    )
  }
  // To tårn, forskjøvet litt bakover så frontviften går klar av minnet
  const c = sx - 12
  return (
    <>
      {base}
      <Bx at={[c - 62, sy - wide * 0.42, z + 7]} size={[100, wide * 0.84, 5]}>
        <Copper />
      </Bx>
      <Tower x={c - 33.5} y={sy} z={z} h={h} wide={wide} depth={40} />
      <Tower x={c + 33.5} y={sy} z={z} h={h} wide={wide} depth={40} />
      <Label tex={label} size={[60, 15]} position={[c + 33.5, sy, z + h + 0.3]} rotation={[0, 0, HALF]} />
      <Fan size={fs} frame={frame} blade={blade} position={[c, sy, fanZ]} rotation={[0, -HALF, 0]} />
      <Fan size={fs} frame={frame} blade={blade} position={[c + 66.5, sy, fanZ]} rotation={[0, -HALF, 0]} />
    </>
  )
}

// ───────────────────────────── Minne ─────────────────────────────

function RamModel({ ram, l, rgb }: { ram: Ram; l: L; rgb: string }) {
  const slots = ram.sticks >= 4 ? [0, 1, 2, 3] : ram.sticks === 2 ? [1, 3] : [1]
  const body = ram.color === 'white' ? '#e8eaee' : ram.color === 'silver' ? '#b9bec6' : '#1a1c20'
  const hh = ram.rgb ? 36 : 30
  const tex = textTexture(512, 96, [
    { t: ram.brand.toUpperCase(), size: 44, weight: 700, color: ram.color === 'black' ? '#aab0b8' : '#30343a', y: 0.5, x: 0.06, align: 'left', spacing: 3 },
    { t: `${ram.type}  ${ram.perStick} GB`, size: 36, weight: 500, color: ram.color === 'black' ? '#7c838d' : '#50555d', y: 0.52, x: 0.94, align: 'right' },
  ])
  const yTop = l.boardTop - 14.5
  return (
    <>
      {slots.map((s) => {
        const x = l.boardX + DIMM_U[s]
        return (
          <group key={s} position={[x, yTop - 133, l.surf + 4]}>
            <Bx at={[-0.65, 0, 0]} size={[1.3, 133, 30]}>
              <meshStandardMaterial color={ram.type === 'DDR4' ? '#1c4f38' : '#101214'} roughness={0.5} />
            </Bx>
            <Bx at={[-0.75, 4, -3]} size={[1.5, 125, 3.4]}>
              <Gold />
            </Bx>
            <Bx at={[-3.3, 0, 5]} size={[6.6, 133, hh]}>
              <Alu color={body} roughness={0.45} metalness={ram.color === 'black' ? 0.6 : 0.85} />
            </Bx>
            {ram.rgb && (
              <Bx at={[-2.7, 1.5, 5 + hh]} size={[5.4, 130, 6]} userData={{ noShadow: true }}>
                <Led color={rgb} intensity={2.4} />
              </Bx>
            )}
            <group position={[3.4, 66.5, 5 + hh / 2]} rotation={[0, HALF, 0]}>
              <Label tex={tex} size={[118, 22]} rotation={[0, 0, HALF]} />
            </group>
          </group>
        )
      })}
    </>
  )
}

// ───────────────────────────── Skjermkort ─────────────────────────────

const GPU_LOOK = {
  NVIDIA: { shroud: '#1b1d21', plate: '#25282d', accent: '#76b900', logo: 'GEFORCE RTX' },
  AMD: { shroud: '#17181b', plate: '#2a2b2f', accent: '#e23a34', logo: 'RADEON' },
  Intel: { shroud: '#20242b', plate: '#2b3038', accent: '#3d8bff', logo: 'ARC' },
}

function GpuModel({ gpu, l, rgb }: { gpu: Gpu; l: L; rgb: string }) {
  const look = GPU_LOOK[gpu.maker]
  const Lg = gpu.length
  const T = gpu.slots * 20
  const Hc = gpu.height
  const n = gpu.fans
  const pitch = (Lg - 14) / n
  const rf = Math.min((Hc - 14) / 2, pitch / 2 - 3)
  const rows = Math.ceil(gpu.slots)

  const { shroud, plate } = useMemo(() => {
    // Viftedeksel på undersiden, med ett hull per vifte
    const s = roundedRect(Lg - 4, Hc, 6, 4, 0)
    for (let i = 0; i < n; i++) {
      const hole = new THREE.Path()
      hole.absarc(8 + pitch * (i + 0.5), Hc / 2, rf, 0, Math.PI * 2, true)
      s.holes.push(hole)
    }
    const shroud = new THREE.ExtrudeGeometry(s, { depth: 6, bevelEnabled: false, curveSegments: 36 })
    shroud.rotateX(HALF)
    // Bakplate med åpning der luften blåser rett gjennom
    const p = roundedRect(Lg - 2, Hc - 2, 4, 2, 1)
    if (Lg > 265) {
      const hole = new THREE.Path()
      const x0 = Lg * 0.7
      hole.moveTo(x0, 16)
      hole.lineTo(x0, Hc - 16)
      hole.lineTo(Lg - 16, Hc - 16)
      hole.lineTo(Lg - 16, 16)
      hole.closePath()
      p.holes.push(hole)
    }
    const plate = new THREE.ExtrudeGeometry(p, { depth: 2, bevelEnabled: false })
    plate.rotateX(HALF)
    return { shroud, plate }
  }, [Lg, Hc, n, pitch, rf])

  const logo = textTexture(512, 96, [{ t: look.logo, size: 62, weight: 700, color: '#ffffff', y: 0.54, spacing: 8 }])
  const model = textTexture(512, 128, [{ t: gpu.short.replace(/^(RTX|RX|Arc) /, ''), size: 84, weight: 700, color: '#6c727c', y: 0.54, spacing: 4 }])
  const pins = gpu.connector === '12V-2x6' ? 1 : Number(gpu.connector[0])

  return (
    <group position={[0, l.boardTop - PCIE_V, l.surf + 11]}>
      {/* Brakett mot bakveggen */}
      <Bx at={[-3.4, 12 - rows * 20.32, -8]} size={[1.4, rows * 20.32, 120]}>
        <Alu color="#9aa0a8" roughness={0.4} />
      </Bx>
      {[14, 40, 66].map((z) => (
        <Bx key={z} at={[-4, -13, z]} size={[1, 6, 18]}>
          <Plastic color="#07080a" />
        </Bx>
      ))}
      {/* Kretskort og kontaktflate */}
      <Bx at={[0, -0.8, 0]} size={[Math.min(Lg - 14, 196), 1.6, 100]}>
        <meshStandardMaterial color="#0d0e10" roughness={0.5} />
      </Bx>
      <Bx at={[58, -0.8, -8]} size={[84, 1.6, 8]}>
        <Gold />
      </Bx>
      <mesh geometry={plate} position={[0, 4.5, 0]}>
        <Alu color={look.plate} roughness={0.42} />
      </mesh>
      <group position={[Lg * 0.3, 4.7, Hc / 2]} rotation={[-HALF, 0, 0]}>
        <Label tex={model} size={[Math.min(120, Lg * 0.36), Math.min(30, Lg * 0.09)]} />
      </group>
      {/* Kjøleribber */}
      <Fins axis={0} from={10} to={Lg - 8} pitch={3.3} center={[0, (12 - T) / 2, Hc / 2]} plate={[0.7, T - 18, Hc - 14]} color="#7d838c" />
      {/* Deksel og sider */}
      <mesh geometry={shroud} position={[0, -T + 6, 0]}>
        <Plastic color={look.shroud} />
      </mesh>
      <Bx at={[4, -T + 2, Hc - 3]} size={[Lg - 8, T - 8, 3]}>
        <Plastic color={look.shroud} />
      </Bx>
      <Bx at={[4, -T + 2, 0]} size={[Lg - 8, T - 12, 3]}>
        <Plastic color={look.shroud} />
      </Bx>
      <Bx at={[Lg - 4, -T + 2, 0]} size={[4, T - 4, Hc]}>
        <Plastic color={look.shroud} />
      </Bx>
      <Label tex={logo} size={[Math.min(124, Lg * 0.42), Math.min(23, Lg * 0.08)]} position={[Lg * 0.44, -T / 2 - 1, Hc + 0.3]} glow={1.6} />
      <Bx at={[Lg * 0.08, -5.5, Hc - 0.4]} size={[Lg * 0.84, 1.6, 1.4]} userData={{ noShadow: true }}>
        <Led color={rgb} intensity={2.2} />
      </Bx>
      <Bx at={[Lg * 0.08, -T + 4, Hc - 0.4]} size={[Lg * 0.2, 1.4, 1.2]} userData={{ noShadow: true }}>
        <Led color={look.accent} intensity={1.8} />
      </Bx>
      {/* Strømkontakt */}
      <Bx at={[Lg * 0.6, -13, Hc]} size={[pins === 1 && gpu.connector === '12V-2x6' ? 22 : 19 * pins, 9, 7]}>
        <Plastic color="#08090b" />
      </Bx>
      {Array.from({ length: n }, (_, i) => (
        <group key={i} position={[8 + pitch * (i + 0.5), -T + 9, Hc / 2]} rotation={[HALF, 0, 0]}>
          <Rotor r={rf - 1.5} blades={11} color="#15171a" depth={9} speed={i % 2 ? -1 : 1} />
        </group>
      ))}
    </group>
  )
}

// ───────────────────────────── Lagring ─────────────────────────────

function SsdModel({ ssd, l }: { ssd: Storage; l: L }) {
  const tex = textTexture(512, 144, [
    { t: ssd.brand, size: 50, weight: 700, color: '#15171a', y: 0.36, x: 0.05, align: 'left' },
    { t: `${ssd.capacity >= 1000 ? ssd.capacity / 1000 + ' TB' : ssd.capacity + ' GB'}  NVMe ${ssd.iface}`, size: 38, weight: 500, color: '#3b3f46', y: 0.72, x: 0.05, align: 'left' },
  ], '#b4b8bd')
  return (
    <group position={[l.boardX + 97, l.boardTop - 147, l.surf + 2.4]}>
      <Bx at={[0, 0, 0]} size={[80, 22, 0.9]}>
        <meshStandardMaterial color={ssd.brand === 'Samsung' ? '#0c0d10' : '#103a6a'} roughness={0.5} />
      </Bx>
      <Bx at={[-3, 3, 0]} size={[3.4, 16, 0.9]}>
        <Gold />
      </Bx>
      <Bx at={[6, 4, 0.9]} size={[13, 13, 1.1]}>
        <Plastic color="#1b1d21" />
      </Bx>
      {[26, 48].map((x) => (
        <Bx key={x} at={[x, 3, 0.9]} size={[17, 16, 1.1]}>
          <Plastic color="#1b1d21" />
        </Bx>
      ))}
      <Label tex={tex} size={[62, 17.4]} position={[39, 11, 2.2]} />
      <mesh position={[77, 11, 1.4]} rotation={[HALF, 0, 0]}>
        <cylinderGeometry args={[2.6, 2.6, 2, 16]} />
        <Alu />
      </mesh>
    </group>
  )
}

// ───────────────────────────── Strømforsyning ─────────────────────────────

function PsuModel({ psu, l }: { psu: Psu; l: L }) {
  const len = psu.length
  const top = useMemo(() => {
    const s = roundedRect(len, 150, 3)
    const hole = new THREE.Path()
    hole.absarc(len / 2, 75, 60, 0, Math.PI * 2, true)
    s.holes.push(hole)
    const g = new THREE.ExtrudeGeometry(s, { depth: 1.5, bevelEnabled: false, curveSegments: 40 })
    g.rotateX(HALF)
    return g
  }, [len])
  const tex = textTexture(512, 256, [
    { t: `${psu.watt} W`, size: 120, weight: 700, color: '#e9ecef', y: 0.36, x: 0.07, align: 'left' },
    { t: psu.rating.toUpperCase(), size: 44, weight: 600, color: '#d9ac45', y: 0.68, x: 0.07, align: 'left', spacing: 3 },
    { t: psu.brand.toUpperCase(), size: 34, weight: 500, color: '#7f8690', y: 0.86, x: 0.07, align: 'left', spacing: 4 },
  ])
  return (
    <group position={[6, 4, l.tray + 6]}>
      <Bx at={[0, 0, 0]} size={[len, 84.5, 150]}>
        <Steel color="#121316" roughness={0.6} />
      </Bx>
      <mesh geometry={top} position={[0, 86, 0]}>
        <Steel color="#121316" roughness={0.6} />
      </mesh>
      {[20, 38, 56].map((r) => (
        <mesh key={r} position={[len / 2, 86.4, 75]} rotation={[HALF, 0, 0]} userData={{ noShadow: true }}>
          <torusGeometry args={[r, 0.9, 6, 48]} />
          <Alu color="#b9bec6" />
        </mesh>
      ))}
      {[0, 1].map((i) => (
        <mesh key={i} position={[len / 2, 86.4, 75]} rotation={[0, i * HALF, 0]} userData={{ noShadow: true }}>
          <boxGeometry args={[118, 1.2, 2.4]} />
          <Alu color="#b9bec6" />
        </mesh>
      ))}
      <group position={[len / 2, 78, 75]} rotation={[-HALF, 0, 0]}>
        <Rotor r={56} blades={9} color="#1d1f23" depth={12} speed={0.6} />
      </group>
      <Label tex={tex} size={[Math.min(110, len - 20), Math.min(55, (len - 20) / 2)]} position={[len / 2, 42, 150.3]} />
      {/* Bakside: gitter, strøminntak og bryter */}
      <MeshPanel size={[96, 70]} color="#2a2d32" position={[-0.4, 44, 92]} rotation={[0, -HALF, 0]} />
      <Bx at={[-1.2, 22, 12]} size={[1.4, 22, 28]}>
        <Plastic color="#050607" />
      </Bx>
      <Bx at={[-1.6, 54, 16]} size={[1.8, 14, 20]}>
        <Plastic color="#b3261e" />
      </Bx>
      {/* Kontakter til de avtakbare kablene */}
      {Array.from({ length: 10 }, (_, i) => (
        <Bx key={i} at={[len - 0.4, 14 + Math.floor(i / 5) * 30, 14 + (i % 5) * 26]} size={[1.4, 16, 18]}>
          <Plastic color="#050607" />
        </Bx>
      ))}
    </group>
  )
}

// ───────────────────────────── Samlet ─────────────────────────────

export function DesktopModel({ build }: { build: Build }) {
  const rgb = useStore((s) => s.rgb)
  const glass = useStore((s) => s.glass)
  const p = useMemo(() => getParts(build), [build])
  const { cpu, gpu, ram, storage, motherboard: mb, cooler, psu } = p
  const cs = p.case
  if (!cs || !mb || !cpu || !gpu || !ram || !storage || !cooler || !psu) return null
  const l = layout(cs, mb)
  return (
    <group scale={0.01} position={[-l.D / 200, 0.18, -l.W / 200]}>
      <CaseModel cs={cs} l={l} rgb={rgb} glass={glass} />
      <pointLight color={cs.style === 'slats' ? '#fff3e0' : rgb} intensity={2.6} distance={7} decay={1.6} position={[l.D * 0.55, l.H * 0.62, l.W * 0.8]} />
      <pointLight color="#ffffff" intensity={1.4} distance={6} decay={1.6} position={[l.D * 0.3, l.H * 0.9, l.W * 0.6]} />
      <Part slot="motherboard" explode={[0, 0, 45]} flash={mb.id} order={1}>
        <MotherboardModel mb={mb} l={l} rgb={rgb} />
      </Part>
      <Part slot="psu" explode={[-270, 0, 0]} flash={psu.id} order={2}>
        <PsuModel psu={psu} l={l} />
      </Part>
      <Part slot="cpu" explode={[0, 0, 110]} flash={cpu.id} order={3}>
        <CpuModel cpu={cpu} l={l} />
      </Part>
      <Part slot="storage" explode={[0, 0, 85]} flash={storage.id} order={4}>
        <SsdModel ssd={storage} l={l} />
      </Part>
      <Part slot="ram" explode={[0, 0, 150]} flash={ram.id} order={5}>
        <RamModel ram={ram} l={l} rgb={rgb} />
      </Part>
      <Part slot="cooler" explode={[0, 0, 255]} flash={cooler.id} order={6} liftFor={['cpu']}>
        <CoolerModel cooler={cooler} cs={cs} l={l} rgb={rgb} />
      </Part>
      <Part slot="gpu" explode={[0, -8, 200]} flash={gpu.id} order={7}>
        <GpuModel gpu={gpu} l={l} rgb={rgb} />
      </Part>
    </group>
  )
}
