import type { DeviceDef, SlotId } from './types'

const DESKTOP_SLOTS: SlotId[] = ['cpu', 'gpu', 'ram', 'storage', 'motherboard', 'cooler', 'psu', 'case']
const LAPTOP_SLOTS: SlotId[] = ['cpu', 'gpu', 'ram', 'storage', 'display', 'motherboard', 'cooler', 'battery', 'case']

export const devices: DeviceDef[] = [
  {
    id: 'budget',
    kind: 'desktop',
    name: 'Budsjettbygget',
    tagline: 'Rimelig vei inn i 1080p-spilling',
    description:
      'Seks kjerner, et skjermkort for 1080p og et kompakt kabinett. Et godt utgangspunkt som er lett å oppgradere senere, fordi AM5-sokkelen støttes i flere år til.',
    slots: DESKTOP_SLOTS,
    build: {
      cpu: 'r5-7600', gpu: 'rtx5060', ram: 'ram-d5-16', storage: 'ssd-nv3-1',
      motherboard: 'mb-b650m', cooler: 'cool-stock', psu: 'psu-650g', case: 'case-ch370',
    },
    goal: { res: 1080, profile: 'aaa', target: 60, upscale: false },
  },
  {
    id: 'mid',
    kind: 'desktop',
    name: 'Mellomklassen',
    tagline: 'Høye innstillinger i 1440p',
    description:
      'Bygget de fleste entusiaster ender på. Skjermkortet får mesteparten av budsjettet, og resten er valgt for å ikke holde det igjen.',
    slots: DESKTOP_SLOTS,
    build: {
      cpu: 'r7-9700x', gpu: 'rx9070xt', ram: 'ram-d5-32', storage: 'ssd-sn7100-1',
      motherboard: 'mb-b850', cooler: 'cool-pa120', psu: 'psu-750g', case: 'case-north',
    },
    goal: { res: 1440, profile: 'aaa', target: 100, upscale: false },
  },
  {
    id: 'enthusiast',
    kind: 'desktop',
    name: 'Entusiasten',
    tagline: '4K og høy bildefrekvens uten kompromisser',
    description:
      'Markedets raskeste spillprosessor, et skjermkort for 4K og vannkjøling. Her betaler du mye for de siste prosentene.',
    slots: DESKTOP_SLOTS,
    build: {
      cpu: 'r7-9850x3d', gpu: 'rtx5080', ram: 'ram-d5-32rgb', storage: 'ssd-9100pro-2',
      motherboard: 'mb-x870e', cooler: 'cool-lf360', psu: 'psu-1000g', case: 'case-l216',
    },
    goal: { res: 2160, profile: 'aaa', target: 60, upscale: false },
  },
  {
    id: 'loq15',
    kind: 'laptop',
    name: 'Lenovo LOQ 15',
    tagline: 'Rimelig spillbærbar',
    description:
      'En av de mest solgte spillbærbare i sin prisklasse. Plastchassis og enkel skjerm, men pengene er brukt på skjermkortet, og både minne og lagring kan byttes.',
    slots: LAPTOP_SLOTS,
    build: {
      cpu: 'l-r7-250', gpu: 'l-rtx5050', ram: 'l-ram-16x1', storage: 'l-ssd-512', display: 'd-loq',
      motherboard: 'm-loq', cooler: 'k-loq', battery: 'b-loq', case: 'c-loq',
    },
    options: {
      gpu: ['l-rtx5050', 'l-rtx5060'],
      ram: ['l-ram-16x1', 'l-ram-32'],
      storage: ['l-ssd-512', 'l-ssd-1'],
    },
    fixed: { gpu: 'Loddet på hovedkortet. Velges når du kjøper maskinen.' },
    basePrice: 11990,
    gpuFactor: 1,
    geom: {
      w: 360, d: 258, baseT: 19, lidT: 6, body: '#6d737a', deck: '#3b3f45', keyGlow: '#e9eef5',
      diag: 15.6, aspect: 16 / 9, battery: [250, 78], vapor: false, logo: 'bar',
    },
    goal: { res: 1080, profile: 'aaa', target: 60, upscale: false },
  },
  {
    id: 'g14',
    kind: 'laptop',
    name: 'ASUS ROG Zephyrus G14',
    tagline: 'Tynn og lett med kraftig skjermkort',
    description:
      'Halvannet kilo med OLED-skjerm og et skjermkort som egentlig hører hjemme i større maskiner. Kompromisset er at nesten alt er loddet fast.',
    slots: LAPTOP_SLOTS,
    build: {
      cpu: 'l-u9-386h', gpu: 'g14-rtx5070ti', ram: 'g14-ram-32', storage: 'p-ssd-1', display: 'd-g14',
      motherboard: 'm-g14', cooler: 'k-g14', battery: 'b-g14', case: 'c-g14',
    },
    options: {
      gpu: ['g14-rtx5070ti', 'g14-rtx5080'],
      storage: ['p-ssd-1', 'p-ssd-2'],
    },
    fixed: {
      gpu: 'Loddet på hovedkortet. Velges når du kjøper maskinen.',
      ram: 'Minnet er loddet fast og kan ikke oppgraderes.',
    },
    basePrice: 39990,
    gpuFactor: 0.9,
    geom: {
      w: 311, d: 220, baseT: 12, lidT: 4.5, body: '#8d9299', deck: '#868b92', keyGlow: '#dfe6ee',
      diag: 14, aspect: 16 / 10, battery: [236, 70], vapor: true, logo: 'slash',
    },
    goal: { res: 1440, profile: 'aaa', target: 60, upscale: false },
  },
  {
    id: 'pro7i',
    kind: 'laptop',
    name: 'Lenovo Legion Pro 7i',
    tagline: 'Stasjonær ytelse i bærbar form',
    description:
      'Seksten tommer, 24 kjerner og et skjermkort med full effekt. Tykk og tung nok til å kjøle det ordentlig – en erstatning for stasjonær PC som kan flyttes.',
    slots: LAPTOP_SLOTS,
    build: {
      cpu: 'l-u9-290hx', gpu: 'l-rtx5080', ram: 'pro-ram-32', storage: 'p-ssd-1', display: 'd-pro7',
      motherboard: 'm-pro7', cooler: 'k-pro7', battery: 'b-pro7', case: 'c-pro7',
    },
    options: {
      gpu: ['l-rtx5070ti', 'l-rtx5080', 'l-rtx5090'],
      ram: ['pro-ram-32', 'pro-ram-64'],
      storage: ['p-ssd-1', 'p-ssd-2'],
    },
    fixed: { gpu: 'Loddet på hovedkortet. Velges når du kjøper maskinen.' },
    basePrice: 39990,
    gpuFactor: 1,
    geom: {
      w: 364, d: 268, baseT: 20, lidT: 6, body: '#1d1f23', deck: '#17191c', keyGlow: '#6fd3ff',
      diag: 16, aspect: 16 / 10, battery: [270, 84], vapor: true, logo: 'ring',
    },
    goal: { res: 1440, profile: 'aaa', target: 100, upscale: false },
  },
]

export const deviceById: Record<string, DeviceDef> = Object.fromEntries(devices.map((d) => [d.id, d]))
