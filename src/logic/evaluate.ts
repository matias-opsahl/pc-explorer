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
  /** Taket prosessoren setter */
  cpuCap: number
  /** Det skjermkortet klarer alene */
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
    // Plassen og delens type har samme navn for alle typer vi regner på
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

// ───────────────────────────── Ytelse ─────────────────────────────

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
  if (ram.type === 'DDR5' && ram.form !== 'Loddet') {
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
  // For svak kjøler: prosessoren struper seg selv
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

// ───────────────────────────── Strøm ─────────────────────────────

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

// ───────────────────────────── Kompatibilitet ─────────────────────────────

function desktopIssues(p: Parts, goal: Goal, perf: Perf, power: Evaluation['power']): Issue[] {
  const out: Issue[] = []
  const { cpu, gpu, ram, storage, motherboard: mb, cooler, psu } = p
  const cs = p.case
  const add = (level: Level, id: string, slots: SlotId[], title: string, detail: string) =>
    out.push({ id, level, slots, title, detail })

  if (cpu && mb && cpu.socket !== mb.socket) {
    add('error', 'socket', ['cpu', 'motherboard'], 'Prosessoren passer ikke i hovedkortet',
      `${cpu.short} bruker sokkel ${cpu.socket}, mens hovedkortet har ${mb.socket}. Pinnene sitter ulikt, så brikken går ikke ned i sokkelen. Bytt én av delene.`)
  }
  if (ram && mb && ram.type !== mb.ramType) {
    add('error', 'ramtype', ['ram', 'motherboard'], 'Minnet passer ikke i hovedkortet',
      `Hovedkortet har spor for ${mb.ramType}, men minnet er ${ram.type}. Hakket i brikken sitter på et annet sted, så den lar seg ikke trykke ned.`)
  }
  if (ram && mb && ram.sticks > mb.ramSlots) {
    add('error', 'ramslots', ['ram', 'motherboard'], 'For mange minnebrikker',
      `Settet har ${ram.sticks} brikker, men hovedkortet har bare ${mb.ramSlots} spor.`)
  }
  if (mb && cs && !cs.forms.includes(mb.form)) {
    add('error', 'form', ['motherboard', 'case'], 'Hovedkortet er for stort for kabinettet',
      `${cs.short.split(' (')[0]} tar bare Micro-ATX-kort (244 mm høye). Et ATX-kort er 305 mm høyt og når ned i strømforsyningsrommet.`)
  }
  if (gpu && cs && gpu.length > cs.gpuMax) {
    add('error', 'gpulen', ['gpu', 'case'], 'Skjermkortet er for langt',
      `${gpu.short} er ${gpu.length} mm langt, men kabinettet har plass til ${cs.gpuMax} mm før kortet treffer frontviftene.`)
  }
  if (cooler && cs) {
    if (cooler.type !== 'aio' && cooler.height > cs.coolerMax) {
      add('error', 'coolerh', ['cooler', 'case'], 'Kjøleren er for høy',
        `${cooler.short} er ${cooler.height} mm høy, men det er bare ${cs.coolerMax} mm fra prosessoren til sidepanelet. Panelet får du ikke på.`)
    }
    if (cooler.type === 'aio' && cooler.radiator > cs.radTop) {
      add('error', 'rad', ['cooler', 'case'], 'Radiatoren får ikke plass',
        cs.radTop
          ? `Kabinettet har plass til en radiator på opptil ${cs.radTop} mm i toppen. Denne er ${cooler.radiator} mm.`
          : 'Kabinettet har ikke plass til radiator i toppen.')
    }
  }
  if (cooler && cpu) {
    if (!cooler.sockets.includes(cpu.socket)) {
      add('error', 'coolersocket', ['cooler', 'cpu'], 'Kjøleren passer ikke sokkelen',
        `${cooler.short} har bare feste for ${cooler.sockets.join(' og ')}.`)
    } else if (cooler.type === 'stock' && !cpu.coolerIncluded) {
      add('error', 'stock', ['cooler', 'cpu'], 'Denne kjøleren følger ikke med',
        `Wraith Stealth ligger bare i esken til Ryzen 5 5600 og 7600. ${cpu.short} selges uten kjøler, så du må velge en selv.`)
    } else if (cooler.capacity < cpu.tdp) {
      add('warning', 'coolweak', ['cooler', 'cpu'], 'Kjøleren er for svak',
        `${cpu.short} avgir ${cpu.tdp} W varme, men kjøleren håndterer rundt ${cooler.capacity} W. Prosessoren vil bremse seg selv for ikke å bli for varm.`)
    } else if (cooler.capacity < cpu.peak) {
      add('tip', 'coolwarm', ['cooler', 'cpu'], 'Kjøleren jobber hardt under full last',
        `Under tung last kan ${cpu.short} trekke opptil ${cpu.peak} W. Kjøleren klarer det, men viften vil gå fort og høres. I spill er belastningen lavere.`)
    }
  }
  if (psu && gpu && cpu) {
    if (power.peak > psu.watt) {
      add('error', 'psuw', ['psu', 'gpu'], 'Strømforsyningen er for liten',
        `Delene kan trekke rundt ${power.peak} W samtidig, men strømforsyningen leverer ${psu.watt} W. Maskinen vil slå seg av under last.`)
    } else if (psu.watt < gpu.recPsu) {
      add('warning', 'psurec', ['psu', 'gpu'], 'Liten margin på strømforsyningen',
        `${gpu.brand} anbefaler minst ${gpu.recPsu} W for ${gpu.short}. Skjermkort har korte effekttopper langt over snittet, og med ${psu.watt} W kan maskinen kutte ut i tunge scener.`)
    } else if (power.peak > psu.watt * 0.85) {
      add('warning', 'psuhead', ['psu'], 'Liten margin på strømforsyningen',
        `Delene kan trekke rundt ${power.peak} W av ${psu.watt} W. Det virker, men gir lite rom for effekttopper og senere oppgraderinger.`)
    }
    if (gpu.connector === '12V-2x6' && !psu.atx3) {
      add('tip', 'adapter', ['psu', 'gpu'], 'Skjermkortet trenger en adapter',
        `${gpu.short} bruker den nye 12V-2x6-kontakten. Denne strømforsyningen har den ikke, så du må bruke adapteren som følger med kortet.`)
    }
  }
  if (ram) {
    if (ram.sticks === 1) {
      add('warning', 'single', ['ram'], 'Bare én minnebrikke',
        'Med én brikke kjører minnet i single channel, og prosessoren får halv båndbredde. To brikker gir typisk 10–20 % høyere bildefrekvens.')
    }
    const total = ram.sticks * ram.perStick
    if (total < 32 && goal.profile !== 'esport' && ram.sticks > 1) {
      add('tip', 'ram16', ['ram'], '16 GB er i minste laget',
        'Nye storspill bruker ofte 12–16 GB alene. Med nettleser og Discord i bakgrunnen kan det bli trangt, og da hakker spillet.')
    }
    if (ram.type === 'DDR5' && ram.speed > 5600 && mb && ram.type === mb.ramType) {
      add('tip', 'expo', ['ram'], `Husk å slå på ${mb.socket === 'LGA1851' ? 'XMP' : 'EXPO'} i BIOS`,
        `Minnet kjører bare ${mb.socket === 'LGA1851' ? '5600' : '5200'} MHz rett ut av esken. Profilen på ${ram.speed} MHz må slås på med ett valg i BIOS.`)
    }
  }
  if (cpu && mb && cpu.socket === mb.socket && cpu.year > mb.year) {
    add('tip', 'bios', ['motherboard', 'cpu'], 'Hovedkortet kan trenge BIOS-oppdatering',
      `${mb.chipset}-kortet kom før ${cpu.short}. Ligger det en gammel BIOS på kortet, starter ikke maskinen før den er oppdatert. De fleste kort kan oppdateres fra minnepinne uten prosessor.`)
  }
  if (cpu && mb && cpu.socket === mb.socket && cpu.brand === 'Intel' && !mb.overclock) {
    add('tip', 'kboard', ['motherboard', 'cpu'], 'Overklokking krever Z-brikkesett',
      `${cpu.short} kan overklokkes, men ${mb.chipset}-kort støtter det ikke. Uten betydning hvis du ikke hadde tenkt å overklokke.`)
  }
  if (storage && mb && storage.iface === 'PCIe 5.0' && !mb.pcie5M2) {
    add('tip', 'pcie5', ['storage', 'motherboard'], 'SSD-en får ikke brukt full hastighet',
      `Hovedkortet har bare PCIe 4.0 til M.2. SSD-en virker, men stopper på rundt 7 000 MB/s i stedet for ${storage.read.toLocaleString('nb-NO')} MB/s.`)
  }
  performanceIssues(out, p, goal, perf)
  return out
}

function performanceIssues(out: Issue[], p: Parts, goal: Goal, perf: Perf) {
  const { cpu, gpu } = p
  if (!cpu || !gpu) return
  if (perf.vramShort) {
    out.push({
      id: 'vram', level: 'warning', slots: ['gpu'], title: 'Lite skjermkortminne for dette målet',
      detail: `${gpu.vram} GB VRAM er knapt for ${RES_LABEL[goal.res]} på høyeste innstillinger. Når minnet går fullt, hakker bildet. Skru ned teksturkvaliteten eller velg et kort med mer minne.`,
    })
  }
  if (perf.limiter === 'cpu' && perf.gpuFps / perf.cpuCap > 1.35 && perf.fps < goal.target * 1.5) {
    out.push({
      id: 'bottleneck', level: 'warning', slots: ['cpu', 'gpu'], title: 'Prosessoren holder igjen skjermkortet',
      detail: `Skjermkortet kunne levert rundt ${perf.gpuFps} FPS her, men ${cpu.short} rekker bare å forberede rundt ${perf.cpuCap}. En raskere prosessor gir mer enn et dyrere skjermkort.`,
    })
  }
}

function laptopIssues(device: DeviceDef, p: Parts, goal: Goal, perf: Perf): Issue[] {
  const out: Issue[] = []
  const { ram, display, gpu } = p
  if (ram?.sticks === 1) {
    out.push({
      id: 'single', level: 'warning', slots: ['ram'], title: 'Bare én minnebrikke',
      detail: 'Maskinen selges med én brikke på 16 GB, så minnet kjører i single channel. Det ledige sporet kan fylles med en brikke til – den billigste oppgraderingen du kan gjøre.',
    })
  }
  if (display && goal.res > display.native) {
    out.push({
      id: 'res', level: 'tip', slots: ['display'], title: 'Målet er høyere enn skjermens oppløsning',
      detail: `Den innebygde skjermen har ${display.res[0]} × ${display.res[1]} piksler. ${RES_LABEL[goal.res]} gir bare mening på en ekstern skjerm.`,
    })
  }
  if (display && perf.fps > display.hz * 1.25) {
    out.push({
      id: 'hz', level: 'tip', slots: ['display'], title: 'Skjermen viser ikke alle bildene',
      detail: `Maskinen lager rundt ${perf.fps} bilder i sekundet, men skjermen viser ${display.hz}. Resten går tapt.`,
    })
  }
  if (gpu && (device.gpuFactor ?? 1) < 1) {
    out.push({
      id: 'tgp', level: 'tip', slots: ['gpu', 'cooler'], title: 'Skjermkortet får ikke full effekt',
      detail: `Det tynne chassiset klarer ikke å kjøle bort mer, så ${gpu.short} går på rundt ${gpu.power} W. I en tykkere maskin yter samme brikke omtrent 10 % bedre.`,
    })
  }
  performanceIssues(out, p, goal, perf)
  return out
}

// ───────────────────────────── Samlet vurdering ─────────────────────────────

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
  if (device.basePrice) breakdown.push({ slot: 'base', label: 'Grunnmodell', price: device.basePrice })
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

/** Verste nivå blant problemene som gjelder en plass */
export function slotLevel(issues: Issue[], slot: SlotId): Level | null {
  let worst: Level | null = null
  for (const i of issues) {
    if (!i.slots.includes(slot)) continue
    if (i.level === 'error') return 'error'
    if (i.level === 'warning') worst = 'warning'
  }
  return worst
}

// ───────────────────────────── Forslag ─────────────────────────────

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
