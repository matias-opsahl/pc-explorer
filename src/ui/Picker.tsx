import { useMemo } from 'react'
import { devices } from '../data/devices'
import { kr, slotText } from '../data/texts'
import type { Res, SlotId } from '../data/types'
import { component, evaluate } from '../logic/evaluate'
import { useBuild, useDevice, useStore } from '../store'
import { Logo } from './icons'

const KEY_SLOTS: Record<'desktop' | 'laptop', SlotId[]> = {
  desktop: ['cpu', 'gpu', 'ram', 'storage'],
  laptop: ['cpu', 'gpu', 'ram', 'display'],
}

export function Picker() {
  const builds = useStore((s) => s.builds)
  const pick = useStore((s) => s.pickDevice)
  const open = useStore((s) => s.open)
  const device = useDevice()
  const build = useBuild()

  const prices = useMemo(
    () => Object.fromEntries(devices.map((d) => [d.id, evaluate(d, builds[d.id], d.goal).price])),
    [builds],
  )
  // Samme målestokk for alle maskiner: tunge spill uten oppskalering
  const fps = useMemo(
    () => evaluate(device, build, { res: 1440, profile: 'aaa', target: 60, upscale: false }).byRes,
    [device, build],
  )
  const changed = JSON.stringify(build) !== JSON.stringify(device.build)

  const group = (kind: 'desktop' | 'laptop', title: string) => (
    <section>
      <h2>{title}</h2>
      <ul>
        {devices
          .filter((d) => d.kind === kind)
          .map((d) => (
            <li key={d.id}>
              <button className="device" aria-pressed={d.id === device.id} onClick={() => pick(d.id)} onDoubleClick={open}>
                <span className="name">{d.name}</span>
                <span className="tag">{d.tagline}</span>
                <span className="price">{kr(prices[d.id])}</span>
              </button>
            </li>
          ))}
      </ul>
    </section>
  )

  return (
    <>
      <nav className="panel picker" data-inset="auto" aria-label="Velg maskin">
        <header className="brand">
          <Logo />
          <h1>Maskinrommet</h1>
          <p>Åpne en PC, se hva hver del gjør, og bytt deler til bygget passer deg.</p>
        </header>
        {group('desktop', 'Stasjonære')}
        {group('laptop', 'Bærbare')}
        <p className="fineprint">
          Prisene er omtrentlige norske butikkpriser fra november 2026. Bildefrekvens er anslag til sammenligning, ikke målinger.
        </p>
      </nav>

      <aside className="panel dossier" data-inset="auto" key={device.id}>
        <h2>{device.name}</h2>
        <p className="lede">{device.description}</p>
        <dl className="keyparts">
          {KEY_SLOTS[device.kind].map((slot) => (
            <div key={slot}>
              <dt>{slotText(device.kind, slot).label}</dt>
              <dd>{component(build, slot)?.short}</dd>
            </div>
          ))}
        </dl>
        <h3>Bildefrekvens i tunge spill</h3>
        <div className="resbars">
          {([1080, 1440, 2160] as Res[]).map((r) => (
            <div key={r} className="resbar">
              <span className="k">{r === 2160 ? '4K' : `${r}p`}</span>
              <span className="track">
                <span className="fill" style={{ width: `${Math.min(100, (fps[r] / 200) * 100)}%` }} />
              </span>
              <span className="v">{fps[r]}</span>
            </div>
          ))}
        </div>
        <div className="total">
          <span>{changed ? 'Pris med dine endringer' : 'Pris slik den står'}</span>
          <strong>{kr(prices[device.id])}</strong>
        </div>
        <button className="cta" onClick={open}>
          Åpne maskinen
        </button>
      </aside>
    </>
  )
}
