import { useMemo } from 'react'
import { devices } from '../data/devices'
import { kr, slotText } from '../data/texts'
import type { Res, SlotId } from '../data/types'
import { component, evaluate } from '../logic/evaluate'
import { useBuild, useDevice, useStore } from '../store'
import { Logo, ThemeButton } from './icons'

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
  // Same scale for all machines: demanding games without upscaling
  const fps = useMemo(
    () => evaluate(device, build, { res: 1440, profile: 'aaa', target: 60, upscale: false }).byRes,
    [device, build],
  )
  const changed = JSON.stringify(build) !== JSON.stringify(device.build)
  // Both side panels are shown or hidden together
  const collapsed = !useStore((s) => s.showDossier)
  const togglePanels = useStore((s) => s.toggleDossier)

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
      {collapsed ? (
        <div className="panel pickertab">
          <button onClick={togglePanels} aria-label="Show panels">
            <span className="chev">›</span>
            <span>Machines</span>
          </button>
          <ThemeButton />
        </div>
      ) : (
      <nav className="panel picker" data-inset="auto" aria-label="Choose machine">
        <div className="corner">
          <ThemeButton />
          <button className="iconbtn" onClick={togglePanels} aria-label="Hide panels" title="Hide panels">
            ‹
          </button>
        </div>
        <header className="brand">
          <Logo />
          <h1>The Machine Room</h1>
          <p>Open a PC, see what each part does, and swap parts until the build suits you.</p>
        </header>
        {group('desktop', 'Desktops')}
        {group('laptop', 'Laptops')}
        <p className="fineprint">
          Prices are approximate Norwegian retail prices from November 2026. Frame rates are estimates for comparison, not measurements.
        </p>
      </nav>
      )}

      {!collapsed && (
      <aside className="panel dossier" data-inset="auto" key={device.id}>
        <button className="iconbtn dossierhide" onClick={togglePanels} aria-label="Hide panels" title="Hide panels">
          ›
        </button>
        <h2>{device.name}</h2>
        <p className="lede">{device.description}</p>
        <dl className="keyparts">
          {KEY_SLOTS[device.kind].map((slot) => (
            <div key={slot}>
              <dt>{slotText(device.kind, slot).label}</dt>
              <dd data-empty={!component(build, slot)}>{component(build, slot)?.short ?? 'Empty'}</dd>
            </div>
          ))}
        </dl>
        <h3>Frame rate in demanding games</h3>
        <div className="resbars">
          {([1080, 1440, 2160] as Res[]).map((r) => (
            <div key={r} className="resbar">
              <span className="k">{r === 2160 ? '4K' : `${r}p`}</span>
              <span className="track">
                <span className="fill" style={{ width: `${Math.min(100, (fps[r] / 200) * 100)}%` }} />
              </span>
              <span className="v">{fps[r] || '–'}</span>
            </div>
          ))}
        </div>
        <div className="total">
          <span>{changed ? 'Price with your changes' : 'Price as it stands'}</span>
          <strong>{kr(prices[device.id])}</strong>
        </div>
        <button className="cta" onClick={open}>
          Open machine
        </button>
      </aside>
      )}
    </>
  )
}
