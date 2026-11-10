export type SlotId =
  | 'case'
  | 'motherboard'
  | 'cpu'
  | 'cooler'
  | 'ram'
  | 'gpu'
  | 'storage'
  | 'psu'
  | 'display'
  | 'battery'

export type Socket = 'AM5' | 'AM4' | 'LGA1851' | 'BGA'
export type FormFactor = 'ATX' | 'mATX'
export type RamType = 'DDR5' | 'DDR4'
export type Res = 1080 | 1440 | 2160
export type Profile = 'esport' | 'aaa' | 'rt'

interface Base {
  id: string
  /** Fullt produktnavn */
  name: string
  /** Kort navn til lister */
  short: string
  brand: string
  /** Omtrentlig pris i NOK. For bærbare: tillegg i forhold til grunnmodellen. */
  price: number
}

export interface Cpu extends Base {
  kind: 'cpu'
  socket: Socket
  arch: string
  cores: number
  threads: number
  coreLayout?: string
  boost: number
  l3: number
  tdp: number
  /** Høyeste effekt under full last (W) */
  peak: number
  /** Typisk effekt under spilling (W) */
  gamingPower: number
  /** Spillytelse, Ryzen 7 9800X3D = 100 */
  gaming: number
  /** Flerkjerneytelse, omtrent Cinebench 2024 / 16 */
  multi: number
  igpu: string | null
  x3d: boolean
  ramType: RamType
  year: number
  coolerIncluded?: boolean
  unlocked?: boolean
}

export interface Gpu extends Base {
  kind: 'gpu'
  maker: 'NVIDIA' | 'AMD' | 'Intel'
  vram: number
  /** Snitt-FPS i tunge spill på høyeste innstillinger, uten oppskalering */
  fps: Record<Res, number>
  /** Hvor mye av ytelsen som er igjen med ray tracing på */
  rt: number
  power: number
  recPsu: number
  length: number
  slots: number
  height: number
  fans: 2 | 3
  connector: '12V-2x6' | '1x 8-pin' | '2x 8-pin' | '3x 8-pin'
  upscaler: string
  laptop?: boolean
}

export interface Motherboard extends Base {
  kind: 'motherboard'
  socket: Socket
  chipset: string
  form: FormFactor
  ramType: RamType
  ramSlots: number
  maxRam: number
  m2: number
  pcie5Gpu: boolean
  pcie5M2: boolean
  wifi: string
  overclock: boolean
  year: number
}

export interface Ram extends Base {
  kind: 'ram'
  type: RamType
  sticks: number
  perStick: number
  speed: number
  cl: number
  rgb: boolean
  color: 'black' | 'white' | 'silver'
  /** Bærbar: SO-DIMM-brikker eller loddet minne */
  form?: 'DIMM' | 'SO-DIMM' | 'Loddet'
}

export interface Storage extends Base {
  kind: 'storage'
  capacity: number
  iface: 'PCIe 5.0' | 'PCIe 4.0' | 'PCIe 3.0'
  read: number
  write: number
  nand: 'TLC' | 'QLC'
  dram: boolean
}

export interface Psu extends Base {
  kind: 'psu'
  watt: number
  rating: string
  modular: string
  atx3: boolean
  length: number
}

export interface Cooler extends Base {
  kind: 'cooler'
  type: 'stock' | 'single' | 'dual' | 'aio'
  /** Hvor mye varme (W) kjøleren håndterer komfortabelt */
  capacity: number
  height: number
  radiator: 0 | 240 | 360
  fans: number
  noise: number
  sockets: Socket[]
}

export interface Case extends Base {
  kind: 'case'
  forms: FormFactor[]
  dims: { w: number; h: number; d: number }
  gpuMax: number
  coolerMax: number
  /** Største radiator i toppen (mm), 0 = ingen */
  radTop: number
  frontFans: number
  fanSize: number
  style: 'mesh' | 'slats'
  color: 'black' | 'white'
}

export interface Display extends Base {
  kind: 'display'
  size: number
  res: [number, number]
  hz: number
  panel: 'OLED' | 'IPS'
  nits: number
  gamut: string
  native: Res
}

export interface Battery extends Base {
  kind: 'battery'
  wh: number
  hoursLight: number
  hoursGaming: number
  charger: number
}

/** Faste deler på bærbare som bare har en forklaring og en spec-liste */
export interface Info extends Base {
  kind: 'info'
  rows: [label: string, value: string, hint?: string][]
}

export type Component =
  | Cpu
  | Gpu
  | Motherboard
  | Ram
  | Storage
  | Psu
  | Cooler
  | Case
  | Display
  | Battery
  | Info

export type Build = Partial<Record<SlotId, string>>

export interface Goal {
  res: Res
  profile: Profile
  target: number
  upscale: boolean
}

export interface LaptopGeom {
  w: number
  d: number
  baseT: number
  lidT: number
  body: string
  deck: string
  keyGlow: string
  diag: number
  aspect: number
  battery: [w: number, d: number]
  vapor: boolean
  logo: 'bar' | 'slash' | 'ring'
}

export interface DeviceDef {
  id: string
  kind: 'desktop' | 'laptop'
  name: string
  tagline: string
  description: string
  slots: SlotId[]
  build: Build
  /** Bærbar: hvilke alternativer som finnes per plass. Mangler plassen, er delen fast. */
  options?: Partial<Record<SlotId, string[]>>
  /** Bærbar: hvorfor en del er fast, eller når den må velges */
  fixed?: Partial<Record<SlotId, string>>
  basePrice?: number
  /** Bærbar: hvor mye av skjermkortets fulle effekt chassiset slipper til */
  gpuFactor?: number
  geom?: LaptopGeom
  goal: Goal
}
