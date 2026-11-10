import { useMemo } from 'react'
import { create } from 'zustand'
import { deviceById, devices } from './data/devices'
import type { Build, DeviceDef, Goal, SlotId } from './data/types'
import { evaluate, type Evaluation, type Issue } from './logic/evaluate'

export type Mode = 'select' | 'inspect'

export interface Toast {
  key: number
  issue: Issue
}

interface State {
  mode: Mode
  deviceId: string
  builds: Record<string, Build>
  goals: Record<string, Goal>
  selected: SlotId | null
  hovered: SlotId | null
  exploded: boolean
  glass: boolean
  spin: boolean
  rgb: string
  toasts: Toast[]
  /** Teller som øker hver gang kameraet skal tilbake til utgangspunktet */
  homeTick: number

  pickDevice: (id: string) => void
  open: () => void
  back: () => void
  select: (slot: SlotId | null) => void
  hover: (slot: SlotId | null) => void
  swap: (slot: SlotId, id: string) => void
  reset: () => void
  setGoal: (g: Partial<Goal>) => void
  toggle: (key: 'exploded' | 'glass' | 'spin') => void
  setRgb: (c: string) => void
  dismiss: (key: number) => void
  home: () => void
}

let toastKey = 1

export const RGB_CHOICES = ['#54e0ff', '#ff4fa3', '#9cff57', '#ffb13d', '#f4f6ff']

export const useStore = create<State>((set, get) => ({
  mode: 'select',
  deviceId: 'mid',
  builds: Object.fromEntries(devices.map((d) => [d.id, { ...d.build }])),
  goals: Object.fromEntries(devices.map((d) => [d.id, { ...d.goal }])),
  selected: null,
  hovered: null,
  exploded: false,
  glass: true,
  spin: false,
  rgb: RGB_CHOICES[0],
  toasts: [],
  homeTick: 0,

  pickDevice: (id) => set({ deviceId: id, selected: null, hovered: null }),
  open: () => {
    const d = deviceById[get().deviceId]
    // En bærbar er lukket rundt innmaten, så den åpnes med en gang
    set({ mode: 'inspect', selected: null, hovered: null, exploded: d.kind === 'laptop', spin: false })
  },
  back: () => set({ mode: 'select', selected: null, hovered: null, exploded: false, toasts: [] }),
  select: (slot) => set({ selected: slot, hovered: null }),
  hover: (slot) => {
    if (get().hovered !== slot) set({ hovered: slot })
  },
  swap: (slot, id) => {
    const s = get()
    const device = deviceById[s.deviceId]
    const before = evaluate(device, s.builds[s.deviceId], s.goals[s.deviceId])
    const build = { ...s.builds[s.deviceId], [slot]: id }
    const after = evaluate(device, build, s.goals[s.deviceId])
    const known = new Set(before.issues.map((i) => i.id))
    const fresh = after.issues.filter((i) => i.level !== 'tip' && !known.has(i.id)).slice(0, 2)
    set({
      builds: { ...s.builds, [s.deviceId]: build },
      toasts: [...s.toasts.filter((t) => after.issues.some((i) => i.id === t.issue.id)), ...fresh.map((issue) => ({ key: toastKey++, issue }))].slice(-3),
    })
  },
  reset: () => {
    const s = get()
    const d = deviceById[s.deviceId]
    set({
      builds: { ...s.builds, [s.deviceId]: { ...d.build } },
      goals: { ...s.goals, [s.deviceId]: { ...d.goal } },
      toasts: [],
    })
  },
  setGoal: (g) => {
    const s = get()
    set({ goals: { ...s.goals, [s.deviceId]: { ...s.goals[s.deviceId], ...g } } })
  },
  toggle: (key) => set({ [key]: !get()[key] } as Partial<State>),
  setRgb: (c) => set({ rgb: c }),
  dismiss: (key) => set({ toasts: get().toasts.filter((t) => t.key !== key) }),
  home: () => set({ selected: null, homeTick: get().homeTick + 1 }),
}))

export function useDevice(): DeviceDef {
  return deviceById[useStore((s) => s.deviceId)]
}

export function useBuild(): Build {
  return useStore((s) => s.builds[s.deviceId])
}

export function useGoal(): Goal {
  return useStore((s) => s.goals[s.deviceId])
}

export function useEvaluation(): Evaluation {
  const device = useDevice()
  const build = useBuild()
  const goal = useGoal()
  return useMemo(() => evaluate(device, build, goal), [device, build, goal])
}
