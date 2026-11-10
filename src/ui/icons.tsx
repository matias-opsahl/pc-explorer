import type { ReactNode } from 'react'
import type { SlotId } from '../data/types'
import type { Level } from '../logic/evaluate'

const SLOT: Record<SlotId, ReactNode> = {
  cpu: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
      <rect x="9.5" y="9.5" width="5" height="5" />
      <path d="M9 3v3M12 3v3M15 3v3M9 18v3M12 18v3M15 18v3M3 9h3M3 12h3M3 15h3M18 9h3M18 12h3M18 15h3" />
    </>
  ),
  gpu: (
    <>
      <rect x="2.5" y="7" width="19" height="9" rx="1.5" />
      <circle cx="8" cy="11.5" r="2.6" />
      <circle cx="16" cy="11.5" r="2.6" />
      <path d="M5 16v3M9 16v2h6v-2" />
    </>
  ),
  ram: (
    <>
      <rect x="2.5" y="7.5" width="19" height="8" rx="1" />
      <path d="M6 10.5v2M9.5 10.5v2M13 10.5v2M16.5 10.5v2M5 15.5V18M19 15.5V18M11 15.5V18" />
    </>
  ),
  storage: (
    <>
      <rect x="2.5" y="8.5" width="19" height="7" rx="1" />
      <rect x="6" y="10.5" width="4" height="3" />
      <rect x="12" y="10.5" width="5" height="3" />
    </>
  ),
  motherboard: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" />
      <rect x="7" y="7" width="5.5" height="5.5" />
      <path d="M15.5 6.5v7M18 6.5v7M7 15.5h8M7 18h5" />
    </>
  ),
  cooler: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="1.8" />
      <path d="M12 10.2c0-3 1.5-4.6 3.6-5.2M13.6 12.9c2.6 1.5 3.3 3.6 2.8 5.7M10.4 12.9c-2.6 1.5-4.7 1-6.2-.6" />
    </>
  ),
  psu: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
      <circle cx="9.5" cy="12" r="3.6" />
      <path d="M16 9.5h2.5M16 12h2.5M16 14.5h2.5" />
    </>
  ),
  case: (
    <>
      <rect x="6" y="2.5" width="12" height="19" rx="1.5" />
      <path d="M9 6h6M9 9h6" />
      <circle cx="12" cy="16" r="2.2" />
    </>
  ),
  display: (
    <>
      <rect x="3" y="4.5" width="18" height="12" rx="1.5" />
      <path d="M2 19.5h20" />
    </>
  ),
  battery: (
    <>
      <rect x="2.5" y="7.5" width="17" height="9" rx="1.5" />
      <path d="M21.5 10.5v3M6 10.5v3M9.5 10.5v3M13 10.5v3" />
    </>
  ),
}

export function SlotIcon({ slot }: { slot: SlotId }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {SLOT[slot]}
    </svg>
  )
}

export function LevelIcon({ level }: { level: Level | 'ok' }) {
  const d = {
    ok: <path d="M4.5 10.5l3.5 3.5 7.5-8" />,
    error: <path d="M5 5l10 10M15 5L5 15" />,
    warning: (
      <>
        <path d="M10 3.2l7.6 13.3H2.4z" />
        <path d="M10 8.2v4M10 14.4v.2" />
      </>
    ),
    tip: (
      <>
        <circle cx="10" cy="10" r="7.2" />
        <path d="M10 9.2v4.6M10 6.2v.2" />
      </>
    ),
  }[level]
  return (
    <svg className={`lvl lvl-${level}`} viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {d}
    </svg>
  )
}

export function Logo() {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" fill="none" aria-hidden>
      <rect x="9" y="9" width="22" height="22" rx="2.5" stroke="var(--silk)" strokeWidth="2" />
      <rect x="15.5" y="15.5" width="9" height="9" fill="var(--pad)" />
      <path d="M14 4v5M20 4v5M26 4v5M14 31v5M20 31v5M26 31v5M4 14h5M4 20h5M4 26h5M31 14h5M31 20h5M31 26h5" stroke="var(--silk)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
