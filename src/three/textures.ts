import * as THREE from 'three'

export const FONT = '"Saira Condensed", "Arial Narrow", sans-serif'

const cache = new Map<string, THREE.CanvasTexture>()

/** Tegner en tekstur én gang og gjenbruker den */
export function canvasTexture(
  key: string,
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  srgb = true,
): THREE.CanvasTexture {
  const hit = cache.get(key)
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d')!, w, h)
  const t = new THREE.CanvasTexture(c)
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  cache.set(key, t)
  return t
}

function rng(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Hullmønster til mesh-paneler. Brukes som alphaMap. */
export function perforated(repX: number, repY: number): THREE.CanvasTexture {
  const rx = Math.max(1, Math.round(repX))
  const ry = Math.max(1, Math.round(repY))
  const key = `perf:${rx}:${ry}`
  const hit = cache.get(key)
  if (hit) return hit
  const base = canvasTexture(
    'perf-base',
    64,
    111,
    (ctx, w, h) => {
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#000'
      const r = 21
      for (const [x, y] of [[0, 0], [w, 0], [0, h], [w, h], [w / 2, h / 2]]) {
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }
    },
    false,
  )
  const t = base.clone()
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(rx, ry)
  t.needsUpdate = true
  cache.set(key, t)
  return t
}

/** Kretskort med ledningsbaner */
export function pcbTexture(kind: 'black' | 'green'): THREE.CanvasTexture {
  const base = kind === 'black' ? '#14161a' : '#0f3b2c'
  const trace = kind === 'black' ? '#1f2329' : '#17523d'
  const pad = kind === 'black' ? '#6f6a55' : '#b9a55e'
  return canvasTexture(`pcb:${kind}`, 1024, 1024, (ctx, w, h) => {
    const rand = rng(kind === 'black' ? 7 : 19)
    ctx.fillStyle = base
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = trace
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (let i = 0; i < 260; i++) {
      let x = rand() * w
      let y = rand() * h
      ctx.lineWidth = rand() < 0.2 ? 5 : 2.2
      ctx.beginPath()
      ctx.moveTo(x, y)
      const segs = 2 + Math.floor(rand() * 4)
      let horiz = rand() < 0.5
      for (let s = 0; s < segs; s++) {
        const len = 30 + rand() * 170
        const dir = rand() < 0.5 ? -1 : 1
        if (rand() < 0.3) {
          x += len * 0.35 * dir
          y += len * 0.35 * (rand() < 0.5 ? -1 : 1)
        } else if (horiz) x += len * dir
        else y += len * dir
        horiz = !horiz
        ctx.lineTo(x, y)
      }
      ctx.stroke()
      if (rand() < 0.6) {
        ctx.fillStyle = pad
        ctx.beginPath()
        ctx.arc(x, y, 3.2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    // Små loddepunkter i rader
    ctx.fillStyle = pad
    for (let i = 0; i < 46; i++) {
      const x = rand() * w
      const y = rand() * h
      const n = 3 + Math.floor(rand() * 8)
      const vertical = rand() < 0.5
      for (let k = 0; k < n; k++) ctx.fillRect(x + (vertical ? 0 : k * 9), y + (vertical ? k * 9 : 0), 5, 5)
    }
  })
}

export interface TextLine {
  t: string
  size: number
  weight?: number
  color?: string
  /** 0–1 av høyden, midten av linjen */
  y: number
  x?: number
  align?: CanvasTextAlign
  spacing?: number
}

/** Tekst på gjennomsiktig bakgrunn, til merking av deler */
export function textTexture(w: number, h: number, lines: TextLine[], bg?: string): THREE.CanvasTexture {
  const key = `text:${w}:${h}:${bg ?? ''}:${JSON.stringify(lines)}`
  return canvasTexture(key, w, h, (ctx) => {
    if (bg) {
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)
    }
    for (const l of lines) {
      ctx.font = `${l.weight ?? 600} ${l.size}px ${FONT}`
      ctx.fillStyle = l.color ?? '#fff'
      ctx.textAlign = l.align ?? 'center'
      ctx.textBaseline = 'middle'
      if (l.spacing) (ctx as unknown as { letterSpacing: string }).letterSpacing = `${l.spacing}px`
      ctx.fillText(l.t, (l.x ?? 0.5) * w, l.y * h)
      if (l.spacing) (ctx as unknown as { letterSpacing: string }).letterSpacing = '0px'
    }
  })
}

/** Skjermbildet på en bærbar: et landskap med bildeteller */
export function screenTexture(fps: number, hz: number, aspect: number): THREE.CanvasTexture {
  const w = 1024
  const h = Math.round(w / aspect)
  return canvasTexture(`screen:${fps}:${hz}:${h}`, w, h, (ctx) => {
    const sky = ctx.createLinearGradient(0, 0, 0, h)
    sky.addColorStop(0, '#12233f')
    sky.addColorStop(0.45, '#3d5f8f')
    sky.addColorStop(0.62, '#f0a060')
    sky.addColorStop(0.63, '#27413f')
    sky.addColorStop(1, '#0c1a1a')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, w, h)
    // Sol
    ctx.fillStyle = '#ffe2a8'
    ctx.beginPath()
    ctx.arc(w * 0.68, h * 0.56, h * 0.07, 0, Math.PI * 2)
    ctx.fill()
    // Fjell
    const rand = rng(3)
    for (const [yy, col, amp] of [[0.56, '#2b456b', 0.2], [0.62, '#1b2f45', 0.14], [0.66, '#132227', 0.08]] as const) {
      ctx.fillStyle = col
      ctx.beginPath()
      ctx.moveTo(0, h)
      let y = h * yy
      for (let x = 0; x <= w; x += w / 24) {
        y = h * yy - rand() * h * amp
        ctx.lineTo(x, y)
      }
      ctx.lineTo(w, h)
      ctx.closePath()
      ctx.fill()
    }
    // Bildeteller
    ctx.fillStyle = 'rgba(8,14,16,.72)'
    ctx.fillRect(w * 0.03, h * 0.05, w * 0.2, h * 0.14)
    ctx.fillStyle = fps >= hz ? '#8ff0b5' : '#f0c048'
    ctx.font = `700 ${Math.round(h * 0.1)}px ${FONT}`
    ctx.textBaseline = 'middle'
    ctx.fillText(`${Math.min(fps, 999)}`, w * 0.045, h * 0.123)
    ctx.fillStyle = '#eef3ea'
    ctx.font = `600 ${Math.round(h * 0.045)}px ${FONT}`
    ctx.fillText('FPS', w * 0.165, h * 0.14)
    // Trådkors
    ctx.strokeStyle = 'rgba(255,255,255,.8)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(w / 2 - 14, h / 2)
    ctx.lineTo(w / 2 + 14, h / 2)
    ctx.moveTo(w / 2, h / 2 - 14)
    ctx.lineTo(w / 2, h / 2 + 14)
    ctx.stroke()
  })
}
