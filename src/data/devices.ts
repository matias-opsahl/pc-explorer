import type { DeviceDef, SlotId } from './types'

const DESKTOP_SLOTS: SlotId[] = ['cpu', 'gpu', 'ram', 'storage', 'motherboard', 'cooler', 'psu', 'case']
const LAPTOP_SLOTS: SlotId[] = ['cpu', 'gpu', 'ram', 'storage', 'display', 'motherboard', 'cooler', 'battery', 'case']

export const devices: DeviceDef[] = [
  {
    id: 'empty',
    kind: 'desktop',
    name: 'Empty case',
    tagline: 'Start from nothing and add every part yourself',
    description:
      'Just the case. Open it and pick each part one by one, and watch the machine take shape. Or choose one of the finished builds below as a starting point.',
    slots: DESKTOP_SLOTS,
    build: { case: 'case-north' },
    goal: { res: 1440, profile: 'aaa', target: 60, upscale: false },
  },
  {
    id: 'budget',
    kind: 'desktop',
    name: 'Budget build',
    tagline: 'An affordable way into 1080p gaming',
    description:
      'Six cores, a graphics card for 1080p and a compact case. A good starting point that is easy to upgrade later, because the AM5 socket is supported for several more years.',
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
    name: 'Mid-range',
    tagline: 'High settings at 1440p',
    description:
      'The build most enthusiasts end up with. The graphics card gets most of the budget, and the rest is chosen so it does not hold the card back.',
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
    name: 'Enthusiast',
    tagline: '4K and high frame rates without compromises',
    description:
      'The fastest gaming processor on the market, a graphics card for 4K and liquid cooling. Here you pay a lot for the last few percent.',
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
    tagline: 'Affordable gaming laptop',
    description:
      'One of the best-selling gaming laptops in its price range. Plastic chassis and a simple display, but the money has gone into the graphics card, and both memory and storage can be swapped.',
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
    fixed: { gpu: 'Soldered to the motherboard. Chosen when you buy the machine.' },
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
    tagline: 'Thin and light with a powerful graphics card',
    description:
      'Just over a kilo and a half, with an OLED display and a graphics card that really belongs in bigger machines. The compromise is that almost everything is soldered on.',
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
      gpu: 'Soldered to the motherboard. Chosen when you buy the machine.',
      ram: 'The memory is soldered on and cannot be upgraded.',
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
    tagline: 'Desktop performance in laptop form',
    description:
      'Sixteen inches, 24 cores and a graphics card at full power. Thick and heavy enough to cool it properly – a portable replacement for a desktop PC.',
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
    fixed: { gpu: 'Soldered to the motherboard. Chosen when you buy the machine.' },
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
