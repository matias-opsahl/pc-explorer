import type {
  Battery,
  Case,
  Component,
  Cooler,
  Cpu,
  Display,
  Gpu,
  Info,
  Motherboard,
  Psu,
  Ram,
  Storage,
} from './types'

/*
 * Priser er omtrentlige norske butikkpriser fra november 2026.
 * Minne, SSD-er og skjermkort er uvanlig dyre akkurat nå på grunn av minnemangelen.
 * Ytelsestall er grove snitt fra offentlige tester og er ment for sammenligning.
 */

// ───────────────────────────── Prosessorer ─────────────────────────────

export const cpus: Cpu[] = [
  {
    kind: 'cpu', id: 'r5-5600', name: 'AMD Ryzen 5 5600', short: 'Ryzen 5 5600', brand: 'AMD', price: 1290,
    socket: 'AM4', arch: 'Zen 3', cores: 6, threads: 12, boost: 4.4, l3: 32, tdp: 65, peak: 76, gamingPower: 60,
    gaming: 62, multi: 40, igpu: null, x3d: false, ramType: 'DDR4', year: 2022, coolerIncluded: true, unlocked: true,
  },
  {
    kind: 'cpu', id: 'r5-7600', name: 'AMD Ryzen 5 7600', short: 'Ryzen 5 7600', brand: 'AMD', price: 2190,
    socket: 'AM5', arch: 'Zen 4', cores: 6, threads: 12, boost: 5.1, l3: 32, tdp: 65, peak: 88, gamingPower: 65,
    gaming: 74, multi: 53, igpu: 'Radeon Graphics', x3d: false, ramType: 'DDR5', year: 2023, coolerIncluded: true, unlocked: true,
  },
  {
    kind: 'cpu', id: 'r5-9600x', name: 'AMD Ryzen 5 9600X', short: 'Ryzen 5 9600X', brand: 'AMD', price: 2890,
    socket: 'AM5', arch: 'Zen 5', cores: 6, threads: 12, boost: 5.4, l3: 32, tdp: 65, peak: 88, gamingPower: 70,
    gaming: 79, multi: 58, igpu: 'Radeon Graphics', x3d: false, ramType: 'DDR5', year: 2024, unlocked: true,
  },
  {
    kind: 'cpu', id: 'r7-9700x', name: 'AMD Ryzen 7 9700X', short: 'Ryzen 7 9700X', brand: 'AMD', price: 3690,
    socket: 'AM5', arch: 'Zen 5', cores: 8, threads: 16, boost: 5.5, l3: 32, tdp: 65, peak: 88, gamingPower: 75,
    gaming: 82, multi: 73, igpu: 'Radeon Graphics', x3d: false, ramType: 'DDR5', year: 2024, unlocked: true,
  },
  {
    kind: 'cpu', id: 'r7-7800x3d', name: 'AMD Ryzen 7 7800X3D', short: 'Ryzen 7 7800X3D', brand: 'AMD', price: 4290,
    socket: 'AM5', arch: 'Zen 4', cores: 8, threads: 16, boost: 5.0, l3: 96, tdp: 120, peak: 120, gamingPower: 60,
    gaming: 92, multi: 67, igpu: 'Radeon Graphics', x3d: true, ramType: 'DDR5', year: 2023, unlocked: true,
  },
  {
    kind: 'cpu', id: 'r7-9800x3d', name: 'AMD Ryzen 7 9800X3D', short: 'Ryzen 7 9800X3D', brand: 'AMD', price: 4990,
    socket: 'AM5', arch: 'Zen 5', cores: 8, threads: 16, boost: 5.2, l3: 96, tdp: 120, peak: 162, gamingPower: 85,
    gaming: 100, multi: 84, igpu: 'Radeon Graphics', x3d: true, ramType: 'DDR5', year: 2024, unlocked: true,
  },
  {
    kind: 'cpu', id: 'r7-9850x3d', name: 'AMD Ryzen 7 9850X3D', short: 'Ryzen 7 9850X3D', brand: 'AMD', price: 5390,
    socket: 'AM5', arch: 'Zen 5', cores: 8, threads: 16, boost: 5.6, l3: 96, tdp: 120, peak: 162, gamingPower: 90,
    gaming: 103, multi: 87, igpu: 'Radeon Graphics', x3d: true, ramType: 'DDR5', year: 2026, unlocked: true,
  },
  {
    kind: 'cpu', id: 'r9-9950x3d', name: 'AMD Ryzen 9 9950X3D', short: 'Ryzen 9 9950X3D', brand: 'AMD', price: 7990,
    socket: 'AM5', arch: 'Zen 5', cores: 16, threads: 32, boost: 5.7, l3: 128, tdp: 170, peak: 230, gamingPower: 110,
    gaming: 101, multi: 145, igpu: 'Radeon Graphics', x3d: true, ramType: 'DDR5', year: 2025, unlocked: true,
  },
  {
    kind: 'cpu', id: 'u5-250k', name: 'Intel Core Ultra 5 250K Plus', short: 'Core Ultra 5 250K Plus', brand: 'Intel', price: 2490,
    socket: 'LGA1851', arch: 'Arrow Lake Refresh', cores: 18, threads: 18, coreLayout: '6 P-kjerner + 12 E-kjerner',
    boost: 5.3, l3: 30, tdp: 125, peak: 159, gamingPower: 85,
    gaming: 79, multi: 105, igpu: 'Intel Graphics', x3d: false, ramType: 'DDR5', year: 2026, unlocked: true,
  },
  {
    kind: 'cpu', id: 'u7-270k', name: 'Intel Core Ultra 7 270K Plus', short: 'Core Ultra 7 270K Plus', brand: 'Intel', price: 3990,
    socket: 'LGA1851', arch: 'Arrow Lake Refresh', cores: 24, threads: 24, coreLayout: '8 P-kjerner + 16 E-kjerner',
    boost: 5.5, l3: 36, tdp: 125, peak: 250, gamingPower: 110,
    gaming: 84, multi: 150, igpu: 'Intel Graphics', x3d: false, ramType: 'DDR5', year: 2026, unlocked: true,
  },
]

// ───────────────────────────── Skjermkort ─────────────────────────────

export const gpus: Gpu[] = [
  {
    kind: 'gpu', id: 'rtx5050', name: 'NVIDIA GeForce RTX 5050 8 GB', short: 'RTX 5050', brand: 'NVIDIA', maker: 'NVIDIA', price: 4290,
    vram: 8, fps: { 1080: 70, 1440: 48, 2160: 24 }, rt: 0.58, power: 130, recPsu: 550, length: 210, slots: 2, height: 112, fans: 2,
    connector: '1x 8-pin', upscaler: 'DLSS 4',
  },
  {
    kind: 'gpu', id: 'arc-b580', name: 'Intel Arc B580 12 GB', short: 'Arc B580', brand: 'Intel', maker: 'Intel', price: 4190,
    vram: 12, fps: { 1080: 76, 1440: 52, 2160: 28 }, rt: 0.5, power: 190, recPsu: 600, length: 272, slots: 2, height: 115, fans: 2,
    connector: '1x 8-pin', upscaler: 'XeSS 2',
  },
  {
    kind: 'gpu', id: 'rtx5060', name: 'NVIDIA GeForce RTX 5060 8 GB', short: 'RTX 5060', brand: 'NVIDIA', maker: 'NVIDIA', price: 5290,
    vram: 8, fps: { 1080: 88, 1440: 60, 2160: 31 }, rt: 0.58, power: 145, recPsu: 550, length: 230, slots: 2, height: 118, fans: 2,
    connector: '1x 8-pin', upscaler: 'DLSS 4',
  },
  {
    kind: 'gpu', id: 'rx9060xt', name: 'AMD Radeon RX 9060 XT 16 GB', short: 'RX 9060 XT', brand: 'AMD', maker: 'AMD', price: 6390,
    vram: 16, fps: { 1080: 100, 1440: 68, 2160: 37 }, rt: 0.5, power: 160, recPsu: 550, length: 240, slots: 2, height: 120, fans: 2,
    connector: '1x 8-pin', upscaler: 'FSR 4',
  },
  {
    kind: 'gpu', id: 'rtx5060ti', name: 'NVIDIA GeForce RTX 5060 Ti 16 GB', short: 'RTX 5060 Ti', brand: 'NVIDIA', maker: 'NVIDIA', price: 8190,
    vram: 16, fps: { 1080: 102, 1440: 70, 2160: 38 }, rt: 0.6, power: 180, recPsu: 600, length: 250, slots: 2, height: 120, fans: 2,
    connector: '1x 8-pin', upscaler: 'DLSS 4',
  },
  {
    kind: 'gpu', id: 'rx9070', name: 'AMD Radeon RX 9070 16 GB', short: 'RX 9070', brand: 'AMD', maker: 'AMD', price: 8990,
    vram: 16, fps: { 1080: 140, 1440: 100, 2160: 58 }, rt: 0.52, power: 220, recPsu: 650, length: 290, slots: 2.5, height: 125, fans: 3,
    connector: '2x 8-pin', upscaler: 'FSR 4',
  },
  {
    kind: 'gpu', id: 'rtx5070', name: 'NVIDIA GeForce RTX 5070 12 GB', short: 'RTX 5070', brand: 'NVIDIA', maker: 'NVIDIA', price: 9490,
    vram: 12, fps: { 1080: 132, 1440: 92, 2160: 52 }, rt: 0.62, power: 250, recPsu: 650, length: 280, slots: 2.5, height: 122, fans: 3,
    connector: '12V-2x6', upscaler: 'DLSS 4',
  },
  {
    kind: 'gpu', id: 'rx9070xt', name: 'AMD Radeon RX 9070 XT 16 GB', short: 'RX 9070 XT', brand: 'AMD', maker: 'AMD', price: 10490,
    vram: 16, fps: { 1080: 152, 1440: 110, 2160: 66 }, rt: 0.52, power: 304, recPsu: 750, length: 320, slots: 3, height: 130, fans: 3,
    connector: '2x 8-pin', upscaler: 'FSR 4',
  },
  {
    kind: 'gpu', id: 'rtx5070ti', name: 'NVIDIA GeForce RTX 5070 Ti 16 GB', short: 'RTX 5070 Ti', brand: 'NVIDIA', maker: 'NVIDIA', price: 15390,
    vram: 16, fps: { 1080: 160, 1440: 116, 2160: 69 }, rt: 0.63, power: 300, recPsu: 750, length: 305, slots: 2.5, height: 128, fans: 3,
    connector: '12V-2x6', upscaler: 'DLSS 4',
  },
  {
    kind: 'gpu', id: 'rtx5080', name: 'NVIDIA GeForce RTX 5080 16 GB', short: 'RTX 5080', brand: 'NVIDIA', maker: 'NVIDIA', price: 19990,
    vram: 16, fps: { 1080: 180, 1440: 133, 2160: 80 }, rt: 0.64, power: 360, recPsu: 850, length: 330, slots: 3, height: 135, fans: 3,
    connector: '12V-2x6', upscaler: 'DLSS 4',
  },
  {
    kind: 'gpu', id: 'rtx5090', name: 'NVIDIA GeForce RTX 5090 32 GB', short: 'RTX 5090', brand: 'NVIDIA', maker: 'NVIDIA', price: 64990,
    vram: 32, fps: { 1080: 225, 1440: 185, 2160: 122 }, rt: 0.66, power: 575, recPsu: 1000, length: 357, slots: 3.5, height: 145, fans: 3,
    connector: '12V-2x6', upscaler: 'DLSS 4',
  },
]

// ───────────────────────────── Hovedkort ─────────────────────────────

export const motherboards: Motherboard[] = [
  {
    kind: 'motherboard', id: 'mb-b550m', name: 'MSI B550M PRO-VDH WiFi', short: 'B550M (AM4, DDR4)', brand: 'MSI', price: 1090,
    socket: 'AM4', chipset: 'B550', form: 'mATX', ramType: 'DDR4', ramSlots: 4, maxRam: 128, m2: 2,
    pcie5Gpu: false, pcie5M2: false, wifi: 'Wi-Fi 6', overclock: true, year: 2020,
  },
  {
    kind: 'motherboard', id: 'mb-b650m', name: 'Gigabyte B650M Gaming Plus WiFi', short: 'B650M (AM5)', brand: 'Gigabyte', price: 1690,
    socket: 'AM5', chipset: 'B650', form: 'mATX', ramType: 'DDR5', ramSlots: 4, maxRam: 192, m2: 2,
    pcie5Gpu: false, pcie5M2: false, wifi: 'Wi-Fi 6E', overclock: true, year: 2022,
  },
  {
    kind: 'motherboard', id: 'mb-b850', name: 'MSI MAG B850 Tomahawk Max WiFi', short: 'B850 Tomahawk (AM5)', brand: 'MSI', price: 2890,
    socket: 'AM5', chipset: 'B850', form: 'ATX', ramType: 'DDR5', ramSlots: 4, maxRam: 256, m2: 4,
    pcie5Gpu: true, pcie5M2: true, wifi: 'Wi-Fi 7', overclock: true, year: 2025,
  },
  {
    kind: 'motherboard', id: 'mb-x870e', name: 'ASUS ROG Strix X870E-E Gaming WiFi', short: 'X870E Strix (AM5)', brand: 'ASUS', price: 5990,
    socket: 'AM5', chipset: 'X870E', form: 'ATX', ramType: 'DDR5', ramSlots: 4, maxRam: 256, m2: 5,
    pcie5Gpu: true, pcie5M2: true, wifi: 'Wi-Fi 7', overclock: true, year: 2024,
  },
  {
    kind: 'motherboard', id: 'mb-b860m', name: 'ASUS TUF Gaming B860M-Plus WiFi', short: 'B860M TUF (Intel)', brand: 'ASUS', price: 2290,
    socket: 'LGA1851', chipset: 'B860', form: 'mATX', ramType: 'DDR5', ramSlots: 4, maxRam: 256, m2: 3,
    pcie5Gpu: true, pcie5M2: true, wifi: 'Wi-Fi 7', overclock: false, year: 2025,
  },
  {
    kind: 'motherboard', id: 'mb-z890', name: 'MSI MAG Z890 Tomahawk WiFi', short: 'Z890 Tomahawk (Intel)', brand: 'MSI', price: 3690,
    socket: 'LGA1851', chipset: 'Z890', form: 'ATX', ramType: 'DDR5', ramSlots: 4, maxRam: 256, m2: 4,
    pcie5Gpu: true, pcie5M2: true, wifi: 'Wi-Fi 7', overclock: true, year: 2024,
  },
]

// ───────────────────────────── Minne ─────────────────────────────

export const rams: Ram[] = [
  {
    kind: 'ram', id: 'ram-d4-16', name: 'Corsair Vengeance LPX 16 GB (2×8) DDR4-3200 CL16', short: '16 GB DDR4-3200', brand: 'Corsair', price: 1890,
    type: 'DDR4', sticks: 2, perStick: 8, speed: 3200, cl: 16, rgb: false, color: 'black', form: 'DIMM',
  },
  {
    kind: 'ram', id: 'ram-d4-32', name: 'Corsair Vengeance LPX 32 GB (2×16) DDR4-3600 CL18', short: '32 GB DDR4-3600', brand: 'Corsair', price: 3590,
    type: 'DDR4', sticks: 2, perStick: 16, speed: 3600, cl: 18, rgb: false, color: 'black', form: 'DIMM',
  },
  {
    kind: 'ram', id: 'ram-d5-16x1', name: 'Kingston Fury Beast 16 GB (1×16) DDR5-5600 CL36', short: '16 GB DDR5 (én brikke)', brand: 'Kingston', price: 3090,
    type: 'DDR5', sticks: 1, perStick: 16, speed: 5600, cl: 36, rgb: false, color: 'black', form: 'DIMM',
  },
  {
    kind: 'ram', id: 'ram-d5-16', name: 'Kingston Fury Beast 16 GB (2×8) DDR5-5600 CL36', short: '16 GB DDR5-5600', brand: 'Kingston', price: 3290,
    type: 'DDR5', sticks: 2, perStick: 8, speed: 5600, cl: 36, rgb: false, color: 'black', form: 'DIMM',
  },
  {
    kind: 'ram', id: 'ram-d5-32', name: 'Corsair Vengeance 32 GB (2×16) DDR5-6000 CL30', short: '32 GB DDR5-6000', brand: 'Corsair', price: 6190,
    type: 'DDR5', sticks: 2, perStick: 16, speed: 6000, cl: 30, rgb: false, color: 'black', form: 'DIMM',
  },
  {
    kind: 'ram', id: 'ram-d5-32rgb', name: 'G.Skill Trident Z5 RGB 32 GB (2×16) DDR5-6400 CL32', short: '32 GB DDR5-6400 RGB', brand: 'G.Skill', price: 7190,
    type: 'DDR5', sticks: 2, perStick: 16, speed: 6400, cl: 32, rgb: true, color: 'silver', form: 'DIMM',
  },
  {
    kind: 'ram', id: 'ram-d5-64', name: 'Corsair Vengeance RGB 64 GB (2×32) DDR5-6000 CL30', short: '64 GB DDR5-6000 RGB', brand: 'Corsair', price: 12490,
    type: 'DDR5', sticks: 2, perStick: 32, speed: 6000, cl: 30, rgb: true, color: 'black', form: 'DIMM',
  },
]

// ───────────────────────────── Lagring ─────────────────────────────

export const storages: Storage[] = [
  {
    kind: 'storage', id: 'ssd-nv3-1', name: 'Kingston NV3 1 TB', short: 'NV3 1 TB', brand: 'Kingston', price: 1990,
    capacity: 1000, iface: 'PCIe 4.0', read: 6000, write: 4000, nand: 'QLC', dram: false,
  },
  {
    kind: 'storage', id: 'ssd-sn7100-1', name: 'WD Black SN7100 1 TB', short: 'SN7100 1 TB', brand: 'WD', price: 2490,
    capacity: 1000, iface: 'PCIe 4.0', read: 7250, write: 6900, nand: 'TLC', dram: false,
  },
  {
    kind: 'storage', id: 'ssd-sn5000-2', name: 'WD Blue SN5000 2 TB', short: 'SN5000 2 TB', brand: 'WD', price: 3990,
    capacity: 2000, iface: 'PCIe 4.0', read: 5150, write: 4850, nand: 'TLC', dram: false,
  },
  {
    kind: 'storage', id: 'ssd-990pro-2', name: 'Samsung 990 Pro 2 TB', short: '990 Pro 2 TB', brand: 'Samsung', price: 4990,
    capacity: 2000, iface: 'PCIe 4.0', read: 7450, write: 6900, nand: 'TLC', dram: true,
  },
  {
    kind: 'storage', id: 'ssd-9100pro-2', name: 'Samsung 9100 Pro 2 TB', short: '9100 Pro 2 TB', brand: 'Samsung', price: 6490,
    capacity: 2000, iface: 'PCIe 5.0', read: 14700, write: 13400, nand: 'TLC', dram: true,
  },
  {
    kind: 'storage', id: 'ssd-sn850x-4', name: 'WD Black SN850X 4 TB', short: 'SN850X 4 TB', brand: 'WD', price: 9990,
    capacity: 4000, iface: 'PCIe 4.0', read: 7300, write: 6600, nand: 'TLC', dram: true,
  },
]

// ───────────────────────────── Strømforsyninger ─────────────────────────────

export const psus: Psu[] = [
  {
    kind: 'psu', id: 'psu-550b', name: 'Corsair CX550', short: '550 W Bronze', brand: 'Corsair', price: 690,
    watt: 550, rating: '80 Plus Bronze', modular: 'Faste kabler', atx3: false, length: 140,
  },
  {
    kind: 'psu', id: 'psu-650g', name: 'be quiet! Pure Power 12 M 650 W', short: '650 W Gold', brand: 'be quiet!', price: 1090,
    watt: 650, rating: '80 Plus Gold', modular: 'Helmodulær', atx3: true, length: 160,
  },
  {
    kind: 'psu', id: 'psu-750g', name: 'Corsair RM750e', short: '750 W Gold', brand: 'Corsair', price: 1290,
    watt: 750, rating: '80 Plus Gold', modular: 'Helmodulær', atx3: true, length: 140,
  },
  {
    kind: 'psu', id: 'psu-850g', name: 'Corsair RM850x', short: '850 W Gold', brand: 'Corsair', price: 1690,
    watt: 850, rating: '80 Plus Gold', modular: 'Helmodulær', atx3: true, length: 160,
  },
  {
    kind: 'psu', id: 'psu-1000g', name: 'Corsair RM1000x', short: '1000 W Gold', brand: 'Corsair', price: 2390,
    watt: 1000, rating: '80 Plus Gold', modular: 'Helmodulær', atx3: true, length: 160,
  },
  {
    kind: 'psu', id: 'psu-1200p', name: 'Corsair HX1200i', short: '1200 W Platinum', brand: 'Corsair', price: 3490,
    watt: 1200, rating: '80 Plus Platinum', modular: 'Helmodulær', atx3: true, length: 180,
  },
]

// ───────────────────────────── CPU-kjølere ─────────────────────────────

export const coolers: Cooler[] = [
  {
    kind: 'cooler', id: 'cool-stock', name: 'AMD Wraith Stealth (følger med)', short: 'Wraith Stealth', brand: 'AMD', price: 0,
    type: 'stock', capacity: 65, height: 54, radiator: 0, fans: 1, noise: 39, sockets: ['AM4', 'AM5'],
  },
  {
    kind: 'cooler', id: 'cool-ax120', name: 'Thermalright Assassin X 120 Refined SE', short: 'Assassin X 120', brand: 'Thermalright', price: 249,
    type: 'single', capacity: 180, height: 148, radiator: 0, fans: 1, noise: 26, sockets: ['AM4', 'AM5', 'LGA1851'],
  },
  {
    kind: 'cooler', id: 'cool-pa120', name: 'Thermalright Peerless Assassin 120 SE', short: 'Peerless Assassin 120', brand: 'Thermalright', price: 449,
    type: 'dual', capacity: 260, height: 155, radiator: 0, fans: 2, noise: 26, sockets: ['AM4', 'AM5', 'LGA1851'],
  },
  {
    kind: 'cooler', id: 'cool-d15', name: 'Noctua NH-D15 G2', short: 'NH-D15 G2', brand: 'Noctua', price: 1690,
    type: 'dual', capacity: 300, height: 168, radiator: 0, fans: 2, noise: 24, sockets: ['AM4', 'AM5', 'LGA1851'],
  },
  {
    kind: 'cooler', id: 'cool-lf240', name: 'Arctic Liquid Freezer III Pro 240', short: 'Liquid Freezer III 240', brand: 'Arctic', price: 990,
    type: 'aio', capacity: 300, height: 55, radiator: 240, fans: 2, noise: 27, sockets: ['AM4', 'AM5', 'LGA1851'],
  },
  {
    kind: 'cooler', id: 'cool-lf360', name: 'Arctic Liquid Freezer III Pro 360', short: 'Liquid Freezer III 360', brand: 'Arctic', price: 1290,
    type: 'aio', capacity: 360, height: 55, radiator: 360, fans: 3, noise: 27, sockets: ['AM4', 'AM5', 'LGA1851'],
  },
]

// ───────────────────────────── Kabinetter ─────────────────────────────

export const cases: Case[] = [
  {
    kind: 'case', id: 'case-ch370', name: 'DeepCool CH370', short: 'CH370 (kompakt mATX)', brand: 'DeepCool', price: 790,
    forms: ['mATX'], dims: { w: 215, h: 431, d: 402 }, gpuMax: 320, coolerMax: 165, radTop: 240,
    frontFans: 2, fanSize: 120, style: 'mesh', color: 'white',
  },
  {
    kind: 'case', id: 'case-north', name: 'Fractal Design North', short: 'North (ATX)', brand: 'Fractal Design', price: 1690,
    forms: ['ATX', 'mATX'], dims: { w: 215, h: 469, d: 447 }, gpuMax: 355, coolerMax: 169, radTop: 240,
    frontFans: 2, fanSize: 140, style: 'slats', color: 'black',
  },
  {
    kind: 'case', id: 'case-l216', name: 'Lian Li Lancool 216', short: 'Lancool 216 (stor ATX)', brand: 'Lian Li', price: 1290,
    forms: ['ATX', 'mATX'], dims: { w: 235, h: 492, d: 481 }, gpuMax: 392, coolerMax: 180, radTop: 360,
    frontFans: 2, fanSize: 160, style: 'mesh', color: 'black',
  },
]

// ───────────────────────────── Bærbare: deler ─────────────────────────────

const laptopCpus: Cpu[] = [
  {
    kind: 'cpu', id: 'l-r7-250', name: 'AMD Ryzen 7 250', short: 'Ryzen 7 250', brand: 'AMD', price: 0,
    socket: 'BGA', arch: 'Zen 4', cores: 8, threads: 16, boost: 5.1, l3: 16, tdp: 45, peak: 54, gamingPower: 40,
    gaming: 58, multi: 62, igpu: 'Radeon 780M', x3d: false, ramType: 'DDR5', year: 2025,
  },
  {
    kind: 'cpu', id: 'l-u9-386h', name: 'Intel Core Ultra 9 386H', short: 'Core Ultra 9 386H', brand: 'Intel', price: 0,
    socket: 'BGA', arch: 'Panther Lake', cores: 16, threads: 16, coreLayout: '4 P-kjerner + 8 E-kjerner + 4 LP E-kjerner',
    boost: 5.1, l3: 18, tdp: 45, peak: 80, gamingPower: 50,
    gaming: 68, multi: 88, igpu: 'Intel Arc', x3d: false, ramType: 'DDR5', year: 2026,
  },
  {
    kind: 'cpu', id: 'l-u9-290hx', name: 'Intel Core Ultra 9 290HX Plus', short: 'Core Ultra 9 290HX Plus', brand: 'Intel', price: 0,
    socket: 'BGA', arch: 'Arrow Lake Refresh', cores: 24, threads: 24, coreLayout: '8 P-kjerner + 16 E-kjerner',
    boost: 5.5, l3: 36, tdp: 55, peak: 160, gamingPower: 75,
    gaming: 82, multi: 135, igpu: 'Intel Graphics', x3d: false, ramType: 'DDR5', year: 2026,
  },
]

const lg = (
  id: string, short: string, price: number, vram: number, fps: [number, number, number], power: number,
): Gpu => ({
  kind: 'gpu', id, name: `NVIDIA GeForce ${short} Laptop ${vram} GB`, short: `${short} Laptop`, brand: 'NVIDIA', maker: 'NVIDIA',
  price, vram, fps: { 1080: fps[0], 1440: fps[1], 2160: fps[2] }, rt: 0.6, power, recPsu: 0, length: 0, slots: 0, height: 0,
  fans: 2, connector: '12V-2x6', upscaler: 'DLSS 4', laptop: true,
})

const laptopGpus: Gpu[] = [
  lg('l-rtx5050', 'RTX 5050', 0, 8, [62, 41, 20], 100),
  lg('l-rtx5060', 'RTX 5060', 2000, 8, [76, 52, 26], 115),
  lg('l-rtx5070ti', 'RTX 5070 Ti', 0, 12, [110, 77, 43], 140),
  lg('l-rtx5080', 'RTX 5080', 8000, 16, [135, 97, 56], 175),
  lg('l-rtx5090', 'RTX 5090', 23000, 24, [150, 110, 65], 175),
  // Zephyrus G14 har egne prispåslag
  lg('g14-rtx5070ti', 'RTX 5070 Ti', 0, 12, [110, 77, 43], 120),
  lg('g14-rtx5080', 'RTX 5080', 7000, 16, [135, 97, 56], 130),
]

const laptopRams: Ram[] = [
  {
    kind: 'ram', id: 'l-ram-16x1', name: '16 GB (1×16) DDR5-5600 SO-DIMM', short: '16 GB (én brikke)', brand: 'Lenovo', price: 0,
    type: 'DDR5', sticks: 1, perStick: 16, speed: 5600, cl: 46, rgb: false, color: 'black', form: 'SO-DIMM',
  },
  {
    kind: 'ram', id: 'l-ram-32', name: '32 GB (2×16) DDR5-5600 SO-DIMM', short: '32 GB (2×16)', brand: 'Crucial', price: 2900,
    type: 'DDR5', sticks: 2, perStick: 16, speed: 5600, cl: 46, rgb: false, color: 'black', form: 'SO-DIMM',
  },
  {
    kind: 'ram', id: 'pro-ram-32', name: '32 GB (2×16) DDR5-5600 SO-DIMM', short: '32 GB (2×16)', brand: 'Lenovo', price: 0,
    type: 'DDR5', sticks: 2, perStick: 16, speed: 5600, cl: 46, rgb: false, color: 'black', form: 'SO-DIMM',
  },
  {
    kind: 'ram', id: 'pro-ram-64', name: '64 GB (2×32) DDR5-5600 SO-DIMM', short: '64 GB (2×32)', brand: 'Crucial', price: 6500,
    type: 'DDR5', sticks: 2, perStick: 32, speed: 5600, cl: 46, rgb: false, color: 'black', form: 'SO-DIMM',
  },
  {
    kind: 'ram', id: 'g14-ram-32', name: '32 GB LPDDR5X-7467 (loddet)', short: '32 GB LPDDR5X', brand: 'ASUS', price: 0,
    type: 'DDR5', sticks: 2, perStick: 16, speed: 7467, cl: 40, rgb: false, color: 'black', form: 'Loddet',
  },
]

const laptopStorages: Storage[] = [
  {
    kind: 'storage', id: 'l-ssd-512', name: '512 GB NVMe SSD (PCIe 4.0)', short: '512 GB SSD', brand: 'OEM', price: 0,
    capacity: 512, iface: 'PCIe 4.0', read: 3500, write: 2800, nand: 'QLC', dram: false,
  },
  {
    kind: 'storage', id: 'l-ssd-1', name: '1 TB NVMe SSD (PCIe 4.0)', short: '1 TB SSD', brand: 'OEM', price: 1500,
    capacity: 1000, iface: 'PCIe 4.0', read: 5000, write: 4000, nand: 'TLC', dram: false,
  },
  {
    kind: 'storage', id: 'p-ssd-1', name: '1 TB NVMe SSD (PCIe 4.0)', short: '1 TB SSD', brand: 'OEM', price: 0,
    capacity: 1000, iface: 'PCIe 4.0', read: 7000, write: 6000, nand: 'TLC', dram: true,
  },
  {
    kind: 'storage', id: 'p-ssd-2', name: '2 TB NVMe SSD (PCIe 4.0)', short: '2 TB SSD', brand: 'OEM', price: 2800,
    capacity: 2000, iface: 'PCIe 4.0', read: 7000, write: 6000, nand: 'TLC', dram: true,
  },
]

const displays: Display[] = [
  {
    kind: 'display', id: 'd-loq', name: '15,6" Full HD IPS, 144 Hz', short: '15,6" FHD 144 Hz', brand: 'Lenovo', price: 0,
    size: 15.6, res: [1920, 1080], hz: 144, panel: 'IPS', nits: 300, gamut: '100 % sRGB', native: 1080,
  },
  {
    kind: 'display', id: 'd-g14', name: '14" 3K OLED, 120 Hz', short: '14" 3K OLED 120 Hz', brand: 'ASUS', price: 0,
    size: 14, res: [2880, 1800], hz: 120, panel: 'OLED', nits: 500, gamut: '100 % DCI-P3', native: 1440,
  },
  {
    kind: 'display', id: 'd-pro7', name: '16" WQXGA OLED, 240 Hz', short: '16" OLED 240 Hz', brand: 'Lenovo', price: 0,
    size: 16, res: [2560, 1600], hz: 240, panel: 'OLED', nits: 500, gamut: '100 % DCI-P3', native: 1440,
  },
]

const batteries: Battery[] = [
  { kind: 'battery', id: 'b-loq', name: '60 Wh litium-ion', short: '60 Wh', brand: 'Lenovo', price: 0, wh: 60, hoursLight: 6, hoursGaming: 1.2, charger: 170 },
  { kind: 'battery', id: 'b-g14', name: '73 Wh litium-polymer', short: '73 Wh', brand: 'ASUS', price: 0, wh: 73, hoursLight: 8.5, hoursGaming: 1.5, charger: 200 },
  { kind: 'battery', id: 'b-pro7', name: '99 Wh litium-polymer', short: '99 Wh', brand: 'Lenovo', price: 0, wh: 99, hoursLight: 5.5, hoursGaming: 1.3, charger: 330 },
]

const info = (id: string, name: string, short: string, brand: string, rows: Info['rows']): Info => ({
  kind: 'info', id, name, short, brand, price: 0, rows,
})

const infos: Info[] = [
  // Chassis
  info('c-loq', 'Plastchassis, 15,6"', 'Plast, 2,4 kg', 'Lenovo', [
    ['Vekt', '2,4 kg', 'Lett nok til sekken, men du merker den. Laderen på 170 W veier rundt 0,5 kg i tillegg.'],
    ['Tykkelse', '24 mm'],
    ['Materiale', 'Plast', 'Billigere og litt mykere enn metall. Tåler vanlig bruk fint.'],
    ['Tastatur', 'Hvit bakbelysning, numerisk del'],
    ['Porter', '3× USB-A, 1× USB-C, HDMI 2.1, nettverk'],
  ]),
  info('c-g14', 'Aluminiumschassis, 14"', 'Aluminium, 1,5 kg', 'ASUS', [
    ['Vekt', '1,5 kg', 'Uvanlig lett for en spillmaskin. Prisen er mindre plass til kjøling.'],
    ['Tykkelse', '16 mm'],
    ['Materiale', 'Frest aluminium', 'Stivt og leder varme godt, men blir varmt å ta på under spilling.'],
    ['Tastatur', 'RGB-bakbelysning'],
    ['Porter', '2× USB-C (én Thunderbolt 4), 2× USB-A, HDMI 2.1, microSD'],
  ]),
  info('c-pro7', 'Aluminiumschassis, 16"', 'Aluminium, 2,6 kg', 'Lenovo', [
    ['Vekt', '2,6 kg', 'Laderen på 330 W veier nesten ett kilo til. Dette er en maskin som stort sett står på pulten.'],
    ['Tykkelse', '26 mm', 'Tykkelsen gir plass til et dampkammer og store vifter.'],
    ['Materiale', 'Aluminium'],
    ['Tastatur', 'RGB per tast, numerisk del'],
    ['Porter', '2× Thunderbolt, 3× USB-A, HDMI 2.1, nettverk 2,5 Gbit'],
  ]),
  // Kjøling
  info('k-loq', 'To vifter og tre varmerør', '2 vifter, 3 varmerør', 'Lenovo', [
    ['Vifter', '2', 'Hver vifte trekker luft inn under maskinen og blåser den ut bak.'],
    ['Varmerør', '3 kobberrør', 'Rørene er hule med litt væske. Væsken fordamper ved brikken og kondenserer ved ribbene – slik flyttes varmen.'],
    ['Samlet kjøleeffekt', 'ca. 160 W'],
    ['Støy under spilling', 'ca. 50 dB', 'Tydelig hørbart. De fleste bruker hodetelefoner.'],
  ]),
  info('k-g14', 'To vifter og dampkammer', '2 vifter, dampkammer', 'ASUS', [
    ['Vifter', '2 (+ en liten hjelpevifte)'],
    ['Varmespreder', 'Dampkammer', 'Et dampkammer er et flatt varmerør som dekker både prosessor og skjermkort.'],
    ['Termisk masse', 'Flytende metall på CPU', 'Flytende metall leder varme bedre enn vanlig kjølepasta.'],
    ['Samlet kjøleeffekt', 'ca. 160 W', 'Derfor får skjermkortet mindre effekt her enn i tykkere maskiner.'],
    ['Støy under spilling', 'ca. 46 dB'],
  ]),
  info('k-pro7', 'To store vifter og dampkammer', '2 vifter, stort dampkammer', 'Lenovo', [
    ['Vifter', '2 store'],
    ['Varmespreder', 'Dampkammer over hele hovedkortet'],
    ['Samlet kjøleeffekt', 'ca. 250 W', 'Nok til at skjermkortet får full effekt (175 W) samtidig som prosessoren jobber.'],
    ['Støy under spilling', 'ca. 52 dB'],
  ]),
  // Hovedkort
  info('m-loq', 'Hovedkort med Ryzen-plattform', '2 RAM-spor, 2 M.2', 'Lenovo', [
    ['Prosessor og skjermkort', 'Loddet fast', 'Sitter med hundrevis av loddekuler (BGA) og kan ikke byttes.'],
    ['RAM-spor', '2× SO-DIMM', 'Vanlige, utskiftbare minnebrikker i bærbar størrelse.'],
    ['M.2-plasser', '2', 'Du kan sette inn en ekstra SSD selv.'],
    ['Trådløst', 'Wi-Fi 6, Bluetooth 5.2'],
  ]),
  info('m-g14', 'Kompakt hovedkort', 'Loddet RAM, 1 M.2', 'ASUS', [
    ['Prosessor og skjermkort', 'Loddet fast'],
    ['Minne', 'Loddet LPDDR5X', 'Loddet minne er raskere og tar mindre plass, men kan aldri oppgraderes. Velg nok ved kjøp.'],
    ['M.2-plasser', '1', 'Vil du ha mer lagring, må den gamle SSD-en ut.'],
    ['Trådløst', 'Wi-Fi 7, Bluetooth 5.4'],
  ]),
  info('m-pro7', 'Hovedkort med HX-plattform', '2 RAM-spor, 2 M.2', 'Lenovo', [
    ['Prosessor og skjermkort', 'Loddet fast'],
    ['RAM-spor', '2× SO-DIMM (opptil 64 GB)'],
    ['M.2-plasser', '2'],
    ['Trådløst', 'Wi-Fi 7, Bluetooth 5.4'],
  ]),
]

// ───────────────────────────── Oppslag ─────────────────────────────

export const desktopByKind = {
  cpu: cpus,
  gpu: gpus,
  motherboard: motherboards,
  ram: rams,
  storage: storages,
  psu: psus,
  cooler: coolers,
  case: cases,
} as const

const all: Component[] = [
  ...cpus, ...gpus, ...motherboards, ...rams, ...storages, ...psus, ...coolers, ...cases,
  ...laptopCpus, ...laptopGpus, ...laptopRams, ...laptopStorages, ...displays, ...batteries, ...infos,
]

export const catalog: Record<string, Component> = Object.fromEntries(all.map((c) => [c.id, c]))
