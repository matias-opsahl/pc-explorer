import { useEffect, useRef, useState } from 'react'
import { PROFILE_LABEL, RES_LABEL, kr, signedKr, slotText } from '../data/texts'
import { component, slotLevel } from '../logic/evaluate'
import { RGB_CHOICES, useBuild, useDevice, useEvaluation, useGoal, useStore } from '../store'
import { Inspector } from './Inspector'
import { Summary } from './Summary'
import { LevelIcon, SlotIcon, ThemeButton } from './icons'

/** Shows the difference for a short while after a number has changed */
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
        Change machine
      </button>
      <div className="title">
        <strong>{device.name}</strong>
        <span>{device.tagline}</span>
      </div>
      <div className="tools">
        {toggle('exploded', 'Exploded view')}
        {device.kind === 'desktop' && toggle('glass', 'Side panel')}
        {toggle('spin', 'Rotate')}
        <div className="swatches" role="radiogroup" aria-label="Light color">
          {RGB_CHOICES.map((c) => (
            <button key={c} role="radio" aria-checked={s.rgb === c} aria-label={`Light color ${c}`} style={{ background: c }} onClick={() => s.setRgb(c)} />
          ))}
        </div>
        <ThemeButton />
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
    <nav className="panel bom" data-inset="auto" aria-label="Parts">
      <button className="row whole" aria-pressed={!selected} onClick={() => select(null)}>
        <span className="rtext">
          <span className="rlabel">Whole machine</span>
          <span className="rname">Performance, price and warnings</span>
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
              <span className="rname" data-empty={!component(build, slot)}>{component(build, slot)?.short ?? 'Empty – choose a part'}</span>
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
  const build = useBuild()
  const goal = useGoal()
  const e = useEvaluation()
  const select = useStore((s) => s.select)
  const key = `${device.id}|${JSON.stringify(goal)}`
  const dPrice = useDelta(e.price, key)
  const dFps = useDelta(e.perf.fps, key)
  const errors = e.issues.filter((i) => i.level === 'error').length
  const warnings = e.issues.filter((i) => i.level === 'warning').length
  const empty = device.slots.filter((slot) => !build[slot]).length
  const level = errors ? 'error' : warnings || empty ? 'warning' : 'ok'
  const batt = e.parts.battery
  return (
    <footer className="panel readout" data-inset="bottom">
      <div className="cell">
        <span className="k">Price</span>
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
          <span className="sub">target {goal.target}</span>
        )}
      </div>
      {device.kind === 'desktop' ? (
        <div className="cell">
          <span className="k">Power while gaming</span>
          <span className="v">
            {e.power.gaming} <small>W</small>
          </span>
          <span className="sub">of {e.power.psu} W</span>
        </div>
      ) : (
        batt && (
          <div className="cell">
            <span className="k">Battery, light use</span>
            <span className="v">
              {batt.hoursLight} <small>hours</small>
            </span>
          </div>
        )
      )}
      <button className={`cell status status-${level}`} onClick={() => select(null)}>
        <LevelIcon level={level} />
        <span>
          {errors
            ? `${errors} ${errors === 1 ? 'part does not fit' : 'parts do not fit'}`
            : warnings
              ? `${warnings} ${warnings === 1 ? 'warning' : 'warnings'}`
              : empty
                ? `${empty} ${empty === 1 ? 'part' : 'parts'} still missing`
                : 'Everything fits together'}
        </span>
      </button>
    </footer>
  )
}

function Toasts() {
  const toasts = useStore((s) => s.toasts)
  const dismiss = useStore((s) => s.dismiss)
  const select = useStore((s) => s.select)
  // Each notification gets its own countdown, so several at once don't queue up
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
      <p className="hint">Drag to rotate the machine. Scroll to zoom. Click a part to open it.</p>
    </>
  )
}

/** Name label that follows the pointer over the 3D model */
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
          <span>{component(build, hovered)?.short ?? 'Empty'}</span>
          {hovered !== selected && <em>Click to open</em>}
        </>
      )}
    </div>
  )
}
