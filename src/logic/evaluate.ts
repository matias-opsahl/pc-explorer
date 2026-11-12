import { catalog, desktopByKind } from '../data/catalog'
import { RES_LABEL, slotText } from '../data/texts'
import type {
  Battery,
  Build,
  Case,
  Component,
  Cooler,
  Cpu,
  DeviceDef,
  Display,
  Goal,
  Gpu,
  Motherboard,
  Psu,
  Ram,
  Res,
  SlotId,
  Storage,
} from '../data/types'

export type Level = 'error' | 'warning' | 'tip'

export interface Issue {
  id: string
  level: Level
  slots: SlotId[]
  title: string
  detail: string
}

export interface Perf {
  fps: number
  /** The ceiling the processor sets */
  cpuCap: number
  /** What the graphics card can manage on its own */
  gpuFps: number
  limiter: 'cpu' | 'gpu' | 'balanced'
  vramShort: boolean
}

export interface Parts {
  cpu?: Cpu
  gpu?: Gpu
  ram?: Ram
  storage?: Storage
  motherboard?: Motherboard
  cooler?: Cooler
  psu?: Psu
  case?: Case
  display?: Display
  battery?: Battery
}

export interface Evaluation {
  price: number
  breakdown: { slot: SlotId | 'base'; label: string; price: number }[]
  perf: Perf
  byRes: Record<Res, number>
  multi: number
  power: { peak: number; gaming: number; psu: number }
  issues: Issue[]
  parts: Parts
}

export function component(build: Build, slot: SlotId): Component | undefined {
  const id = build[slot]
  return id ? catalog[id] : undefined
}

export function getParts(build: Build): Parts {
  const p: Parts = {}
  for (const slot of Object.keys(build) as SlotId[]) {
    const c = component(build, slot)
    if (!c || c.kind === 'info') continue
    // The slot and the part's type have the same name for all types we calculate with
    ;(p as Record<string, Component>)[c.kind] = c
  }
  return p
}

export function optionsFor(device: DeviceDef, slot: SlotId): Component[] {
  if (device.kind === 'desktop') {
    return [...(desktopByKind[slot as keyof typeof desktopByKind] ?? [])]
  }
  return (device.options?.[slot] ?? []).map((id) => catalog[id])
}

// ───────────────────────────── Performance ─────────────────────────────

const CPU_SCALE = { esport: 6, aaa: 2.3, rt: 1.9 }
const GPU_SCALE = { esport: 3.4, aaa: 1, rt: 1 }
const VRAM_NEED: Record<string, Record<Res, number>> = {
  esport: { 1080: 4, 1440: 6, 2160: 8 },
  aaa: { 1080: 8, 1440: 10, 2160: 12 },
  rt: { 1080: 10, 1440: 12, 2160: 16 },
}
const UPSCALE_GAIN = 1.38

function ramFactor(ram: Ram | undefined, profile: Goal['profile']): number {
  if (!ram) return 1
  let f = 1
  if (ram.sticks === 1) f *= 0.87
  if (ram.type === 'DDR5' && ram.form !== 'Soldered') {
    if (ram.speed < 5600) f *= 0.95
    else if (ram.speed < 6000) f *= 0.98
    else if (ram.cl > 32) f *= 0.99
  }
  const total = ram.sticks * ram.perStick
  if (profile !== 'esport') {
    if (total < 16) f *= 0.82
    else if (total < 32) f *= 0.97
  } else if (total < 16) f *= 0.93
  return f
}

export function estimate(p: Parts, goal: Goal, gpuFactor = 1): Perf {
  const { cpu, gpu, ram, cooler } = p
  if (!cpu || !gpu) return { fps: 0, cpuCap: 0, gpuFps: 0, limiter: 'balanced', vramShort: false }

  let cpuCap = cpu.gaming * CPU_SCALE[goal.profile] * ramFactor(ram, goal.profile)
  // Cooler too weak: the processor slows itself down
  if (cooler && cooler.capacity < cpu.tdp) cpuCap *= 0.9

  let gpuFps = gpu.fps[goal.res] * GPU_SCALE[goal.profile] * gpuFactor
  if (goal.profile === 'rt') gpuFps *= gpu.rt
  if (goal.upscale) gpuFps *= UPSCALE_GAIN
  const need = VRAM_NEED[goal.profile][goal.res]
  const vramShort = gpu.vram < need
  if (vramShort) gpuFps *= gpu.vram <= need - 4 ? 0.8 : 0.9

  const k = 4
  const fps = Math.pow(Math.pow(cpuCap, -k) + Math.pow(gpuFps, -k), -1 / k)
  const ratio = gpuFps / cpuCap
  const limiter = ratio > 1.15 ? 'cpu' : ratio < 0.87 ? 'gpu' : 'balanced'
  return { fps: Math.round(fps), cpuCap: Math.round(cpuCap), gpuFps: Math.round(gpuFps), limiter, vramShort }
}

// ───────────────────────────── Power ─────────────────────────────

function powerOf(p: Parts) {
  const cpu = p.cpu?.peak ?? 0
  const gpu = p.gpu?.power ?? 0
  const rest = 60
  return {
    peak: Math.round(cpu + gpu + rest),
    gaming: Math.round((p.cpu?.gamingPower ?? 0) + gpu * 0.9 + 45),
    psu: p.psu?.watt ?? 0,
  }
}

// ───────────────────────────── Compatibility ─────────────────────────────

function desktopIssues(p: Parts, goal: Goal, perf: Perf, power: Evaluation['power']): Issue[] {
  const out: Issue[] = []
  const { cpu, gpu, ram, storage, motherboard: mb, cooler, psu } = p
  const cs = p.case
  const add = (level: Level, id: string, slots: SlotId[], title: string, detail: string) =>
    out.push({ id, level, slots, title, detail })

  if (cpu && mb && cpu.socket !== mb.socket) {
    add('error', 'socket', ['cpu', 'motherboard'], 'The processor does not fit the motherboard',
      `${cpu.short} uses socket ${cpu.socket}, while the motherboard has ${mb.socket}. The pins are arranged differently, so the chip will not sit in the socket. Change one of the parts.`)
  }
  if (ram && mb && ram.type !== mb.ramType) {
    add('error', 'ramtype', ['ram', 'motherboard'], 'The memory does not fit the motherboard',
      `The motherboard has slots for ${mb.ramType}, but the memory is ${ram.type}. The notch on the stick is in a different place, so it will not press in.`)
  }
  if (ram && mb && ram.sticks > mb.ramSlots) {
    add('error', 'ramslots', ['ram', 'motherboard'], 'Too many memory sticks',
      `The kit has ${ram.sticks} sticks, but the motherboard only has ${mb.ramSlots} slots.`)
  }
  if (mb && cs && !cs.forms.includes(mb.form)) {
    add('error', 'form', ['motherboard', 'case'], 'The motherboard is too large for the case',
      `${cs.short.split(' (')[0]} only takes Micro-ATX boards (244 mm tall). An ATX board is 305 mm tall and reaches down into the power supply area.`)
  }
  if (gpu && cs && gpu.length > cs.gpuMax) {
    add('error', 'gpulen', ['gpu', 'case'], 'The graphics card is too long',
      `${gpu.short} is ${gpu.length} mm long, but the case has room for ${cs.gpuMax} mm before the card hits the front fans.`)
  }
  if (cooler && cs) {
    if (cooler.type !== 'aio' && cooler.height > cs.coolerMax) {
      add('error', 'coolerh', ['cooler', 'case'], 'The cooler is too tall',
        `${cooler.short} is ${cooler.height} mm tall, but there are only ${cs.coolerMax} mm from the processor to the side panel. The side panel will not fit on.`)
    }
    if (cooler.type === 'aio' && cooler.radiator > cs.radTop) {
      add('error', 'rad', ['cooler', 'case'], 'The radiator does not fit',
        cs.radTop
          ? `The case has room for a radiator of up to ${cs.radTop} mm at the top. This one is ${cooler.radiator} mm.`
          : 'The case has no room for a radiator at the top.')
    }
  }
  if (cooler && cpu) {
    if (!cooler.sockets.includes(cpu.socket)) {
      add('error', 'coolersocket', ['cooler', 'cpu'], 'The cooler does not fit the socket',
        `${cooler.short} only has mounting for ${cooler.sockets.join(' and ')}.`)
    } else if (cooler.type === 'stock' && !cpu.coolerIncluded) {
      add('error', 'stock', ['cooler', 'cpu'], 'This cooler is not included',
        `The Wraith Stealth only comes in the box with the Ryzen 5 5600 and 7600. ${cpu.short} is sold without a cooler, so you have to choose one yourself.`)
    } else if (cooler.capacity < cpu.tdp) {
      add('warning', 'coolweak', ['cooler', 'cpu'], 'The cooler is too weak',
        `${cpu.short} gives off ${cpu.tdp} W of heat, but the cooler handles around ${cooler.capacity} W. The processor will slow itself down to avoid overheating.`)
    } else if (cooler.capacity < cpu.peak) {
      add('tip', 'coolwarm', ['cooler', 'cpu'], 'The cooler works hard under full load',
        `Under heavy load ${cpu.short} can draw up to ${cpu.peak} W. The cooler can handle it, but the fan will run fast and be audible. In games the load is lower.`)
    }
  }
  if (psu && gpu && cpu) {
    if (power.peak > psu.watt) {
      add('error', 'psuw', ['psu', 'gpu'], 'The power supply is too small',
        `The parts can draw around ${power.peak} W at the same time, but the power supply delivers ${psu.watt} W. The machine will shut down under load.`)
    } else if (psu.watt < gpu.recPsu) {
      add('warning', 'psurec', ['psu', 'gpu'], 'Little margin on the power supply',
        `${gpu.brand} recommends at least ${gpu.recPsu} W for the ${gpu.short}. Graphics cards have short power spikes far above the average, and with ${psu.watt} W the machine can cut out in demanding scenes.`)
    } else if (power.peak > psu.watt * 0.85) {
      add('warning', 'psuhead', ['psu'], 'Little margin on the power supply',
        `The parts can draw around ${power.peak} W of ${psu.watt} W. It works, but leaves little room for power spikes and later upgrades.`)
    }
    if (gpu.connector === '12V-2x6' && !psu.atx3) {
      add('tip', 'adapter', ['psu', 'gpu'], 'The graphics card needs an adapter',
        `The ${gpu.short} uses the new 12V-2x6 connector. This power supply does not have it, so you need to use the adapter that comes with the card.`)
    }
  }
  if (ram) {
    if (ram.sticks === 1) {
      add('warning', 'single', ['ram'], 'Only one memory stick',
        'With one stick the memory runs in single channel, and the processor gets half the bandwidth. Two sticks typically give 10–20% higher frame rates.')
    }
    const total = ram.sticks * ram.perStick
    if (total < 32 && goal.profile !== 'esport' && ram.sticks > 1) {
      add('tip', 'ram16', ['ram'], '16 GB is on the minimum side',
        'New demanding games often use 12–16 GB on their own. With a browser and Discord running in the background it can get tight, and then the game stutters.')
    }
    if (ram.type === 'DDR5' && ram.speed > 5600 && mb && ram.type === mb.ramType) {
      add('tip', 'expo', ['ram'], `Remember to enable ${mb.socket === 'LGA1851' ? 'XMP' : 'EXPO'} in the BIOS`,
        `The memory only runs at ${mb.socket === 'LGA1851' ? '5600' : '5200'} MHz straight out of the box. The ${ram.speed} MHz profile must be enabled with one setting in the BIOS.`)
    }
  }
  if (cpu && mb && cpu.socket === mb.socket && cpu.year > mb.year) {
    add('tip', 'bios', ['motherboard', 'cpu'], 'The motherboard may need a BIOS update',
      `The ${mb.chipset} board came out before ${cpu.short}. If the board has an old BIOS, the machine will not start until it is updated. Most boards can be updated from a USB stick without a processor installed.`)
  }
  if (cpu && mb && cpu.socket === mb.socket && cpu.brand === 'Intel' && !mb.overclock) {
    add('tip', 'kboard', ['motherboard', 'cpu'], 'Overclocking requires a Z-series chipset',
      `${cpu.short} can be overclocked, but ${mb.chipset} boards do not support it. Irrelevant if you do not plan to overclock.`)
  }
  if (storage && mb && storage.iface === 'PCIe 5.0' && !mb.pcie5M2) {
    add('tip', 'pcie5', ['storage', 'motherboard'], 'The SSD cannot reach full speed',
      `The motherboard only has PCIe 4.0 to M.2. The SSD works, but stops at around 7,000 MB/s instead of ${storage.read.toLocaleString('en-US')} MB/s.`)
  }
  performanceIssues(out, p, goal, perf)
  return out
}

function performanceIssues(out: Issue[], p: Parts, goal: Goal, perf: Perf) {
  const { cpu, gpu } = p
  if (!cpu || !gpu) return
  if (perf.vramShort) {
    out.push({
      id: 'vram', level: 'warning', slots: ['gpu'], title: 'Limited graphics card memory for this target',
      detail: `${gpu.vram} GB VRAM is barely enough for ${RES_LABEL[goal.res]} at the highest settings. When the memory fills up, the image stutters. Lower the texture quality or choose a card with more memory.`,
    })
  }
  if (perf.limiter === 'cpu' && perf.gpuFps / perf.cpuCap > 1.35 && perf.fps < goal.target * 1.5) {
    out.push({
      id: 'bottleneck', level: 'warning', slots: ['cpu', 'gpu'], title: 'The processor is holding back the graphics card',
      detail: `The graphics card could deliver around ${perf.gpuFps} FPS here, but ${cpu.short} can only prepare around ${perf.cpuCap}. A faster processor gives more than a more expensive graphics card.`,
    })
  }
}

function laptopIssues(device: DeviceDef, p: Parts, goal: Goal, perf: Perf): Issue[] {
  const out: Issue[] = []
  const { ram, display, gpu } = p
  if (ram?.sticks === 1) {
    out.push({
      id: 'single', level: 'warning', slots: ['ram'], title: 'Only one memory stick',
      detail: 'The machine is sold with one 16 GB stick, so the memory runs in single channel. The free slot can be filled with a second stick – the cheapest upgrade you can make.',
    })
  }
  if (display && goal.res > display.native) {
    out.push({
      id: 'res', level: 'tip', slots: ['display'], title: 'The target is higher than the display resolution',
      detail: `The built-in display has ${display.res[0]} × ${display.res[1]} pixels. ${RES_LABEL[goal.res]} only makes sense on an external display.`,
    })
  }
  if (display && perf.fps > display.hz * 1.25) {
    out.push({
      id: 'hz', level: 'tip', slots: ['display'], title: 'The display does not show every frame',
      detail: `The machine produces around ${perf.fps} frames per second, but the display shows ${display.hz}. The rest is lost.`,
    })
  }
  if (gpu && (device.gpuFactor ?? 1) < 1) {
    out.push({
      id: 'tgp', level: 'tip', slots: ['gpu', 'cooler'], title: 'The graphics card does not get full power',
      detail: `The thin chassis cannot cool away more, so the ${gpu.short} runs at around ${gpu.power} W. In a thicker machine the same chip performs about 10% better.`,
    })
  }
  performanceIssues(out, p, goal, perf)
  return out
}

// ───────────────────────────── Overall assessment ─────────────────────────────

export function evaluate(device: DeviceDef, build: Build, goal: Goal): Evaluation {
  const parts = getParts(build)
  const gf = device.gpuFactor ?? 1
  const perf = estimate(parts, goal, gf)
  const byRes = {
    1080: estimate(parts, { ...goal, res: 1080 }, gf).fps,
    1440: estimate(parts, { ...goal, res: 1440 }, gf).fps,
    2160: estimate(parts, { ...goal, res: 2160 }, gf).fps,
  } as Record<Res, number>
  const power = powerOf(parts)

  const breakdown: Evaluation['breakdown'] = []
  if (device.basePrice) breakdown.push({ slot: 'base', label: 'Base model', price: device.basePrice })
  for (const slot of device.slots) {
    const c = component(build, slot)
    if (c && c.price > 0) breakdown.push({ slot, label: slotText(device.kind, slot).label, price: c.price })
  }
  const price = breakdown.reduce((s, b) => s + b.price, 0)

  const issues =
    device.kind === 'desktop' ? desktopIssues(parts, goal, perf, power) : laptopIssues(device, parts, goal, perf)
  const order = { error: 0, warning: 1, tip: 2 }
  issues.sort((a, b) => order[a.level] - order[b.level])

  return { price, breakdown, perf, byRes, multi: parts.cpu?.multi ?? 0, power, issues, parts }
}

/** Most severe level among the issues that concern a slot */
export function slotLevel(issues: Issue[], slot: SlotId): Level | null {
  let worst: Level | null = null
  for (const i of issues) {
    if (!i.slots.includes(slot)) continue
    if (i.level === 'error') return 'error'
    if (i.level === 'warning') worst = 'warning'
  }
  return worst
}

// ───────────────────────────── Suggestions ─────────────────────────────

export interface Suggestion {
  kind: 'reach' | 'value' | 'save'
  slot: SlotId
  to: Component
  dFps: number
  dPrice: number
  fps: number
}

export function suggest(device: DeviceDef, build: Build, goal: Goal, now: Evaluation): Suggestion[] {
  const cands: Suggestion[] = []
  const hadErrors = now.issues.some((i) => i.level === 'error')
  for (const slot of ['gpu', 'cpu', 'ram'] as SlotId[]) {
    for (const alt of optionsFor(device, slot)) {
      if (alt.id === build[slot]) continue
      const e = evaluate(device, { ...build, [slot]: alt.id }, goal)
      if (!hadErrors && e.issues.some((i) => i.level === 'error')) continue
      cands.push({ kind: 'value', slot, to: alt, dFps: e.perf.fps - now.perf.fps, dPrice: e.price - now.price, fps: e.perf.fps })
    }
  }
  const out: Suggestion[] = []
  const fps = now.perf.fps
  if (fps < goal.target) {
    const reach = cands.filter((c) => c.fps >= goal.target).sort((a, b) => a.dPrice - b.dPrice)[0]
    if (reach) out.push({ ...reach, kind: 'reach' })
  }
  const value = cands
    .filter((c) => c.dFps >= Math.max(3, fps * 0.04) && c.dPrice > 0 && c.to.id !== out[0]?.to.id)
    .sort((a, b) => b.dFps / b.dPrice - a.dFps / a.dPrice)[0]
  if (value && fps < goal.target * 1.3) out.push({ ...value, kind: 'value' })
  if (fps >= goal.target) {
    const save = cands
      .filter((c) => c.fps >= goal.target && c.dPrice <= -300)
      .sort((a, b) => a.dPrice - b.dPrice)[0]
    if (save) out.push({ ...save, kind: 'save' })
  }
  return out
}
