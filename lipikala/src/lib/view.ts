import { buildCells } from './cells'
import { LANGS } from './data'
import { escapeHtml } from './escapeHtml'
import { SCRIPT_LABEL } from './scripts'
import { derive, SURF, type AppState } from './state'

function surfaceLabel(s: 'stone' | 'copper' | 'palm'): string {
  return s === 'stone' ? 'Stone' : s === 'copper' ? 'Copper plate' : 'Palm leaf'
}

function langButtonsHtml(state: AppState): string {
  return LANGS.map((l) => {
    const active = l.id === state.lang
    return `<button type="button" class="btn" data-action="lang" data-lang-id="${l.id}" style="border-color:${active ? 'var(--color-accent)' : 'var(--color-divider)'};color:${active ? 'var(--color-accent)' : 'var(--color-text)'}">${escapeHtml(l.name)}</button>`
  }).join('')
}

/**
 * Renders the app's full inner markup for the given state. Called on every
 * state change; main.ts diffs nothing and just replaces innerHTML, so any
 * text derived from user input (the typed name, its rendered glyphs) is
 * escaped here — this is also reachable via a shared #t=... URL, so it's a
 * real injection surface, not just a defensive habit.
 *
 * Every sub-section is built into its own named `const` before the return
 * statement, rather than calling functions inline inside the big template
 * literal's `${...}` slots. That's not a style preference: a function call
 * (like `langButtonsHtml(state)`) placed directly inside an interpolation
 * of this outer literal silently produces an empty render in at least one
 * sandboxed embedding of this script, while the identical string built one
 * line earlier and referenced by name renders correctly. Keep this pattern
 * for any future sub-template added here.
 */
export function template(state: AppState): string {
  const { lang, eras, era, S, M, toks, surf, out } = derive(state)
  const cells = buildCells(toks, S, M)
  const style = SURF[surf]
  const inkBlend = surf === 'stone' ? 'screen' : surf === 'copper' ? 'multiply' : 'darken'
  const isPalm = surf === 'palm'

  const nameValue = escapeHtml(state.text)
  const langButtons = langButtonsHtml(state)

  const eraButtons = eras
    .map((e, i) => {
      const active = e === era
      return `
        <button type="button" data-action="era" data-era-idx="${i}" style="all:unset;cursor:pointer;display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding-right:12px">
          <span style="width:15px;height:15px;border-radius:50%;border:1.5px solid var(--color-accent);background:${active ? 'var(--color-accent)' : 'var(--color-bg)'};box-shadow:0 0 0 4px var(--color-bg)"></span>
          <span style="font-family:var(--font-heading);font-size:22px;font-weight:600;line-height:1.1;color:${active ? 'var(--color-accent)' : 'var(--color-text)'}">${escapeHtml(e.name)}</span>
          <span style="font-size:12px;font-variant-numeric:tabular-nums;color:var(--color-neutral-600)">${escapeHtml(e.years)}</span>
          <span class="tag ${e.kind === 'authentic' ? 'tag-accent' : 'tag-neutral'}">${e.kind === 'authentic' ? 'Authentic script' : 'Approximation'}</span>
        </button>`
    })
    .join('')

  const eraName = escapeHtml(era.name)
  const eraYears = escapeHtml(era.years)
  const langName = escapeHtml(lang.name)
  const scriptLabel = escapeHtml(SCRIPT_LABEL[era.script])

  const surfaceOptions = (['stone', 'copper', 'palm'] as const)
    .map((k) => `<label class="seg-opt"><input type="radio" name="surface" data-action="surface" value="${k}" ${surf === k ? 'checked' : ''}>${surfaceLabel(k)}</label>`)
    .join('')

  const shareLabel = escapeHtml(state.shareLabel)

  const palmPegs = isPalm
    ? `<span style="position:absolute;left:26px;top:50%;width:9px;height:9px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#3a2a12,#1c130a);box-shadow:0 0 0 2px rgba(0,0,0,.15) inset;transform:translateY(-50%)"></span>
      <span style="position:absolute;right:26px;top:50%;width:9px;height:9px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#3a2a12,#1c130a);box-shadow:0 0 0 2px rgba(0,0,0,.15) inset;transform:translateY(-50%)"></span>`
    : ''

  const plateFontFamily = escapeHtml(`"${S.font}"`)
  const plateOutput = out.trim() ? escapeHtml(out) : '·'
  const eraApprox = escapeHtml(era.approx)

  const cellsSection =
    cells.length > 0
      ? `
  <div class="hr" style="margin:36px 0 22px"></div>
  <h6 style="color:var(--color-neutral-600);margin-bottom:16px">Letter by letter · then, now, and in roman</h6>
  <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:stretch">
    ${cells
      .map(
        (c) => `
    <div style="border:${c.border};border-radius:var(--radius-md);padding:10px 14px;min-width:${c.minw};text-align:center;display:flex;flex-direction:column;gap:4px;justify-content:center">
      <span style="font-family:${escapeHtml(c.font ?? 'inherit')};font-size:36px;line-height:1.3">${escapeHtml(c.hist)}</span>
      <span style="font-family:${escapeHtml(c.modFont ?? 'inherit')};font-size:18px;line-height:1.4;color:var(--color-neutral-700)">${escapeHtml(c.modern)}</span>
      <span style="font-size:11px;color:var(--color-accent-700);letter-spacing:.04em">${escapeHtml(c.roman)}</span>
    </div>`,
      )
      .join('')}
  </div>`
      : ''

  const eraNote = escapeHtml(era.note)

  return /* html */ `
  <nav class="nav" style="padding-inline:0">
    <span class="nav-brand">Lipikāla</span>
    <a href="#notes">About the scripts</a>
  </nav>

  <header style="padding:48px 0 28px;max-width:62ch">
    <h6 style="color:var(--color-accent);margin-bottom:12px">Historic script converter</h6>
    <h1 style="font-size:52px;font-weight:400;margin-bottom:14px">Your name, as it was written a thousand years ago.</h1>
    <p style="text-align:justify;font-size:16px;color:var(--color-neutral-700);margin:0">Type a name in any Indian script or in roman letters, choose a language, and pick a point on its timeline. The letters are re-set in the script of that age — Brahmi, Grantha, Siddhaṃ and others — and shown as they might have appeared cut in stone, on a copper plate or a palm leaf.</p>
  </header>

  <div style="display:grid;grid-template-columns:minmax(0,1fr);gap:22px">
    <div class="field">
      <label for="name-input">Name or text — any Indian script, or roman letters (double a vowel for a long one: aa, ee, oo)</label>
      <input id="name-input" class="input" style="font-size:24px;min-height:56px;padding:8px 14px" value="${nameValue}" placeholder="e.g. Kaveri · காவேரி · ಕಾವேரி" autocomplete="off" spellcheck="false">
    </div>
    <div class="field">
      <label>Language</label>
      <div style="display:flex;flex-wrap:wrap;gap:8px">${langButtons}</div>
    </div>
  </div>

  <div class="hr" style="margin:36px 0 22px"></div>
  <h6 style="color:var(--color-neutral-600)">Timeline · pick an age</h6>
  <div style="position:relative;margin-top:18px">
    <div style="position:absolute;left:0;right:0;top:7px;height:1px;background:var(--color-divider)"></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:16px">
      ${eraButtons}
    </div>
  </div>

  <div style="margin-top:40px;display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:12px">
    <div style="display:flex;flex-direction:column;gap:6px">
      <h2 style="font-size:34px;font-weight:400;margin:0">${eraName}</h2>
      <span style="font-size:13px;color:var(--color-neutral-600);font-variant-numeric:tabular-nums">${eraYears} · ${langName} · ${scriptLabel}</span>
    </div>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
      <div class="seg">
        ${surfaceOptions}
      </div>
      <button type="button" class="btn btn-primary" data-action="download">Download image</button>
      <button type="button" class="btn btn-secondary" data-action="share">${shareLabel}</button>
    </div>
  </div>

  <div class="plate" style="filter:none;margin-top:16px;border-radius:2px;background:${style.wrapBg}">
    <div style="position:relative;min-height:320px;display:grid;place-items:center;padding:56px 32px;text-align:center;background:${style.bg};box-shadow:inset 0 0 60px rgba(0,0,0,.4)">
      ${palmPegs}
      <div style="font-family:${plateFontFamily};font-size:96px;line-height:1.45;color:${style.ink};opacity:${style.inkOpacity};mix-blend-mode:${inkBlend};text-shadow:${style.shadow};overflow-wrap:anywhere;max-width:100%;position:relative">${plateOutput}</div>
    </div>
  </div>
  <p style="font-size:12px;color:var(--color-neutral-600);margin-top:10px;text-align:justify">${eraApprox}</p>

  ${cellsSection}

  <div id="notes" class="hr" style="margin:40px 0 22px"></div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:32px">
    <div>
      <h6 style="color:var(--color-accent);margin-bottom:8px">${eraYears}</h6>
      <h3 style="font-weight:400;font-size:30px">${eraName}</h3>
      <p style="text-align:justify;font-size:15px;line-height:1.65;margin:0">${eraNote}</p>
    </div>
    <div>
      <h6 style="color:var(--color-neutral-600);margin-bottom:8px">How faithful is this?</h6>
      <p style="text-align:justify;font-size:14px;line-height:1.65;color:var(--color-neutral-700)">Where a historic script has been digitally encoded — Brahmi, Grantha, Siddhaṃ, Śāradā, Bhaiksuki, Nandinagari — your text is set in that script letter for letter, marked <em>authentic</em>. Where it has not (Vatteluttu, Kadamba, the early Telugu–Kannada hand), the closest living relative stands in, marked <em>approximation</em>. Sounds an older script lacked are replaced by their nearest letter, as scribes of the time did.</p>
      <p style="text-align:justify;font-size:14px;line-height:1.65;color:var(--color-neutral-700);margin:0">Spellings follow the script, not the pronunciation: a name typed as <em>Ram</em> ends in a silent-vowel mark; type <em>Rama</em> for the classical form.</p>
    </div>
  </div>
  `
}
