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
  gpu: 'Skjermkortet er flaskehalsen. Det er slik det skal være – da får du brukt alt du har betalt for.',
  cpu: 'Prosessoren er flaskehalsen. Skjermkortet venter på den og får ikke vist hva det kan.',
  balanced: 'Prosessor og skjermkort er omtrent like hardt belastet.',
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

  return (
    <div className="summary">
      <h2>Hele maskinen</h2>

      <section className="goal">
        <h3>Hva vil du spille?</h3>
        <Seg<Profile>
          label="Spilltype"
          value={goal.profile}
          options={(['esport', 'aaa', 'rt'] as Profile[]).map((p) => [p, PROFILE_LABEL[p]])}
          onChange={(profile) => setGoal({ profile })}
        />
        <Seg<Res>
          label="Oppløsning"
          value={goal.res}
          options={([1080, 1440, 2160] as Res[]).map((r) => [r, RES_LABEL[r]])}
          onChange={(res) => setGoal({ res })}
        />
        <Seg<number>
          label="Mål"
          value={goal.target}
          options={[60, 100, 144, 240].map((t) => [t, `${t} FPS`])}
          onChange={(target) => setGoal({ target })}
        />
        <label className="check">
          <input type="checkbox" checked={goal.upscale} onChange={(ev) => setGoal({ upscale: ev.target.checked })} />
          <span>
            Oppskalering på <small>({e.parts.gpu?.upscaler}, kvalitetsmodus)</small>
          </span>
        </label>
        <p className="aside">{PROFILE_HINT[goal.profile]}</p>
      </section>

      <section className="fpsbox" data-meets={meets}>
        <div className="big">
          <span className="num">{fps}</span>
          <span className="unit">FPS</span>
          <span className="verdict">{meets ? `Når målet på ${goal.target}` : `${goal.target - fps} under målet på ${goal.target}`}</span>
        </div>
        <div className="limits">
          {(
            [
              ['Prosessoren rekker', cpuCap, limiter === 'cpu'],
              ['Skjermkortet klarer', gpuFps, limiter === 'gpu'],
            ] as const
          ).map(([label, v, tight]) => (
            <div key={label} className="limit" data-tight={tight}>
              <span className="k">{label}</span>
              <span className="track">
                <span className="fill" style={{ width: `${(v / scale) * 100}%` }} />
                <span className="mark" style={{ left: `${(goal.target / scale) * 100}%` }} />
              </span>
              <span className="v">{v}</span>
            </div>
          ))}
        </div>
        <p className="aside">{LIMIT_TEXT[limiter]}</p>
        <div className="resrow">
          {([1080, 1440, 2160] as Res[]).map((r) => (
            <button key={r} aria-pressed={r === goal.res} onClick={() => setGoal({ res: r })}>
              <span>{RES_LABEL[r]}</span>
              <strong>{e.byRes[r]}</strong>
            </button>
          ))}
        </div>
      </section>

      {tips.length > 0 && (
        <section>
          <h3>Forslag</h3>
          <ul className="tips">
            {tips.map((t) => {
              const what = slotText(device.kind, t.slot).label.toLowerCase()
              return (
                <li key={t.kind + t.to.id}>
                  <div>
                    <strong>
                      {t.kind === 'reach' ? `Billigste vei til ${goal.target} FPS` : t.kind === 'value' ? 'Mest ytelse per krone' : 'Samme mål for mindre'}
                    </strong>
                    <p>
                      {t.kind === 'save'
                        ? `${t.to.short} som ${what} holder ${t.fps} FPS og sparer deg ${kr(-t.dPrice)}.`
                        : `Bytt ${what} til ${t.to.short}: ${t.fps} FPS for ${signedKr(t.dPrice)}.`}
                    </p>
                  </div>
                  <button className="small" onClick={() => swap(t.slot, t.to.id)}>
                    Bytt
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section>
        <h3>Passer delene sammen?</h3>
        {e.issues.length === 0 ? (
          <p className="allgood">Alle delene passer sammen.</p>
        ) : (
          <div className="issues">
            {e.issues.map((i) => (
              <IssueCard key={i.id} issue={i} onClick={() => select(i.slots[0])} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h3>{device.kind === 'desktop' ? 'Strøm' : 'Batteri'}</h3>
        {device.kind === 'desktop' ? (
          <>
            <div className="power">
              <span className="track">
                <span className="fill" style={{ width: `${Math.min(100, (e.power.gaming / e.power.psu) * 100)}%` }} />
                <span className="mark" style={{ left: `${Math.min(100, (e.power.peak / e.power.psu) * 100)}%` }} />
              </span>
            </div>
            <p className="aside">
              Rundt {e.power.gaming} W under spilling og opptil {e.power.peak} W på det meste. Strømforsyningen leverer {e.power.psu} W.
            </p>
          </>
        ) : (
          batt && (
            <p className="aside">
              {batt.wh} Wh holder til rundt {String(batt.hoursLight).replace('.', ',')} timer lett bruk, eller drøyt {Math.floor(batt.hoursGaming)} time
              spilling. Laderen er på {batt.charger} W.
            </p>
          )
        )}
      </section>

      <section>
        <h3>Hvor går pengene?</h3>
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
          <span>Totalt</span>
          <strong>{kr(e.price)}</strong>
        </div>
        <p className="aside">Det blir {kr(e.price / Math.max(1, fps))} per bilde i sekundet.</p>
        {changed && (
          <button className="ghost" onClick={reset}>
            Tilbakestill til utgangspunktet
          </button>
        )}
      </section>
    </div>
  )
}
