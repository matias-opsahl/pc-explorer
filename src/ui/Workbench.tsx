import { useEffect, useRef, useState } from 'react'
import { PROFILE_LABEL, RES_LABEL, kr, signedKr, slotText } from '../data/texts'
import { component, slotLevel } from '../logic/evaluate'
import { RGB_CHOICES, useBuild, useDevice, useEvaluation, useGoal, useStore } from '../store'
import { Inspector } from './Inspector'
import { Summary } from './Summary'
import { LevelIcon, SlotIcon } from './icons'

/** Viser forskjellen en kort stund etter at et tall har endret seg */
function useDelta(value: number, key: string) {
  const prev = useRef({ value, key })
  const [delta, setDelta] = useState(0)
  useEffect(() => {
    const p = prev.current
    prev.current = { value, key }
    if (p.key !== key || p.value === value) return
    setDelta(value - p.value)
    const t = setTimeout(() => setDelta(0), 2600)
    return () => clearTimeout(t)
  }, [value, key])
  return delta
}

function TopBar() {
  const device = useDevice()
  const s = useStore()
  const toggle = (key: 'exploded' | 'glass' | 'spin', label: string) => (
    <button className="toggle" aria-pressed={s[key]} onClick={() => s.toggle(key)}>
      {label}
    </button>
  )
  return (
    <header className="panel topbar" data-inset="top">
      <button className="ghost back" onClick={s.back}>
        Bytt maskin
      </button>
      <div className="title">
        <strong>{device.name}</strong>
        <span>{device.tagline}</span>
      </div>
      <div className="tools">
        {toggle('exploded', 'Sprengskisse')}
        {device.kind === 'desktop' && toggle('glass', 'Sidepanel')}
        {toggle('spin', 'Roter')}
        <div className="swatches" role="radiogroup" aria-label="Lysfarge">
          {RGB_CHOICES.map((c) => (
            <button key={c} role="radio" aria-checked={s.rgb === c} aria-label={`Lysfarge ${c}`} style={{ background: c }} onClick={() => s.setRgb(c)} />
          ))}
        </div>
      </div>
    </header>
  )
}

function PartList() {
  const device = useDevice()
  const build = useBuild()
  const e = useEvaluation()
  const selected = useStore((s) => s.selected)
  const hovered = useStore((s) => s.hovered)
  const select = useStore((s) => s.select)
  const hover = useStore((s) => s.hover)
  return (
    <nav className="panel bom" data-inset="auto" aria-label="Deler">
      <button className="row whole" aria-pressed={!selected} onClick={() => select(null)}>
        <span className="rtext">
          <span className="rlabel">Hele maskinen</span>
          <span className="rname">Ytelse, pris og varsler</span>
        </span>
      </button>
      {device.slots.map((slot) => {
        const level = slotLevel(e.issues, slot)
        return (
          <button
            key={slot}
            className="row"
            aria-pressed={selected === slot}
            data-hover={hovered === slot}
            onClick={() => select(selected === slot ? null : slot)}
            onPointerEnter={() => hover(slot)}
            onPointerLeave={() => hover(null)}
          >
            <SlotIcon slot={slot} />
            <span className="rtext">
              <span className="rlabel">{slotText(device.kind, slot).label}</span>
              <span className="rname">{component(build, slot)?.short}</span>
            </span>
            {level && <LevelIcon level={level} />}
          </button>
        )
      })}
    </nav>
  )
}

function Readout() {
  const device = useDevice()
  const goal = useGoal()
  const e = useEvaluation()
  const select = useStore((s) => s.select)
  const key = `${device.id}|${JSON.stringify(goal)}`
  const dPrice = useDelta(e.price, key)
  const dFps = useDelta(e.perf.fps, key)
  const errors = e.issues.filter((i) => i.level === 'error').length
  const warnings = e.issues.filter((i) => i.level === 'warning').length
  const level = errors ? 'error' : warnings ? 'warning' : 'ok'
  const batt = e.parts.battery
  return (
    <footer className="panel readout" data-inset="bottom">
      <div className="cell">
        <span className="k">Pris</span>
        <span className="v">{kr(e.price)}</span>
        {dPrice !== 0 && <span className={`delta ${dPrice > 0 ? 'bad' : 'good'}`}>{signedKr(dPrice)}</span>}
      </div>
      <div className="cell" data-meets={e.perf.fps >= goal.target}>
        <span className="k">
          {PROFILE_LABEL[goal.profile]}, {RES_LABEL[goal.res]}
        </span>
        <span className="v">
          {e.perf.fps} <small>FPS</small>
        </span>
        {dFps !== 0 ? (
          <span className={`delta ${dFps > 0 ? 'good' : 'bad'}`}>
            {dFps > 0 ? '+' : '−'}
            {Math.abs(dFps)}
          </span>
        ) : (
          <span className="sub">mål {goal.target}</span>
        )}
      </div>
      {device.kind === 'desktop' ? (
        <div className="cell">
          <span className="k">Strøm under spilling</span>
          <span className="v">
            {e.power.gaming} <small>W</small>
          </span>
          <span className="sub">av {e.power.psu} W</span>
        </div>
      ) : (
        batt && (
          <div className="cell">
            <span className="k">Batteri, lett bruk</span>
            <span className="v">
              {String(batt.hoursLight).replace('.', ',')} <small>timer</small>
            </span>
          </div>
        )
      )}
      <button className={`cell status status-${level}`} onClick={() => select(null)}>
        <LevelIcon level={level} />
        <span>
          {errors
            ? `${errors} ${errors === 1 ? 'del passer' : 'deler passer'} ikke`
            : warnings
              ? `${warnings} ${warnings === 1 ? 'varsel' : 'varsler'}`
              : 'Alt passer sammen'}
        </span>
      </button>
    </footer>
  )
}

function Toasts() {
  const toasts = useStore((s) => s.toasts)
  const dismiss = useStore((s) => s.dismiss)
  const select = useStore((s) => s.select)
  // Hvert varsel får sin egen nedtelling, så flere samtidige ikke blir stående i kø
  const timers = useRef(new Map<number, number>())
  useEffect(() => {
    for (const t of toasts) {
      if (timers.current.has(t.key)) continue
      timers.current.set(
        t.key,
        window.setTimeout(() => {
          timers.current.delete(t.key)
          dismiss(t.key)
        }, 6500),
      )
    }
  }, [toasts, dismiss])
  useEffect(() => {
    const all = timers.current
    return () => all.forEach((id) => clearTimeout(id))
  }, [])
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <button
          key={t.key}
          className={`toast toast-${t.issue.level}`}
          onClick={() => {
            select(t.issue.slots[0])
            dismiss(t.key)
          }}
        >
          <LevelIcon level={t.issue.level} />
          <span>
            <strong>{t.issue.title}</strong>
            <span>{t.issue.detail}</span>
          </span>
        </button>
      ))}
    </div>
  )
}

export function Workbench() {
  const selected = useStore((s) => s.selected)
  const sheet = useRef<HTMLElement>(null)
  useEffect(() => {
    sheet.current?.scrollTo({ top: 0 })
  }, [selected])
  return (
    <>
      <TopBar />
      <PartList />
      <aside className="panel sheet" data-inset="auto" ref={sheet}>
        {selected ? <Inspector slot={selected} /> : <Summary />}
      </aside>
      <Readout />
      <Toasts />
      <p className="hint">Dra for å snu maskinen. Rull for å zoome. Klikk på en del for å åpne den.</p>
    </>
  )
}

/** Navnelapp som følger pekeren over 3D-modellen */
export function HoverTip() {
  const device = useDevice()
  const build = useBuild()
  const hovered = useStore((s) => s.hovered)
  const selected = useStore((s) => s.selected)
  const ref = useRef<HTMLDivElement>(null)
  const [onCanvas, setOnCanvas] = useState(false)
  useEffect(() => {
    const move = (ev: PointerEvent) => {
      const over = ev.target instanceof HTMLCanvasElement
      setOnCanvas(over)
      if (ref.current) ref.current.style.transform = `translate(${ev.clientX + 16}px, ${ev.clientY + 18}px)`
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])
  const show = !!hovered && onCanvas
  useEffect(() => {
    document.body.style.cursor = show ? 'pointer' : ''
  }, [show])
  return (
    <div ref={ref} className="tip" data-show={show}>
      {hovered && (
        <>
          <strong>{slotText(device.kind, hovered).label}</strong>
          <span>{component(build, hovered)?.short}</span>
          {hovered !== selected && <em>Klikk for å åpne</em>}
        </>
      )}
    </div>
  )
}
