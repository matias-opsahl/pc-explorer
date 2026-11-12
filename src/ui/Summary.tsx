import { useMemo } from 'react'
import { PROFILE_HINT, PROFILE_LABEL, RES_LABEL, kr, signedKr, slotText } from '../data/texts'
import type { Profile, Res } from '../data/types'
import { suggest } from '../logic/evaluate'
import { useBuild, useDevice, useEvaluation, useGoal, useStore } from '../store'
import { IssueCard } from './Inspector'

function Seg<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: [T, string][]
  onChange: (v: T) => void
}) {
  return (
    <div className="seg" role="radiogroup" aria-label={label}>
      <span className="seglabel">{label}</span>
      <div className="segbtns">
        {options.map(([v, text]) => (
          <button key={String(v)} role="radio" aria-checked={v === value} onClick={() => onChange(v)}>
            {text}
          </button>
        ))}
      </div>
    </div>
  )
}

const LIMIT_TEXT = {
  gpu: 'The graphics card is the bottleneck. That is how it should be – then you get to use everything you paid for.',
  cpu: 'The processor is the bottleneck. The graphics card waits for it and cannot show what it can do.',
  balanced: 'The processor and graphics card are about equally loaded.',
}

export function Summary() {
  const device = useDevice()
  const build = useBuild()
  const goal = useGoal()
  const e = useEvaluation()
  const setGoal = useStore((s) => s.setGoal)
  const swap = useStore((s) => s.swap)
  const select = useStore((s) => s.select)
  const reset = useStore((s) => s.reset)

  const tips = useMemo(() => suggest(device, build, goal, e), [device, build, goal, e])
  const { fps, cpuCap, gpuFps, limiter } = e.perf
  const scale = Math.max(cpuCap, gpuFps, goal.target) * 1.06
  const meets = fps >= goal.target
  const maxPart = Math.max(...e.breakdown.map((b) => b.price))
  const changed = JSON.stringify(build) !== JSON.stringify(device.build)
  const batt = e.parts.battery
  const missing = !e.parts.cpu || !e.parts.gpu

  return (
    <div className="summary">
      <h2>Whole machine</h2>

      <section className="goal">
        <h3>What do you want to play?</h3>
        <Seg<Profile>
          label="Game type"
          value={goal.profile}
          options={(['esport', 'aaa', 'rt'] as Profile[]).map((p) => [p, PROFILE_LABEL[p]])}
          onChange={(profile) => setGoal({ profile })}
        />
        <Seg<Res>
          label="Resolution"
          value={goal.res}
          options={([1080, 1440, 2160] as Res[]).map((r) => [r, RES_LABEL[r]])}
          onChange={(res) => setGoal({ res })}
        />
        <Seg<number>
          label="Target"
          value={goal.target}
          options={[60, 100, 144, 240].map((t) => [t, `${t} FPS`])}
          onChange={(target) => setGoal({ target })}
        />
        <label className="check">
          <input type="checkbox" checked={goal.upscale} onChange={(ev) => setGoal({ upscale: ev.target.checked })} />
          <span>
            Upscaling with <small>({e.parts.gpu?.upscaler}, quality mode)</small>
          </span>
        </label>
        <p className="aside">{PROFILE_HINT[goal.profile]}</p>
      </section>

      {missing && (
        <p className="emptynote">
          The machine needs at least a processor and a graphics card before it can run games. Pick parts in the list on the left.
        </p>
      )}

      <section className="fpsbox" data-meets={meets} data-missing={missing}>
        <div className="big">
          <span className="num">{fps}</span>
          <span className="unit">FPS</span>
          <span className="verdict">{missing ? 'Missing parts' : meets ? `Meets the target of ${goal.target}` : `${goal.target - fps} below the target of ${goal.target}`}</span>
        </div>
        <div className="limits">
          <div className="limit legendrow" aria-hidden>
            <span />
            <span className="goalrail">
              <span
                className="goaltag"
                style={{
                  left: `${(goal.target / scale) * 100}%`,
                  // Keep the label inside the track near the edges
                  transform: `translateX(${goal.target / scale > 0.75 ? -100 : goal.target / scale < 0.25 ? 0 : -50}%)`,
                }}
              >
                Your target · {goal.target}
              </span>
            </span>
            <span />
          </div>
          {(
            [
              ['Processor manages', cpuCap, limiter === 'cpu'],
              ['Graphics card manages', gpuFps, limiter === 'gpu'],
            ] as const
          ).map(([label, v, tight]) => (
            <div key={label} className="limit" data-tight={tight} data-meets={v >= goal.target}>
              <span className="k">
                {label}
                {tight && !missing && <em className="bottleneck">bottleneck</em>}
              </span>
              <span className="track">
                <span className="fill" style={{ width: `${(v / scale) * 100}%` }} />
                <span className="mark" style={{ left: `${(goal.target / scale) * 100}%` }} />
              </span>
              <span className="v">{v}</span>
            </div>
          ))}
        </div>
        <p className="legend">
          <span className="sw sw-spec" /> What the machine manages now
          <span className="sw sw-goal" /> What you asked for
        </p>
        {!missing && <p className="aside">{LIMIT_TEXT[limiter]}</p>}
        <div className="resrow">
          {([1080, 1440, 2160] as Res[]).map((r) => (
            <button key={r} aria-pressed={r === goal.res} data-meets={e.byRes[r] >= goal.target} onClick={() => setGoal({ res: r })}>
              <span>{RES_LABEL[r]}</span>
              <strong>{e.byRes[r]}</strong>
            </button>
          ))}
        </div>
      </section>

      {tips.length > 0 && (
        <section>
          <h3>Suggestions</h3>
          <ul className="tips">
            {tips.map((t) => {
              const what = slotText(device.kind, t.slot).label.toLowerCase()
              return (
                <li key={t.kind + t.to.id}>
                  <div>
                    <strong>
                      {t.kind === 'reach' ? `Cheapest way to ${goal.target} FPS` : t.kind === 'value' ? 'Most performance per NOK' : 'Same target for less'}
                    </strong>
                    <p>
                      {t.kind === 'save'
                        ? `${t.to.short} as ${what} holds ${t.fps} FPS and saves you ${kr(-t.dPrice)}.`
                        : `Swap ${what} for ${t.to.short}: ${t.fps} FPS for ${signedKr(t.dPrice)}.`}
                    </p>
                  </div>
                  <button className="small" onClick={() => swap(t.slot, t.to.id)}>
                    Swap
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section>
        <h3>Do the parts fit together?</h3>
        {e.issues.length === 0 ? (
          <p className="allgood">All the parts fit together.</p>
        ) : (
          <div className="issues">
            {e.issues.map((i) => (
              <IssueCard key={i.id} issue={i} onClick={() => select(i.slots[0])} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h3>{device.kind === 'desktop' ? 'Power' : 'Battery'}</h3>
        {device.kind === 'desktop' && e.power.psu === 0 ? (
          <p className="aside">No power supply yet. The parts so far draw up to {e.power.peak} W.</p>
        ) : device.kind === 'desktop' ? (
          <>
            <div className="power">
              <span className="track">
                <span className="fill" style={{ width: `${Math.min(100, (e.power.gaming / e.power.psu) * 100)}%` }} />
                <span className="mark" style={{ left: `${Math.min(100, (e.power.peak / e.power.psu) * 100)}%` }} />
              </span>
            </div>
            <p className="aside">
              Around {e.power.gaming} W while gaming and up to {e.power.peak} W at most. The power supply delivers {e.power.psu} W.
            </p>
          </>
        ) : (
          batt && (
            <p className="aside">
              {batt.wh} Wh lasts around {batt.hoursLight} hours of light use, or just over {Math.floor(batt.hoursGaming)} hour
              {Math.floor(batt.hoursGaming) === 1 ? '' : 's'} of gaming. The charger is {batt.charger} W.
            </p>
          )
        )}
      </section>

      <section>
        <h3>Where does the money go?</h3>
        <ul className="costs">
          {[...e.breakdown]
            .sort((a, b) => b.price - a.price)
            .map((b) => (
              <li key={b.slot}>
                <button disabled={b.slot === 'base'} onClick={() => b.slot !== 'base' && select(b.slot)}>
                  <span className="k">{b.label}</span>
                  <span className="track">
                    <span className="fill" style={{ width: `${(b.price / maxPart) * 100}%` }} />
                  </span>
                  <span className="v">{kr(b.price)}</span>
                </button>
              </li>
            ))}
        </ul>
        <div className="total">
          <span>Total</span>
          <strong>{kr(e.price)}</strong>
        </div>
        <p className="aside">That works out to {kr(e.price / Math.max(1, fps))} per frame per second.</p>
        {changed && (
          <button className="ghost" onClick={reset}>
            Reset to starting point
          </button>
        )}
      </section>
    </div>
  )
}
