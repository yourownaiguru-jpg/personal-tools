import './style.css'
import { derive, initStateFromHash, shareUrl, type AppState } from './lib/state'
import { renderDownloadImage, triggerDownload } from './lib/downloadImage'
import { template } from './lib/view'

const root = document.getElementById('app')
if (!root) throw new Error('#app root element missing')

let state: AppState = initStateFromHash(location.hash)
let shareLabelTimer: ReturnType<typeof setTimeout> | undefined

function setState(patch: Partial<AppState>): void {
  state = { ...state, ...patch }
  rerender()
}

function rerender(): void {
  const input = document.getElementById('name-input') as HTMLInputElement | null
  const wasFocused = document.activeElement === input
  const selStart = input?.selectionStart ?? null
  const selEnd = input?.selectionEnd ?? null

  root!.innerHTML = template(state)

  if (wasFocused) {
    const next = document.getElementById('name-input') as HTMLInputElement | null
    next?.focus()
    if (next && selStart !== null && selEnd !== null) next.setSelectionRange(selStart, selEnd)
  }
}

async function handleDownload(): Promise<void> {
  const { era, lang, S, out, surf } = derive(state)
  if (!out.trim()) return
  const blob = await renderDownloadImage({ out, era, lang, fontFamily: S.font, surf })
  const safeName = (state.text || 'text').replace(/[^\p{L}\p{N}]+/gu, '-')
  triggerDownload(blob, `${safeName}-${era.id}.png`)
}

function handleShare(): void {
  const { era, surf } = derive(state)
  const url = shareUrl(state, era, surf)
  history.replaceState(null, '', url.slice(url.indexOf('#')))

  const done = () => {
    clearTimeout(shareLabelTimer)
    setState({ shareLabel: 'Link copied' })
    shareLabelTimer = setTimeout(() => setState({ shareLabel: 'Copy link' }), 2000)
  }
  if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, done)
  else done()
}

root.addEventListener('input', (e) => {
  const target = e.target as HTMLElement
  if (target.id === 'name-input') setState({ text: (target as HTMLInputElement).value })
})

root.addEventListener('change', (e) => {
  const target = e.target as HTMLElement
  if (target instanceof HTMLInputElement && target.dataset.action === 'surface') {
    setState({ surf: target.value as AppState['surf'] })
  }
})

root.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-action]')
  if (!el) return
  const action = el.dataset.action
  if (action === 'lang') {
    setState({ lang: el.dataset.langId as AppState['lang'], eraIdx: 0 })
  } else if (action === 'era') {
    setState({ eraIdx: Number(el.dataset.eraIdx) })
  } else if (action === 'download') {
    void handleDownload()
  } else if (action === 'share') {
    handleShare()
  }
})

window.addEventListener('hashchange', () => {
  state = initStateFromHash(location.hash)
  rerender()
})

rerender()
