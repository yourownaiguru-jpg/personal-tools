import { useMemo, useState } from 'react'
import { DATES, GOALS, PROGRAMMES, STREAMS, type DateKind } from './data/programmes'
import { LEVEL_LABELS, filterProgrammes, isNational, kindOf, stateList, whereLabel } from './lib/filter'
import { EMPTY_FILTERS, type Filters, type Kind, type LevelKey, type Programme } from './lib/types'

const PAGE = 12
const UPDATED = '5 Nov 2026'

const PILL: Record<Kind, { label: string; css: React.CSSProperties }> = {
  open: { label: 'Open or rolling', css: { background: '#D6F0E4', color: '#0A5A3A' } },
  expected: { label: 'Expected', css: { background: '#DCE8FA', color: '#1F4A8A' } },
  none: { label: 'Not announced', css: { background: '#E8EAEA', color: '#454F4D' } },
  check: { label: 'Check site', css: { background: '#FCEBC2', color: '#6B4300' } },
}
const COST: Record<Programme['cost'], { label: string; css: React.CSSProperties }> = {
  Free: { label: 'Free', css: { background: '#DDEEEA', color: '#0B5D57' } },
  'Low-cost': { label: 'Low cost', css: { background: '#EBEEED', color: '#2F3C39' } },
  'Paid stipend': { label: 'Pays a stipend', css: { background: '#F5B301', color: '#12201D' } },
}
const KIND_STYLE: Record<DateKind, React.CSSProperties> = {
  Confirmed: { background: '#D6F0E4', color: '#0A5A3A' },
  Expected: { background: '#DCE8FA', color: '#1F4A8A' },
  Reported: { background: '#DCE8FA', color: '#1F4A8A' },
  Scheduled: { background: '#E8EAEA', color: '#454F4D' },
}

// Only ever render http(s) links.
const safe = (u: string) => (/^https?:\/\//i.test(u) ? u : '')

export default function App() {
  const [f, setF] = useState<Filters>(EMPTY_FILTERS)
  const [goal, setGoal] = useState('')
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [limit, setLimit] = useState(PAGE)

  const states = useMemo(() => stateList(PROGRAMMES), [])
  const list = useMemo(() => filterProgrammes(PROGRAMMES, f), [f])
  const shown = list.slice(0, limit)
  const remaining = list.length - shown.length
  const activeGoal = GOALS.find((g) => g.key === goal)

  const update = (patch: Partial<Filters>, g = goal) => { setF((s) => ({ ...s, ...patch })); setGoal(g); setLimit(PAGE) }
  const reset = () => { setF(EMPTY_FILTERS); setGoal(''); setOpen({}); setLimit(PAGE) }
  const areaVal = f.streams.length === 1 && !goal ? f.streams[0] : ''

  const pickGoal = (key: string) => {
    if (goal === key) return update({ streams: [], careerBreak: false }, '')
    const g = GOALS.find((x) => x.key === key)!
    update({ streams: g.streams, careerBreak: g.careerBreak }, key)
  }
  const jumpTo = (id: string) => {
    const p = PROGRAMMES.find((x) => x.id === id)!
    setF({ ...EMPTY_FILTERS, q: p.name }); setGoal(''); setOpen({ [p.id]: true }); setLimit(PAGE)
  }

  return (
    <>
      <a className="skip" href="#finder">Skip to the programme finder</a>
      <div className="hero">
        <div className="wrap">
          <header className="topbar">
            <span className="brand">Vidya Shakti<small>Homemaker Learning Finder</small></span>
            <a className="toplink" href="#finder">Browse all programmes</a>
          </header>
          <div className="herogrid">
            <div className="herocopy">
              <h1>Government programmes that help women at home learn, earn and stand on their own.</h1>
              <p className="lede">{PROGRAMMES.length} free and low-cost courses, training schemes and fellowships from central and state governments. Filter by your qualification, state and goal, see what is open now, and find where to apply.</p>
              <div><a className="cta" href="#finder">Find my programmes</a></div>
              <span className="privacy-chip">🔒 No login. No tracking. Nothing you pick leaves your device.</span>
              <div className="stats">
                <div className="stat"><b>{PROGRAMMES.length}</b><span>programmes listed</span></div>
                <div className="stat"><b>{PROGRAMMES.filter((p) => p.cost === 'Paid stipend').length}</b><span>pay a stipend</span></div>
                <div className="stat"><b>{PROGRAMMES.filter((p) => p.career_break).length}</b><span>welcome a career break</span></div>
              </div>
            </div>
            <section className="dates" aria-labelledby="dates-h">
              <h2 id="dates-h">Dates to watch</h2>
              <p>Tap one to see the programme. Expected dates come from past years, so confirm on the official site.</p>
              {DATES.map((d) => (
                <button key={d.id + d.when} type="button" className="datelink" onClick={() => { jumpTo(d.id); document.getElementById('results')?.scrollIntoView() }}>
                  <span className="datewhen">{d.when}</span>
                  <span className="datebody">{d.title}<span className="tag" style={KIND_STYLE[d.kind]}>{d.kind}</span></span>
                </button>
              ))}
            </section>
          </div>
        </div>
      </div>

      <main>
        <section className="wrap goals" aria-labelledby="goals-h">
          <div>
            <h2 id="goals-h" className="section-h">What do you want to do?</h2>
            <p>Pick a goal to narrow the list. Tap it again to clear.</p>
          </div>
          <div className="goalgrid">
            {GOALS.map((g) => (
              <button key={g.key} type="button" className="goalbtn" aria-pressed={goal === g.key} onClick={() => pickGoal(g.key)}>
                <b>{g.label}</b><span>{g.sub}</span>
              </button>
            ))}
          </div>
        </section>

        <section id="finder" className="wrap finder" aria-labelledby="finder-h">
          <h2 id="finder-h" className="section-h">Find programmes that fit you</h2>
          <div className="finderrow">
            <form className="filters" onSubmit={(e) => e.preventDefault()}>
              <div className="field">
                <label htmlFor="q">Search</label>
                <input id="q" type="search" value={f.q} placeholder="Name, agency or topic" autoComplete="off" onChange={(e) => update({ q: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="level">Your qualification</label>
                <select id="level" value={f.level} onChange={(e) => update({ level: e.target.value as LevelKey | '' })}>
                  <option value="">Any qualification</option>
                  {Object.entries(LEVEL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="state">Your state</label>
                <select id="state" value={f.state} onChange={(e) => update({ state: e.target.value })}>
                  <option value="">All states</option>
                  {states.map((s) => <option key={s} value={s}>{s}</option>)}
                  <option value="OTHER">My state is not listed (national only)</option>
                </select>
                <span className="hint">National programmes show for every state.</span>
              </div>
              <div className="field">
                <label htmlFor="area">Area of interest</label>
                <select id="area" value={areaVal} onChange={(e) => update({ streams: e.target.value ? [e.target.value] : [], careerBreak: goal ? false : f.careerBreak }, '')}>
                  <option value="">Any area</option>
                  {STREAMS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="cost">Cost to you</label>
                <select id="cost" value={f.cost} onChange={(e) => update({ cost: e.target.value as Filters['cost'] })}>
                  <option value="">Any</option>
                  <option value="Free">Free</option>
                  <option value="Paid stipend">Pays a stipend</option>
                  <option value="Low-cost">Low cost</option>
                </select>
              </div>
              <fieldset className="field">
                <legend>Only show</legend>
                <label className="check"><input type="checkbox" checked={f.women} onChange={(e) => update({ women: e.target.checked })} />Women-only programmes</label>
                <label className="check"><input type="checkbox" checked={f.careerBreak} onChange={(e) => update({ careerBreak: e.target.checked }, '')} />For women returning after a career break</label>
                <label className="check"><input type="checkbox" checked={f.openOnly} onChange={(e) => update({ openOnly: e.target.checked })} />Open or rolling now</label>
              </fieldset>
              <button type="button" className="btn-outline" onClick={reset}>Clear all filters</button>
              <p className="hint">The qualification filter shows programmes that list your level. Some also accept higher or lower levels, so check the details.</p>
            </form>

            <div id="results" className="results">
              <p className="summary" aria-live="polite">{list.length} of {PROGRAMMES.length} programmes{activeGoal ? ` · Goal: ${activeGoal.label}` : ''}</p>
              {list.length === 0 && (
                <div className="empty">
                  <h3>Nothing matches all of those filters</h3>
                  <p>Try removing one filter, or choose “Any” for qualification or area. Some states only have national schemes in this list.</p>
                  <button type="button" className="btn-solid" onClick={reset}>Clear all filters</button>
                </div>
              )}
              <div className="cards">
                {shown.map((p) => <Card key={p.id} p={p} isOpen={!!open[p.id]} toggle={() => setOpen((o) => ({ ...o, [p.id]: !o[p.id] }))} />)}
              </div>
              {remaining > 0 && (
                <div className="more"><button type="button" className="btn-solid" onClick={() => setLimit((l) => l + PAGE)}>Show {Math.min(PAGE, remaining)} more ({remaining} left)</button></div>
              )}
            </div>
          </div>
        </section>

        <section className="privacy" aria-labelledby="privacy-h">
          <div className="wrap">
            <h2 id="privacy-h">Your privacy, plainly</h2>
            <div><h3>No account</h3><p>There is nothing to sign up for. Open the page and use it.</p></div>
            <div><h3>No tracking</h3><p>No analytics, cookies, ads or fingerprinting. We do not know who you are or what you looked for.</p></div>
            <div><h3>Stays on your device</h3><p>Your filters live only in this browser tab and disappear when you close it. Nothing is sent anywhere.</p></div>
            <div><h3>No outside requests</h3><p>Fonts and data are bundled with the page. The only time you leave is when you choose to tap an official link.</p></div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <p><strong style={{ color: '#fff' }}>Always verify before you apply.</strong> Dates marked Expected are based on past cycles. Details were last checked on {UPDATED} from official pages and news reports, and schemes change. This is an independent guide, not an official government site.</p>
          <p>Free to use and share. <a href="./programmes.csv" download>Download the full list (CSV)</a>.</p>
          <p>Made by YourAI Guru · <a href="https://yourownaiguru-jpg.github.io/personal-tools/tools/">More free tools</a> · <a href="https://yourownaiguru-jpg.github.io/personal-tools/work-with-me/">Want a tool like this? Work with me</a></p>
        </div>
      </footer>
    </>
  )
}

function Card({ p, isOpen, toggle }: { p: Programme; isOpen: boolean; toggle: () => void }) {
  const kind = kindOf(p)
  const official = safe(p.official_url)
  const source = safe(p.source_url)
  const detailId = `d-${p.id}`
  return (
    <article className="card">
      <div className="cardtop">
        <span className="pill" style={PILL[kind].css}>{PILL[kind].label}</span>
        <span className="where">{whereLabel(p)}</span>
      </div>
      <h3>{p.name}</h3>
      <p className="agency">{p.agency}</p>
      <div className="badges">
        <span className="badge" style={COST[p.cost].css}>{COST[p.cost].label}</span>
        {p.women_only && <span className="badge" style={{ background: '#F3E4EE', color: '#6B1F52', fontWeight: 600 }}>Women only</span>}
        {p.career_break && <span className="badge" style={{ background: '#E6E3F5', color: '#3B2F85', fontWeight: 600 }}>Career break OK</span>}
      </div>
      <p className="when"><strong>When:</strong> {p.window}</p>
      <button type="button" className="cardbtn" aria-expanded={isOpen} aria-controls={detailId} onClick={toggle}>
        {isOpen ? 'Hide details' : 'See details'}
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5l4 4 4-4" /></svg>
      </button>
      {isOpen && (
        <dl className="detail" id={detailId} style={{ margin: 0 }}>
          <div><dt>What it costs</dt><dd>{p.cost_note}</dd></div>
          <div><dt>Who can apply</dt><dd>{p.eligibility}</dd></div>
          <div><dt>Qualification listed</dt><dd>{p.levels.map((l) => LEVEL_LABELS[l]).join(', ')}</dd></div>
          <div><dt>How it runs</dt><dd>{p.mode}</dd></div>
          <div><dt>Available in</dt><dd>{isNational(p) ? 'All India' : p.states.join(', ')}</dd></div>
          <div><dt>Run by</dt><dd>{p.govt === 'Central' ? 'Central government' : 'State government'}</dd></div>
          <div><dt>Status on our list</dt><dd>{p.status}. Last checked {UPDATED}.</dd></div>
          <div className="links" style={{ flexDirection: 'row' }}>
            {official && <a className="primary" href={official} target="_blank" rel="noopener noreferrer">Official site</a>}
            {source && <a className="secondary" href={source} target="_blank" rel="noopener noreferrer">Source we used</a>}
          </div>
          {!official && <p className="hint" style={{ fontSize: 14, lineHeight: 1.5 }}>We do not have an official link for this one yet. Search the programme name with your district or state, and confirm details with the office before you apply.</p>}
        </dl>
      )}
    </article>
  )
}
