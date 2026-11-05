import type { Era, Lang, Surface } from './types'

// A tiny linear-congruential PRNG so the stone/copper speckle pattern is
// reproducible per render rather than importing a random-number dependency.
function makeRng(seed: number) {
  let r = seed
  return () => (r = (r * 16807) % 2147483647) / 2147483647
}

const SHADOW = {
  stone: 'rgba(0,0,0,.7)',
  copper: 'rgba(20,15,5,.5)',
  palm: 'rgba(50,35,10,.3)',
} satisfies Record<Surface, string>

const INK = {
  stone: { color: '#e9e2d2', opacity: 0.82, blend: 'screen' as GlobalCompositeOperation },
  copper: { color: '#241a0d', opacity: 0.88, blend: 'multiply' as GlobalCompositeOperation },
  palm: { color: '#2c2013', opacity: 0.85, blend: 'source-over' as GlobalCompositeOperation },
}

function paintBackground(x: CanvasRenderingContext2D, w: number, h: number, surf: Surface) {
  const rnd = makeRng(7)
  if (surf === 'stone') {
    const g = x.createRadialGradient(w * 0.3, h * 0.2, 50, w * 0.5, h * 0.5, w * 0.9)
    g.addColorStop(0, '#6b6862')
    g.addColorStop(0.45, '#504c46')
    g.addColorStop(0.75, '#3a3733')
    g.addColorStop(1, '#2c2a26')
    x.fillStyle = g
    x.fillRect(0, 0, w, h)
    for (let i = 0; i < 5; i++) {
      x.beginPath()
      x.arc(rnd() * w, rnd() * h, 18 + rnd() * 30, 0, Math.PI * 2)
      x.fillStyle = 'rgba(0,0,0,.4)'
      x.fill()
    }
    for (let i = 0; i < 14000; i++) {
      const px = rnd() * w
      const py = rnd() * h
      x.fillStyle = i % 2 ? 'rgba(255,245,230,.06)' : 'rgba(0,0,0,.15)'
      x.fillRect(px, py, 2, 2)
    }
  } else if (surf === 'copper') {
    const g = x.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, '#6f7a52')
    g.addColorStop(0.3, '#97835a')
    g.addColorStop(0.48, '#8b9468')
    g.addColorStop(0.65, '#6a6540')
    g.addColorStop(1, '#4f5c3e')
    x.fillStyle = g
    x.fillRect(0, 0, w, h)
    for (let i = 0; i < 4000; i++) {
      const px = rnd() * w
      const py = rnd() * h
      x.fillStyle = i % 2 ? 'rgba(180,200,150,.08)' : 'rgba(20,20,10,.18)'
      x.fillRect(px, py, 2, 2)
    }
    x.strokeStyle = 'rgba(0,0,0,.12)'
    for (let a = 0; a < 12; a++) {
      x.beginPath()
      x.moveTo(-100, a * 90 - 200)
      x.lineTo(w + 100, a * 90 + 100)
      x.stroke()
    }
  } else {
    const g = x.createLinearGradient(0, 0, w, 0)
    g.addColorStop(0, '#b99a5e')
    g.addColorStop(0.45, '#d4b978')
    g.addColorStop(0.7, '#cdae6d')
    g.addColorStop(1, '#a9884f')
    x.fillStyle = g
    x.fillRect(0, 0, w, h)
    x.fillStyle = 'rgba(90,65,25,.14)'
    for (let y = 0; y < h; y += 7) x.fillRect(0, y, w, 1)
    x.fillStyle = 'rgba(255,245,210,.1)'
    for (let y = 3; y < h; y += 14) x.fillRect(0, y, w, 1)
    x.fillStyle = '#1c130a'
    x.beginPath()
    x.arc(70, h / 2, 9, 0, Math.PI * 2)
    x.fill()
    x.beginPath()
    x.arc(w - 70, h / 2, 9, 0, Math.PI * 2)
    x.fill()
  }
}

/** Renders the plate as a downloadable PNG, fully client-side. */
export async function renderDownloadImage(opts: {
  out: string
  era: Era
  lang: Lang
  fontFamily: string
  surf: Surface
}): Promise<Blob> {
  const { out, era, lang, fontFamily, surf } = opts
  const W = 1600
  const H = 900
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const x = c.getContext('2d')
  if (!x) throw new Error('2D canvas context unavailable')

  paintBackground(x, W, H, surf)

  const font = `"${fontFamily}"`
  try {
    await document.fonts.load(`150px ${font}`)
    await document.fonts.load('40px "Cormorant Garamond"')
  } catch {
    // Font may already be loaded, or the FontFace API may be unavailable —
    // either way, fall back to whatever the browser has ready.
  }

  const words = out.split(/\s+/).filter(Boolean)
  let size = 150
  let lines: string[] = []
  const layout = () => {
    x.font = `${size}px ${font}`
    lines = []
    let cur = ''
    for (const w of words) {
      const t = cur ? cur + ' ' + w : w
      if (x.measureText(t).width > W - 240 && cur) {
        lines.push(cur)
        cur = w
      } else cur = t
    }
    if (cur) lines.push(cur)
    return lines.every((l) => x.measureText(l).width <= W - 240) && lines.length * size * 1.4 <= H - 260
  }
  while (!layout() && size > 40) size -= 10

  x.textAlign = 'center'
  x.textBaseline = 'middle'
  const ink = INK[surf]
  x.fillStyle = ink.color
  x.globalAlpha = ink.opacity
  x.globalCompositeOperation = ink.blend
  x.shadowColor = SHADOW[surf]
  x.shadowOffsetY = surf === 'stone' ? -1 : 2
  x.shadowBlur = 1
  const total = lines.length * size * 1.4
  const y0 = (H - 80) / 2 - total / 2 + size * 0.7
  lines.forEach((l, i) => x.fillText(l, W / 2, y0 + i * size * 1.4))

  x.shadowColor = 'transparent'
  x.globalAlpha = 1
  x.globalCompositeOperation = 'source-over'
  x.textAlign = 'left'
  x.textBaseline = 'alphabetic'
  x.fillStyle = surf === 'stone' ? 'rgba(235,225,210,.85)' : 'rgba(40,25,10,.8)'
  x.font = '600 34px "Cormorant Garamond", serif'
  x.fillText(`${era.name}  ·  ${era.years}  ·  ${lang.name}`, 80, H - 70)
  x.textAlign = 'right'
  x.font = '400 30px "Cormorant Garamond", serif'
  x.fillText('Lipikāla', W - 80, H - 70)

  return await new Promise<Blob>((resolve, reject) => {
    c.toBlob((b) => (b ? resolve(b) : reject(new Error('canvas toBlob failed'))))
  })
}

export function triggerDownload(blob: Blob, filename: string): void {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 4000)
}
