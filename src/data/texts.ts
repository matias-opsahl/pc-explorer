import type { Component, SlotId } from './types'

export interface SlotText {
  /** Navn i lister */
  label: string
  /** Hva delen gjør, forklart enkelt */
  what: string
  /** Hva som betyr noe for spilling */
  gaming: string
}

const desktop: Record<string, SlotText> = {
  cpu: {
    label: 'Prosessor',
    what: 'Hjernen i maskinen. Prosessoren kjører selve spillet – fysikk, motstandere og hva som skal tegnes – og gir skjermkortet beskjed om hvert eneste bilde.',
    gaming:
      'Prosessoren setter taket for hvor mange bilder i sekundet du kan få. Det merkes mest i esport-spill og på 1080p. X3D-modellene har ekstra cache og er raskest i spill.',
  },
  gpu: {
    label: 'Skjermkort',
    what: 'Tegner bildene du ser. Skjermkortet regner ut farge og lys for millioner av piksler, mange ganger i sekundet.',
    gaming:
      'Den viktigste delen for bildefrekvensen, særlig på 1440p og 4K. VRAM er kortets eget minne – blir det fullt, begynner spillet å hakke.',
  },
  ram: {
    label: 'Minne',
    what: 'Korttidsminnet. Her ligger spillet og alt annet som kjører akkurat nå, slik at prosessoren får tak i det lynraskt. Alt forsvinner når du skrur av.',
    gaming:
      '32 GB er trygt for nye spill, 16 GB er et minimum. Bruk alltid to brikker: én brikke alene gir halv båndbredde og merkbart lavere bildefrekvens.',
  },
  storage: {
    label: 'Lagring',
    what: 'Langtidsminnet. Windows, spill og filer ligger her også når maskinen er av. En M.2 SSD er på størrelse med en tyggispakke og sitter rett på hovedkortet.',
    gaming: 'Raskere SSD gir kortere lastetider, ikke høyere bildefrekvens. Regn 100–150 GB per store spill.',
  },
  motherboard: {
    label: 'Hovedkort',
    what: 'Kretskortet alle andre deler kobles til. Det sender strøm og data mellom prosessor, minne, skjermkort og lagring – som veinettet i en by.',
    gaming:
      'Hovedkortet gir ikke høyere bildefrekvens i seg selv, men bestemmer hva du kan sette i. Sokkelen må passe prosessoren, og minnetypen må passe RAM-en.',
  },
  cooler: {
    label: 'CPU-kjøler',
    what: 'Flytter varmen bort fra prosessoren. Varmerør eller væske frakter varmen til kjøleribber, og vifter blåser den videre ut av kabinettet.',
    gaming:
      'Blir prosessoren for varm, bremser den seg selv. En større kjøler holder ytelsen oppe og kan gå saktere, så den bråker mindre.',
  },
  psu: {
    label: 'Strømforsyning',
    what: 'Gjør om strømmen fra veggen (230 V vekselstrøm) til de lave likespenningene delene trenger: 12 V, 5 V og 3,3 V.',
    gaming:
      'Den må levere nok watt når skjermkort og prosessor jobber for fullt, med litt å gå på. 80 Plus-merket forteller hvor lite strøm som blir til varme på veien.',
  },
  case: {
    label: 'Kabinett',
    what: 'Skallet som holder alt på plass. Kabinettet bestemmer hvor store deler du får plass til, og hvor lett kald luft kommer inn og varm luft ut.',
    gaming:
      'Velg etter luftstrøm og plass. Et skjermkort på over 30 cm og en høy tårnkjøler får ikke plass i alle kabinetter.',
  },
}

const laptop: Record<string, SlotText> = {
  cpu: {
    label: 'Prosessor',
    what: desktop.cpu.what,
    gaming:
      'I en bærbar er prosessoren loddet fast og bygget for lavere effekt enn i en stasjonær. Den velges når du kjøper maskinen.',
  },
  gpu: {
    label: 'Skjermkort',
    what: desktop.gpu.what,
    gaming:
      'Bærbare skjermkort heter det samme som stasjonære, men er andre brikker med lavere effekt. Et RTX 5080 Laptop yter omtrent som et stasjonært RTX 5070. Tynne maskiner gir kortet enda mindre strøm.',
  },
  ram: {
    label: 'Minne',
    what: desktop.ram.what,
    gaming:
      'Sjekk om minnet er loddet eller sitter i spor. Rimelige maskiner selges ofte med én brikke – en brikke til er den billigste oppgraderingen du kan gjøre.',
  },
  storage: {
    label: 'Lagring',
    what: 'Langtidsminnet. Windows, spill og filer ligger her også når maskinen er av. SSD-en er et lite kort som skrus fast i hovedkortet.',
    gaming: desktop.storage.gaming,
  },
  display: {
    label: 'Skjerm',
    what: 'Bildet lages av piksler som enten lyser selv (OLED) eller slipper gjennom lys fra en lampe bak (IPS).',
    gaming:
      'Oppløsningen bestemmer hvor mange piksler skjermkortet må tegne. Oppdateringsfrekvensen (Hz) bestemmer hvor mange av bildene du faktisk får se hvert sekund.',
  },
  motherboard: {
    label: 'Hovedkort',
    what: 'På en bærbar er prosessor og skjermkort loddet rett på hovedkortet for å spare plass. Derfor kan de ikke byttes etterpå.',
    gaming: 'Se etter ledige spor: RAM-spor og en ekstra M.2-plass gjør at maskinen kan oppgraderes senere.',
  },
  cooler: {
    label: 'Kjølesystem',
    what: 'Flate varmerør eller et dampkammer leder varmen fra prosessor og skjermkort ut til to små vifter, som blåser den ut bak og på sidene.',
    gaming:
      'Kjølingen avgjør hvor mye effekt brikkene får lov til å bruke. Derfor yter samme skjermkort bedre i en tykk maskin enn i en tynn.',
  },
  battery: {
    label: 'Batteri',
    what: 'Driver hele maskinen når laderen ikke står i. Kapasiteten måles i wattimer (Wh), og fly tillater maks 100 Wh.',
    gaming:
      'Spilling trekker 100–250 W. På batteri varer det rundt en time, og ytelsen strupes kraftig. Spill med laderen i.',
  },
  case: {
    label: 'Chassis',
    what: 'Skallet gjør jobben til kabinett, tastatur og skjermfeste på én gang – og alt skal få plass på et par centimeters høyde.',
    gaming: 'Tykkere chassis betyr bedre kjøling og mer ytelse, men mer å bære på.',
  },
}

export function slotText(kind: 'desktop' | 'laptop', slot: SlotId): SlotText {
  return (kind === 'laptop' ? laptop : desktop)[slot]
}

// ───────────────────────────── Spec-rader ─────────────────────────────

export interface SpecRow {
  label: string
  value: string
  hint?: string
}

const n = (v: number) => v.toLocaleString('nb-NO')

export function specRows(c: Component): SpecRow[] {
  switch (c.kind) {
    case 'cpu':
      return [
        {
          label: 'Kjerner og tråder',
          value: `${c.cores} kjerner, ${c.threads} tråder`,
          hint:
            (c.coreLayout ? `${c.coreLayout}. P-kjerner er raske og tar seg av spillet, E-kjerner er små og tar bakgrunnsjobber. ` : '') +
            'Flere kjerner betyr flere oppgaver samtidig. Spill utnytter som regel 6–8 kjerner godt.',
        },
        {
          label: 'Høyeste klokkefrekvens',
          value: `${c.boost.toLocaleString('nb-NO', { minimumFractionDigits: 1 })} GHz`,
          hint: 'Hvor mange milliarder steg én kjerne tar i sekundet på sitt raskeste. Kan bare sammenlignes mellom brikker av samme generasjon.',
        },
        {
          label: 'L3-cache',
          value: `${c.l3} MB${c.x3d ? ' (3D V-Cache)' : ''}`,
          hint: c.x3d
            ? 'Lynraskt minne inne i prosessoren. X3D-brikker har et ekstra lag cache stablet oppå, slik at spillet sjeldnere må vente på RAM. Det er hele grunnen til at de er så raske i spill.'
            : 'Lynraskt minne inne i prosessoren. Jo mer som får plass her, desto sjeldnere må prosessoren vente på RAM.',
        },
        {
          label: 'Sokkel',
          value: c.socket === 'BGA' ? 'Loddet (BGA)' : c.socket,
          hint:
            c.socket === 'BGA'
              ? 'Brikken er loddet til hovedkortet med hundrevis av små loddekuler og kan ikke tas ut.'
              : 'Den fysiske tilkoblingen til hovedkortet. Prosessor og hovedkort må ha samme sokkel.',
        },
        {
          label: 'Varmeeffekt (TDP)',
          value: `${c.tdp} W, opptil ${c.peak} W`,
          hint: 'TDP er varmen kjøleren minst må klare å fjerne. Under full last kan prosessoren trekke mer i korte perioder.',
        },
        { label: 'Arkitektur', value: c.arch, hint: 'Generasjonen av kjernedesignet. Nyere arkitektur gjør mer arbeid per klokkeslag.' },
        {
          label: 'Innebygd grafikk',
          value: c.igpu ?? 'Ingen',
          hint: c.igpu
            ? 'Nok til å vise bilde og se film, men ikke til nye spill. Nyttig hvis skjermkortet skulle svikte.'
            : 'Uten innebygd grafikk får du ikke bilde uten et skjermkort.',
        },
        {
          label: 'Minnetype',
          value: c.ramType,
          hint: 'Hvilken generasjon RAM prosessoren kan snakke med.',
        },
      ]
    case 'gpu':
      return [
        {
          label: 'Minne (VRAM)',
          value: `${c.vram} GB`,
          hint: 'Skjermkortets eget minne til teksturer og bildebuffere. 8 GB holder for 1080p, 12 GB for 1440p, og 16 GB gir trygg margin i 4K.',
        },
        {
          label: 'Bildefrekvens i tunge spill',
          value: `${c.fps[1080]} / ${c.fps[1440]} / ${c.fps[2160]} FPS`,
          hint: 'Omtrentlig snitt på 1080p / 1440p / 4K med høyeste innstillinger og uten oppskalering, forutsatt at prosessoren ikke holder igjen.',
        },
        {
          label: 'Effektforbruk',
          value: `${c.power} W`,
          hint: c.laptop
            ? 'Den høyeste effekten kortet kan få i en bærbar (TGP). Tynne maskiner slipper til mindre enn dette.'
            : 'Hvor mye strøm kortet trekker under full last. Alt blir til varme som må ut av kabinettet.',
        },
        ...(c.laptop
          ? []
          : [
              {
                label: 'Størrelse',
                value: `${c.length} mm langt, ${String(c.slots).replace('.', ',')} spor tykt`,
                hint: 'Lengden må være kortere enn det kabinettet har plass til. Tykkelsen måles i utvidelsesspor på baksiden.',
              },
              {
                label: 'Strømkontakt',
                value: c.connector,
                hint:
                  c.connector === '12V-2x6'
                    ? 'Én smal kontakt som kan levere opptil 600 W. Strømforsyninger med ATX 3-standard har kabelen innebygd, eldre trenger en adapter.'
                    : 'Klassiske PCIe-kontakter som hver leverer opptil 150 W.',
              },
              {
                label: 'Anbefalt strømforsyning',
                value: `${c.recPsu} W`,
                hint: 'Produsentens anbefaling for hele maskinen, med margin for korte effekttopper.',
              },
            ]),
        {
          label: 'Oppskalering',
          value: c.upscaler,
          hint: 'Kortet tegner bildet i lavere oppløsning og bruker maskinlæring til å skalere det opp. Gir typisk 30–50 % høyere bildefrekvens.',
        },
        {
          label: 'Ray tracing',
          value: c.rt >= 0.6 ? 'Sterk' : c.rt >= 0.55 ? 'God' : 'Middels',
          hint: 'Ray tracing simulerer ekte lysstråler og gir bedre refleksjoner og skygger, men koster mye ytelse.',
        },
      ]
    case 'motherboard':
      return [
        { label: 'Sokkel', value: c.socket, hint: 'Bestemmer hvilke prosessorer som passer. AM5 er AMDs nåværende sokkel, LGA1851 er Intels.' },
        {
          label: 'Brikkesett',
          value: c.chipset,
          hint: 'Styrer hvor mange porter og plasser kortet har. Bokstaven sier nivået: B er mellomklasse, X og Z er toppmodeller.',
        },
        {
          label: 'Formfaktor',
          value: c.form === 'mATX' ? 'Micro-ATX (244 × 244 mm)' : 'ATX (305 × 244 mm)',
          hint: 'Størrelsen på kortet. Kabinettet må støtte formfaktoren. Micro-ATX passer også i ATX-kabinetter, men ikke omvendt.',
        },
        { label: 'Minne', value: `${c.ramSlots} spor, ${c.ramType}, opptil ${c.maxRam} GB`, hint: 'DDR4 og DDR5 har hakket på ulikt sted og passer ikke i hverandres spor.' },
        { label: 'M.2-plasser', value: `${c.m2}`, hint: 'Hvor mange SSD-er du kan skru rett på kortet.' },
        {
          label: 'PCIe 5.0',
          value: c.pcie5Gpu ? (c.pcie5M2 ? 'Skjermkort og SSD' : 'Skjermkort') : 'Nei (PCIe 4.0)',
          hint: 'PCIe er motorveien mellom prosessoren og skjermkort/SSD. 5.0 har dobbel hastighet av 4.0, men dagens skjermkort merker knapt forskjellen.',
        },
        { label: 'Trådløst', value: c.wifi },
        {
          label: 'Overklokking',
          value: c.overclock ? 'Støttet' : 'Bare minne',
          hint: 'Å kjøre prosessoren raskere enn fabrikkinnstillingen. På Intel kreves et Z-brikkesett.',
        },
      ]
    case 'ram':
      return [
        {
          label: 'Kapasitet',
          value: `${c.sticks * c.perStick} GB (${c.sticks} × ${c.perStick} GB)`,
          hint: 'To brikker lar prosessoren lese fra begge samtidig (dual channel).',
        },
        { label: 'Type', value: c.form === 'Loddet' ? 'LPDDR5X (loddet)' : `${c.type}${c.form === 'SO-DIMM' ? ' SO-DIMM' : ''}`, hint: 'Generasjonen må stemme med hovedkortet.' },
        {
          label: 'Hastighet',
          value: `${n(c.speed)} MHz`,
          hint:
            c.type === 'DDR5'
              ? 'Hvor raskt data flyttes. 6000 MHz regnes som det beste kompromisset for DDR5. Hastigheten må slås på i BIOS med EXPO eller XMP.'
              : 'Hvor raskt data flyttes. 3200–3600 MHz er vanlig for DDR4.',
        },
        {
          label: 'Forsinkelse',
          value: `CL${c.cl}`,
          hint: 'Hvor mange klokkeslag minnet bruker på å svare. Lavere er bedre, men må ses sammen med hastigheten.',
        },
        { label: 'Lys', value: c.rgb ? 'RGB' : 'Ingen' },
      ]
    case 'storage':
      return [
        { label: 'Kapasitet', value: c.capacity >= 1000 ? `${c.capacity / 1000} TB` : `${c.capacity} GB` },
        {
          label: 'Tilkobling',
          value: `M.2 NVMe, ${c.iface}`,
          hint: 'NVMe-disker snakker direkte med prosessoren over PCIe. En PCIe 5.0-disk i en 4.0-plass virker, men i 4.0-hastighet.',
        },
        {
          label: 'Lesehastighet',
          value: `${n(c.read)} MB/s`,
          hint: 'Hvor fort store filer leses. I spill er forskjellen mellom 5 000 og 14 000 MB/s ofte bare et sekund eller to.',
        },
        { label: 'Skrivehastighet', value: `${n(c.write)} MB/s` },
        {
          label: 'Minneceller',
          value: c.nand,
          hint: 'TLC lagrer tre bit per celle, QLC fire. QLC er billigere, men tregere når disken fylles opp, og tåler færre overskrivinger.',
        },
        {
          label: 'Egen hurtigbuffer (DRAM)',
          value: c.dram ? 'Ja' : 'Nei',
          hint: 'En liten RAM-brikke som holder oversikt over hvor dataene ligger. Gir jevnere ytelse under tung bruk.',
        },
      ]
    case 'psu':
      return [
        { label: 'Effekt', value: `${c.watt} W`, hint: 'Det meste strømforsyningen kan levere kontinuerlig.' },
        {
          label: 'Virkningsgrad',
          value: c.rating,
          hint: 'Hvor mye av strømmen fra veggen som når delene. Gold betyr rundt 90 %, resten blir varme.',
        },
        {
          label: 'Kabler',
          value: c.modular,
          hint: 'Helmodulær betyr at du bare kobler til kablene du trenger. Det gir ryddigere kabinett og bedre luftstrøm.',
        },
        {
          label: 'ATX 3-standard',
          value: c.atx3 ? 'Ja, med 12V-2x6-kabel' : 'Nei',
          hint: 'ATX 3 tåler de korte effekttoppene fra moderne skjermkort og har kabelen til nye skjermkort innebygd.',
        },
        { label: 'Lengde', value: `${c.length} mm` },
      ]
    case 'cooler':
      return [
        {
          label: 'Type',
          value:
            c.type === 'aio'
              ? `Vannkjøling, ${c.radiator} mm radiator`
              : c.type === 'dual'
                ? 'Luftkjøler med to tårn'
                : c.type === 'single'
                  ? 'Luftkjøler med ett tårn'
                  : 'Lavprofil luftkjøler',
          hint:
            c.type === 'aio'
              ? 'En pumpe sender væske fra prosessoren til en radiator, der vifter kjøler den ned. Ferdig fylt og lukket.'
              : 'Varmerør fører varmen opp i tynne aluminiumsribber, og en vifte blåser luft gjennom dem.',
        },
        {
          label: 'Kjølekapasitet',
          value: `ca. ${c.capacity} W`,
          hint: 'Omtrent hvor mye varme kjøleren klarer å fjerne uten at prosessoren blir for varm.',
        },
        {
          label: c.type === 'aio' ? 'Radiator' : 'Høyde',
          value: c.type === 'aio' ? `${c.radiator} mm (${c.fans} vifter)` : `${c.height} mm`,
          hint:
            c.type === 'aio'
              ? 'Kabinettet må ha plass til radiatoren i toppen.'
              : 'Høyden fra prosessoren og opp. Må være lavere enn det kabinettet har plass til.',
        },
        { label: 'Støy ved full fart', value: `ca. ${c.noise} dB`, hint: 'Under 30 dB er knapt hørbart, 40 dB er tydelig sus.' },
        { label: 'Passer sokler', value: c.sockets.join(', ') },
      ]
    case 'case':
      return [
        {
          label: 'Hovedkort',
          value: c.forms.includes('ATX') ? 'ATX og Micro-ATX' : 'Micro-ATX',
          hint: 'Hvilke størrelser hovedkort som kan skrus fast.',
        },
        { label: 'Mål (B × H × D)', value: `${c.dims.w} × ${c.dims.h} × ${c.dims.d} mm` },
        { label: 'Skjermkort, maks lengde', value: `${c.gpuMax} mm`, hint: 'Plassen fra bakveggen til frontviftene.' },
        { label: 'CPU-kjøler, maks høyde', value: `${c.coolerMax} mm`, hint: 'Avstanden fra prosessoren til sidepanelet.' },
        {
          label: 'Radiator i toppen',
          value: c.radTop ? `Opptil ${c.radTop} mm` : 'Ingen',
          hint: 'Hvor stor vannkjøler-radiator som får plass under taket.',
        },
        { label: 'Vifter foran', value: `${c.frontFans} × ${c.fanSize} mm`, hint: 'Frontviftene trekker kald luft inn. Større vifter flytter like mye luft med mindre støy.' },
      ]
    case 'display':
      return [
        { label: 'Størrelse', value: `${String(c.size).replace('.', ',')}"` },
        {
          label: 'Oppløsning',
          value: `${c.res[0]} × ${c.res[1]}`,
          hint: 'Antall piksler. Flere piksler gir skarpere bilde, men mer arbeid for skjermkortet.',
        },
        {
          label: 'Oppdateringsfrekvens',
          value: `${c.hz} Hz`,
          hint: 'Hvor mange ganger i sekundet bildet byttes. Høyere bildefrekvens enn dette får du ikke glede av.',
        },
        {
          label: 'Paneltype',
          value: c.panel,
          hint:
            c.panel === 'OLED'
              ? 'Hver piksel lyser selv og kan slås helt av. Det gir ekte svart og svært rask respons.'
              : 'Flytende krystaller foran en baklampe. Rimelig og holdbart, men svart blir mørk grå.',
        },
        { label: 'Lysstyrke', value: `${c.nits} nits`, hint: '300 nits holder innendørs. Ute i dagslys trengs 500 eller mer.' },
        { label: 'Fargeomfang', value: c.gamut, hint: 'Hvor stor del av en standard fargepalett skjermen klarer å vise.' },
      ]
    case 'battery':
      return [
        { label: 'Kapasitet', value: `${c.wh} Wh`, hint: 'Wattimer: 60 Wh kan levere 60 W i én time, eller 10 W i seks.' },
        { label: 'Lett bruk', value: `ca. ${String(c.hoursLight).replace('.', ',')} timer`, hint: 'Nettsurfing og video med skjermkortet avslått.' },
        { label: 'Spilling', value: `ca. ${String(c.hoursGaming).replace('.', ',')} timer` },
        { label: 'Lader', value: `${c.charger} W`, hint: 'Laderen må levere mer enn maskinen bruker under spilling. Ellers tappes batteriet selv med laderen i.' },
      ]
    case 'info':
      return c.rows.map(([label, value, hint]) => ({ label, value, hint }))
  }
}

/** To–tre korte stikkord til alternativlisten */
export function chips(c: Component): string[] {
  switch (c.kind) {
    case 'cpu':
      return [`${c.cores} kjerner`, `${c.boost.toLocaleString('nb-NO', { minimumFractionDigits: 1 })} GHz`, c.socket === 'BGA' ? c.arch : c.socket]
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
      return [c.type === 'aio' ? `${c.radiator} mm vann` : `${c.height} mm høy`, `ca. ${c.capacity} W`]
    case 'case':
      return [c.forms.includes('ATX') ? 'ATX' : 'Micro-ATX', `GPU ≤ ${c.gpuMax} mm`, `Kjøler ≤ ${c.coolerMax} mm`]
    case 'display':
      return [`${c.res[0]} × ${c.res[1]}`, `${c.hz} Hz`, c.panel]
    case 'battery':
      return [`${c.wh} Wh`]
    case 'info':
      return []
  }
}

export const kr = (v: number) => `${Math.round(v).toLocaleString('nb-NO')} kr`
export const signedKr = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(Math.round(v)).toLocaleString('nb-NO')} kr`

export const RES_LABEL: Record<number, string> = { 1080: '1080p', 1440: '1440p', 2160: '4K' }
export const PROFILE_LABEL: Record<string, string> = {
  esport: 'Esport',
  aaa: 'Store spill',
  rt: 'Ray tracing',
}
export const PROFILE_HINT: Record<string, string> = {
  esport: 'Lette, raske spill som CS2 og Valorant. Her er det prosessoren som bestemmer.',
  aaa: 'Tunge storspill på høyeste innstillinger, uten ray tracing.',
  rt: 'Tunge storspill med ray tracing på. Det mest krevende du kan be skjermkortet om.',
}
