import type { Component, SlotId } from './types'

export interface SlotText {
  /** Name in lists */
  label: string
  /** What the part does, explained simply */
  what: string
  /** What matters for gaming */
  gaming: string
}

const desktop: Record<string, SlotText> = {
  cpu: {
    label: 'Processor',
    what: 'The brain of the machine. The processor runs the game itself – physics, opponents and what needs to be drawn – and tells the graphics card what to draw for every single frame.',
    gaming:
      'The processor sets the ceiling for how many frames per second you can get. It matters most in esports games and at 1080p. X3D models have extra cache and are the fastest in games.',
  },
  gpu: {
    label: 'Graphics card',
    what: 'Draws the images you see. The graphics card calculates color and light for millions of pixels, many times per second.',
    gaming:
      'The most important part for frame rate, especially at 1440p and 4K. VRAM is the card\'s own memory – if it fills up, the game starts to stutter.',
  },
  ram: {
    label: 'Memory',
    what: 'The short-term memory. This is where the game and everything else running right now is stored, so the processor can access it instantly. Everything is erased when you turn the machine off.',
    gaming:
      '32 GB is safe for new games, 16 GB is a minimum. Always use two sticks: a single stick alone gives half the bandwidth and noticeably lower frame rates.',
  },
  storage: {
    label: 'Storage',
    what: 'The long-term memory. Windows, games and files are also stored here when the machine is off. An M.2 SSD is about the size of a stick of chewing gum and sits directly on the motherboard.',
    gaming: 'A faster SSD gives shorter loading times, not higher frame rates. Plan for 100–150 GB per large game.',
  },
  motherboard: {
    label: 'Motherboard',
    what: 'The circuit board all other parts connect to. It sends power and data between the processor, memory, graphics card and storage – like the road network in a city.',
    gaming:
      'The motherboard does not give higher frame rates on its own, but it decides what you can install. The socket must match the processor, and the memory type must match your RAM.',
  },
  cooler: {
    label: 'CPU cooler',
    what: 'Moves the heat away from the processor. Heat pipes or liquid carry the heat to cooling fins, and fans blow it out of the case.',
    gaming:
      'If the processor gets too hot, it slows itself down. A bigger cooler keeps performance up and can run slower, so it is quieter.',
  },
  psu: {
    label: 'Power supply',
    what: 'Converts the power from the wall (230 V AC) into the low DC voltages the parts need: 12 V, 5 V and 3.3 V.',
    gaming:
      'It must deliver enough watts when the graphics card and processor are working at full load, with some headroom. The 80 Plus rating tells you how little power is turned into heat along the way.',
  },
  case: {
    label: 'Case',
    what: 'The shell that holds everything in place. The case determines how large the parts you can fit are, and how easily cold air comes in and warm air goes out.',
    gaming:
      'Choose based on airflow and space. A graphics card over 30 cm and a tall tower cooler will not fit in every case.',
  },
}

const laptop: Record<string, SlotText> = {
  cpu: {
    label: 'Processor',
    what: desktop.cpu.what,
    gaming:
      'In a laptop the processor is soldered on and built for lower power than in a desktop. It is chosen when you buy the machine.',
  },
  gpu: {
    label: 'Graphics card',
    what: desktop.gpu.what,
    gaming:
      'Laptop graphics cards have the same names as desktop ones, but they are different chips with lower power. An RTX 5080 Laptop performs roughly like a desktop RTX 5070. Thin machines give the card even less power.',
  },
  ram: {
    label: 'Memory',
    what: desktop.ram.what,
    gaming:
      'Check whether the memory is soldered or sits in slots. Budget machines are often sold with one stick – adding a second is the cheapest upgrade you can make.',
  },
  storage: {
    label: 'Storage',
    what: 'The long-term memory. Windows, games and files are also stored here when the machine is off. The SSD is a small card screwed onto the motherboard.',
    gaming: desktop.storage.gaming,
  },
  display: {
    label: 'Display',
    what: 'The image is made of pixels that either glow on their own (OLED) or let through light from a lamp behind them (IPS).',
    gaming:
      'The resolution determines how many pixels the graphics card has to draw. The refresh rate (Hz) determines how many of the frames you actually get to see each second.',
  },
  motherboard: {
    label: 'Motherboard',
    what: 'On a laptop the processor and graphics card are soldered directly onto the motherboard to save space. That is why they cannot be swapped later.',
    gaming: 'Look for free slots: RAM slots and an extra M.2 slot mean the machine can be upgraded later.',
  },
  cooler: {
    label: 'Cooling system',
    what: 'Flat heat pipes or a vapor chamber carry the heat from the processor and graphics card out to two small fans, which blow it out the back and sides.',
    gaming:
      'The cooling decides how much power the chips are allowed to use. That is why the same graphics card performs better in a thick machine than in a thin one.',
  },
  battery: {
    label: 'Battery',
    what: 'Powers the whole machine when the charger is not plugged in. Capacity is measured in watt-hours (Wh), and airlines allow a maximum of 100 Wh.',
    gaming:
      'Gaming draws 100–250 W. On battery it lasts around an hour, and performance is cut sharply. Play with the charger plugged in.',
  },
  case: {
    label: 'Chassis',
    what: 'The shell does the job of case, keyboard and display hinge all at once – and everything has to fit within a few centimeters of height.',
    gaming: 'A thicker chassis means better cooling and more performance, but more to carry.',
  },
}

export function slotText(kind: 'desktop' | 'laptop', slot: SlotId): SlotText {
  return (kind === 'laptop' ? laptop : desktop)[slot]
}

// ───────────────────────────── Spec rows ─────────────────────────────

export interface SpecRow {
  label: string
  value: string
  hint?: string
}

const n = (v: number) => v.toLocaleString('en-US')

export function specRows(c: Component): SpecRow[] {
  switch (c.kind) {
    case 'cpu':
      return [
        {
          label: 'Cores and threads',
          value: `${c.cores} cores, ${c.threads} threads`,
          hint:
            (c.coreLayout ? `${c.coreLayout}. P-cores are fast and handle the game, E-cores are small and handle background tasks. ` : '') +
            'More cores means more tasks at once. Games usually make good use of 6–8 cores.',
        },
        {
          label: 'Maximum clock speed',
          value: `${c.boost.toLocaleString('en-US', { minimumFractionDigits: 1 })} GHz`,
          hint: 'How many billion steps one core takes per second at its fastest. Only comparable between chips of the same generation.',
        },
        {
          label: 'L3 cache',
          value: `${c.l3} MB${c.x3d ? ' (3D V-Cache)' : ''}`,
          hint: c.x3d
            ? 'Extremely fast memory inside the processor. X3D chips have an extra layer of cache stacked on top, so the game less often has to wait for RAM. That is the whole reason they are so fast in games.'
            : 'Extremely fast memory inside the processor. The more that fits here, the less often the processor has to wait for RAM.',
        },
        {
          label: 'Socket',
          value: c.socket === 'BGA' ? 'Soldered (BGA)' : c.socket,
          hint:
            c.socket === 'BGA'
              ? 'The chip is soldered to the motherboard with hundreds of tiny solder balls and cannot be removed.'
              : 'The physical connection to the motherboard. Processor and motherboard must have the same socket.',
        },
        {
          label: 'Thermal design power (TDP)',
          value: `${c.tdp} W, up to ${c.peak} W`,
          hint: 'TDP is the minimum heat the cooler must be able to remove. Under full load the processor can draw more for short periods.',
        },
        { label: 'Architecture', value: c.arch, hint: 'The generation of the core design. Newer architecture does more work per clock cycle.' },
        {
          label: 'Integrated graphics',
          value: c.igpu ?? 'None',
          hint: c.igpu
            ? 'Enough to display an image and watch video, but not for new games. Useful if the graphics card fails.'
            : 'Without integrated graphics you need a graphics card to get an image.',
        },
        {
          label: 'Memory type',
          value: c.ramType,
          hint: 'Which generation of RAM the processor can work with.',
        },
      ]
    case 'gpu':
      return [
        {
          label: 'Memory (VRAM)',
          value: `${c.vram} GB`,
          hint: 'The graphics card\'s own memory for textures and frame buffers. 8 GB is enough for 1080p, 12 GB for 1440p, and 16 GB gives a safe margin at 4K.',
        },
        {
          label: 'Frame rate in demanding games',
          value: `${c.fps[1080]} / ${c.fps[1440]} / ${c.fps[2160]} FPS`,
          hint: 'Approximate average at 1080p / 1440p / 4K with the highest settings and no upscaling, assuming the processor does not hold it back.',
        },
        {
          label: 'Power consumption',
          value: `${c.power} W`,
          hint: c.laptop
            ? 'The highest power the card can get in a laptop (TGP). Thin machines give it less than this.'
            : 'How much power the card draws under full load. All of it becomes heat that must leave the case.',
        },
        ...(c.laptop
          ? []
          : [
              {
                label: 'Size',
                value: `${c.length} mm long, ${String(c.slots)} slots thick`,
                hint: 'The length must be shorter than the space the case has. The thickness is measured in expansion slots at the back.',
              },
              {
                label: 'Power connector',
                value: c.connector,
                hint:
                  c.connector === '12V-2x6'
                    ? 'One narrow connector that can deliver up to 600 W. Power supplies with the ATX 3 standard have the cable built in; older ones need an adapter.'
                    : 'Classic PCIe connectors that each deliver up to 150 W.',
              },
              {
                label: 'Recommended power supply',
                value: `${c.recPsu} W`,
                hint: 'The manufacturer\'s recommendation for the whole machine, with margin for short power spikes.',
              },
            ]),
        {
          label: 'Upscaling',
          value: c.upscaler,
          hint: 'The card renders the image at a lower resolution and uses machine learning to scale it up. Typically gives 30–50% higher frame rates.',
        },
        {
          label: 'Ray tracing',
          value: c.rt >= 0.6 ? 'Strong' : c.rt >= 0.55 ? 'Good' : 'Moderate',
          hint: 'Ray tracing simulates real light rays and gives better reflections and shadows, but costs a lot of performance.',
        },
      ]
    case 'motherboard':
      return [
        { label: 'Socket', value: c.socket, hint: 'Determines which processors fit. AM5 is AMD\'s current socket, LGA1851 is Intel\'s.' },
        {
          label: 'Chipset',
          value: c.chipset,
          hint: 'Controls how many ports and slots the board has. The letter indicates the level: B is mid-range, X and Z are top models.',
        },
        {
          label: 'Form factor',
          value: c.form === 'mATX' ? 'Micro-ATX (244 × 244 mm)' : 'ATX (305 × 244 mm)',
          hint: 'The size of the board. The case must support the form factor. Micro-ATX also fits in ATX cases, but not the other way around.',
        },
        { label: 'Memory', value: `${c.ramSlots} slots, ${c.ramType}, up to ${c.maxRam} GB`, hint: 'DDR4 and DDR5 have their notch in different places and do not fit in each other\'s slots.' },
        { label: 'M.2 slots', value: `${c.m2}`, hint: 'How many SSDs you can screw directly onto the board.' },
        {
          label: 'PCIe 5.0',
          value: c.pcie5Gpu ? (c.pcie5M2 ? 'Graphics card and SSD' : 'Graphics card') : 'No (PCIe 4.0)',
          hint: 'PCIe is the highway between the processor and graphics card/SSD. 5.0 has double the speed of 4.0, but today\'s graphics cards barely notice the difference.',
        },
        { label: 'Wireless', value: c.wifi },
        {
          label: 'Overclocking',
          value: c.overclock ? 'Supported' : 'Memory only',
          hint: 'Running the processor faster than its factory setting. On Intel a Z-series chipset is required.',
        },
      ]
    case 'ram':
      return [
        {
          label: 'Capacity',
          value: `${c.sticks * c.perStick} GB (${c.sticks} × ${c.perStick} GB)`,
          hint: 'Two sticks let the processor read from both at the same time (dual channel).',
        },
        { label: 'Type', value: c.form === 'Soldered' ? 'LPDDR5X (soldered)' : `${c.type}${c.form === 'SO-DIMM' ? ' SO-DIMM' : ''}`, hint: 'The generation must match the motherboard.' },
        {
          label: 'Speed',
          value: `${n(c.speed)} MHz`,
          hint:
            c.type === 'DDR5'
              ? 'How fast data is moved. 6000 MHz is considered the best compromise for DDR5. The speed must be enabled in the BIOS with EXPO or XMP.'
              : 'How fast data is moved. 3200–3600 MHz is common for DDR4.',
        },
        {
          label: 'Latency',
          value: `CL${c.cl}`,
          hint: 'How many clock cycles the memory takes to respond. Lower is better, but it must be considered together with the speed.',
        },
        { label: 'Lighting', value: c.rgb ? 'RGB' : 'None' },
      ]
    case 'storage':
      return [
        { label: 'Capacity', value: c.capacity >= 1000 ? `${c.capacity / 1000} TB` : `${c.capacity} GB` },
        {
          label: 'Connection',
          value: `M.2 NVMe, ${c.iface}`,
          hint: 'NVMe drives talk directly to the processor over PCIe. A PCIe 5.0 drive in a 4.0 slot works, but at 4.0 speed.',
        },
        {
          label: 'Read speed',
          value: `${n(c.read)} MB/s`,
          hint: 'How fast large files are read. In games the difference between 5,000 and 14,000 MB/s is often just a second or two.',
        },
        { label: 'Write speed', value: `${n(c.write)} MB/s` },
        {
          label: 'Memory cells',
          value: c.nand,
          hint: 'TLC stores three bits per cell, QLC four. QLC is cheaper, but slower when the drive fills up, and it withstands fewer overwrites.',
        },
        {
          label: 'Own cache (DRAM)',
          value: c.dram ? 'Yes' : 'No',
          hint: 'A small RAM chip that keeps track of where the data is stored. Gives more consistent performance under heavy use.',
        },
      ]
    case 'psu':
      return [
        { label: 'Power', value: `${c.watt} W`, hint: 'The most the power supply can deliver continuously.' },
        {
          label: 'Efficiency',
          value: c.rating,
          hint: 'How much of the power from the wall reaches the parts. Gold means around 90%; the rest becomes heat.',
        },
        {
          label: 'Cables',
          value: c.modular,
          hint: 'Fully modular means you only connect the cables you need. That gives a tidier case and better airflow.',
        },
        {
          label: 'ATX 3 standard',
          value: c.atx3 ? 'Yes, with 12V-2x6 cable' : 'No',
          hint: 'ATX 3 handles the short power spikes from modern graphics cards and has the cable for new graphics cards built in.',
        },
        { label: 'Length', value: `${c.length} mm` },
      ]
    case 'cooler':
      return [
        {
          label: 'Type',
          value:
            c.type === 'aio'
              ? `Liquid cooling, ${c.radiator} mm radiator`
              : c.type === 'dual'
                ? 'Air cooler with two towers'
                : c.type === 'single'
                  ? 'Air cooler with one tower'
                  : 'Low-profile air cooler',
          hint:
            c.type === 'aio'
              ? 'A pump sends liquid from the processor to a radiator, where fans cool it down. Pre-filled and sealed.'
              : 'Heat pipes carry the heat up into thin aluminum fins, and a fan blows air through them.',
        },
        {
          label: 'Cooling capacity',
          value: `approx. ${c.capacity} W`,
          hint: 'Roughly how much heat the cooler can remove without the processor getting too hot.',
        },
        {
          label: c.type === 'aio' ? 'Radiator' : 'Height',
          value: c.type === 'aio' ? `${c.radiator} mm (${c.fans} fans)` : `${c.height} mm`,
          hint:
            c.type === 'aio'
              ? 'The case must have room for the radiator at the top.'
              : 'The height from the processor and up. Must be lower than the space the case has.',
        },
        { label: 'Noise at full speed', value: `approx. ${c.noise} dB`, hint: 'Under 30 dB is barely audible, 40 dB is a clear whoosh.' },
        { label: 'Fits sockets', value: c.sockets.join(', ') },
      ]
    case 'case':
      return [
        {
          label: 'Motherboard',
          value: c.forms.includes('ATX') ? 'ATX and Micro-ATX' : 'Micro-ATX',
          hint: 'Which motherboard sizes can be screwed in.',
        },
        { label: 'Dimensions (W × H × D)', value: `${c.dims.w} × ${c.dims.h} × ${c.dims.d} mm` },
        { label: 'Graphics card, max length', value: `${c.gpuMax} mm`, hint: 'The space from the back wall to the front fans.' },
        { label: 'CPU cooler, max height', value: `${c.coolerMax} mm`, hint: 'The distance from the processor to the side panel.' },
        {
          label: 'Radiator at the top',
          value: c.radTop ? `Up to ${c.radTop} mm` : 'None',
          hint: 'How large a liquid-cooling radiator fits under the roof.',
        },
        { label: 'Front fans', value: `${c.frontFans} × ${c.fanSize} mm`, hint: 'The front fans pull cold air in. Larger fans move the same amount of air with less noise.' },
      ]
    case 'display':
      return [
        { label: 'Size', value: `${c.size}"` },
        {
          label: 'Resolution',
          value: `${c.res[0]} × ${c.res[1]}`,
          hint: 'Number of pixels. More pixels give a sharper image, but more work for the graphics card.',
        },
        {
          label: 'Refresh rate',
          value: `${c.hz} Hz`,
          hint: 'How many times per second the image is refreshed. A higher frame rate than this gives you no benefit.',
        },
        {
          label: 'Panel type',
          value: c.panel,
          hint:
            c.panel === 'OLED'
              ? 'Each pixel glows on its own and can be turned off completely. That gives true black and very fast response.'
              : 'Liquid crystals in front of a backlight. Affordable and durable, but black looks dark grey.',
        },
        { label: 'Brightness', value: `${c.nits} nits`, hint: '300 nits is fine indoors. Outdoors in daylight you need 500 or more.' },
        { label: 'Color gamut', value: c.gamut, hint: 'How much of a standard color palette the screen can display.' },
      ]
    case 'battery':
      return [
        { label: 'Capacity', value: `${c.wh} Wh`, hint: 'Watt-hours: 60 Wh can deliver 60 W for one hour, or 10 W for six.' },
        { label: 'Light use', value: `approx. ${String(c.hoursLight)} hours`, hint: 'Web browsing and video with the graphics card turned off.' },
        { label: 'Gaming', value: `approx. ${String(c.hoursGaming)} hours` },
        { label: 'Charger', value: `${c.charger} W`, hint: 'The charger must deliver more than the machine uses while gaming. Otherwise the battery drains even with the charger plugged in.' },
      ]
    case 'info':
      return c.rows.map(([label, value, hint]) => ({ label, value, hint }))
  }
}

/** Two to three short keywords for the option list */
export function chips(c: Component): string[] {
  switch (c.kind) {
    case 'cpu':
      return [`${c.cores} cores`, `${c.boost.toLocaleString('en-US', { minimumFractionDigits: 1 })} GHz`, c.socket === 'BGA' ? c.arch : c.socket]
    case 'gpu':
      return [`${c.vram} GB`, `${c.power} W`, ...(c.laptop ? [] : [`${c.length} mm`])]
    case 'motherboard':
      return [c.socket, c.form === 'mATX' ? 'Micro-ATX' : 'ATX', c.ramType]
    case 'ram':
      return [c.type, `${n(c.speed)} MHz`, `CL${c.cl}`]
    case 'storage':
      return [c.iface, `${n(c.read)} MB/s`, c.nand]
    case 'psu':
      return [`${c.watt} W`, c.rating.replace('80 Plus ', ''), c.modular]
    case 'cooler':
      return [c.type === 'aio' ? `${c.radiator} mm liquid` : `${c.height} mm tall`, `approx. ${c.capacity} W`]
    case 'case':
      return [c.forms.includes('ATX') ? 'ATX' : 'Micro-ATX', `GPU ≤ ${c.gpuMax} mm`, `Cooler ≤ ${c.coolerMax} mm`]
    case 'display':
      return [`${c.res[0]} × ${c.res[1]}`, `${c.hz} Hz`, c.panel]
    case 'battery':
      return [`${c.wh} Wh`]
    case 'info':
      return []
  }
}

export const kr = (v: number) => `${Math.round(v).toLocaleString('en-US')} NOK`
export const signedKr = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(Math.round(v)).toLocaleString('en-US')} NOK`

export const RES_LABEL: Record<number, string> = { 1080: '1080p', 1440: '1440p', 2160: '4K' }
export const PROFILE_LABEL: Record<string, string> = {
  esport: 'Esports',
  aaa: 'Demanding games',
  rt: 'Ray tracing',
}
export const PROFILE_HINT: Record<string, string> = {
  esport: 'Light, fast games like CS2 and Valorant. Here the processor is what matters.',
  aaa: 'Demanding AAA games at the highest settings, without ray tracing.',
  rt: 'Demanding AAA games with ray tracing on. The most you can ask of a graphics card.',
}
