import { useMemo, useState } from 'react'
import { chips, kr, signedKr, slotText, specRows } from '../data/texts'
import type { Component, SlotId } from '../data/types'
import { component, evaluate, optionsFor, type Issue, type Level } from '../logic/evaluate'
import { useBuild, useDevice, useEvaluation, useGoal, useStore } from '../store'
import { LevelIcon, SlotIcon } from './icons'

export function IssueCard({ issue, onClick }: { issue: Issue; onClick?: () => void }) {
  const body = (
    <>
      <LevelIcon level={issue.level} />
      <div>
        <strong>{issue.title}</strong>
        <p>{issue.detail}</p>
      </div>
    </>
  )
  return onClick ? (
    <button className={`issue issue-${issue.level}`} onClick={onClick}>
      {body}
    </button>
  ) : (
    <div className={`issue issue-${issue.level}`}>{body}</div>
  )
}

function Specs({ c }: { c: Component }) {
  const rows = specRows(c)
  const [open, setOpen] = useState<string | null>(null)
  return (
    <dl className="specs">
      {rows.map((r) =>
        r.hint ? (
          <div key={r.label} className="spec" data-open={open === r.label}>
            <button onClick={() => setOpen(open === r.label ? null : r.label)} aria-expanded={open === r.label}>
              <dt>{r.label}</dt>
              <dd>{r.value}</dd>
            </button>
            {open === r.label && <p className="hint">{r.hint}</p>}
          </div>
        ) : (
          <div key={r.label} className="spec plain">
            <dt>{r.label}</dt>
            <dd>{r.value}</dd>
          </div>
        ),
      )}
    </dl>
  )
}

export function Inspector({ slot }: { slot: SlotId }) {
  const device = useDevice()
  const build = useBuild()
  const goal = useGoal()
  const now = useEvaluation()
  const swap = useStore((s) => s.swap)
  const select = useStore((s) => s.select)
  const c = component(build, slot)!
  const text = slotText(device.kind, slot)
  const mine = now.issues.filter((i) => i.slots.includes(slot))

  const options = useMemo(() => {
    return optionsFor(device, slot)
      .map((alt) => {
        const e = evaluate(device, { ...build, [slot]: alt.id }, goal)
        const hits = e.issues.filter((i) => i.slots.includes(slot) && i.level !== 'tip')
        const worst: Level | null = hits.some((i) => i.level === 'error') ? 'error' : hits.length ? 'warning' : null
        return { alt, dPrice: e.price - now.price, dFps: e.perf.fps - now.perf.fps, worst, why: hits[0]?.title }
      })
      .sort((a, b) => a.alt.price - b.alt.price)
  }, [device, build, goal, slot, now])

  const laptop = device.kind === 'laptop'
  const priceLine = laptop ? (c.price ? `${signedKr(c.price)} på grunnmodellen` : 'Følger med grunnmodellen') : c.price ? kr(c.price) : 'Følger med prosessoren'

  return (
    <div className="inspector" key={slot}>
      <div className="sheet-head">
        <span className="kind">
          <SlotIcon slot={slot} />
          {text.label}
        </span>
        <button className="ghost" onClick={() => select(null)}>
          Lukk
        </button>
      </div>
      <h2>{c.name}</h2>
      <p className="priceline">{priceLine}</p>

      {mine.map((i) => (
        <IssueCard key={i.id} issue={i} />
      ))}

      <p className="what">{text.what}</p>
      <p className="gaming">{text.gaming}</p>

      <h3>Spesifikasjoner</h3>
      <p className="aside">Trykk på en rad for forklaring.</p>
      <Specs c={c} />

      <h3>{laptop ? 'Velg en annen' : 'Bytt del'}</h3>
      {options.length > 1 ? (
        <>
          {device.fixed?.[slot] && <p className="aside">{device.fixed[slot]}</p>}
          <ul className="options">
            {options.map(({ alt, dPrice, dFps, worst, why }) => {
              const current = alt.id === c.id
              return (
                <li key={alt.id}>
                  <button className="option" aria-pressed={current} data-level={worst ?? 'ok'} onClick={() => !current && swap(slot, alt.id)}>
                    <span className="oname">{alt.short}</span>
                    <span className="oprice">{current ? 'Valgt' : signedKr(dPrice)}</span>
                    <span className="ochips">
                      {chips(alt).map((ch) => (
                        <span key={ch}>{ch}</span>
                      ))}
                    </span>
                    {!current && dFps !== 0 && (
                      <span className={`ofps ${dFps > 0 ? 'up' : 'down'}`}>
                        {dFps > 0 ? '+' : '−'}
                        {Math.abs(dFps)} FPS
                      </span>
                    )}
                    {worst && (
                      <span className={`owhy why-${worst}`}>
                        <LevelIcon level={worst} />
                        {why}
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      ) : (
        <p className="fixed">{device.fixed?.[slot] ?? 'Denne delen er bygget inn i maskinen og kan ikke byttes.'}</p>
      )}
    </div>
  )
}
