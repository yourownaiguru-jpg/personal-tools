import type { Filters, Kind, Programme } from './types'

export const LEVEL_LABELS: Record<string, string> = {
  school_dropout: 'Below 10th (school dropout)',
  class10_pass: '10th pass',
  class12_pass: '12th pass',
  undergraduate: 'Graduate / undergraduate',
  postgraduate: 'Postgraduate',
  doctorate_research: 'PhD / research scholar',
}

export const isNational = (p: Programme) => p.states.includes('All India')

export function kindOf(p: Programme): Kind {
  const s = p.status
  if (s.startsWith('Confirmed') || s.startsWith('Rolling')) return 'open'
  if (s.startsWith('Expected')) return 'expected'
  if (s.startsWith('Not announced')) return 'none'
  return 'check'
}

const KIND_RANK: Record<Kind, number> = { open: 0, check: 1, expected: 2, none: 3 }
const COST_RANK: Record<Programme['cost'], number> = { 'Paid stipend': 0, Free: 1, 'Low-cost': 2 }

export function matches(p: Programme, f: Filters): boolean {
  if (f.level && !p.levels.includes(f.level)) return false
  if (f.state === 'OTHER') {
    if (!isNational(p)) return false
  } else if (f.state && !isNational(p) && !p.states.includes(f.state)) return false
  if (f.streams.length && !p.streams.some((s) => f.streams.includes(s))) return false
  if (f.cost && p.cost !== f.cost) return false
  if (f.women && !p.women_only) return false
  if (f.careerBreak && !p.career_break) return false
  if (f.openOnly && kindOf(p) !== 'open') return false
  const q = f.q.trim().toLowerCase()
  if (q) {
    const hay = [p.id, p.name, p.agency, p.eligibility, p.cost_note, p.mode, ...p.streams].join(' ').toLowerCase()
    if (!hay.includes(q)) return false
  }
  return true
}

/** Open first, then cheapest-to-you (stipend > free > low cost), then id. */
export function filterProgrammes(all: Programme[], f: Filters): Programme[] {
  return all
    .filter((p) => matches(p, f))
    .sort((a, b) =>
      KIND_RANK[kindOf(a)] - KIND_RANK[kindOf(b)] ||
      COST_RANK[a.cost] - COST_RANK[b.cost] ||
      (a.id < b.id ? -1 : 1))
}

export function stateList(all: Programme[]): string[] {
  const set = new Set<string>()
  all.forEach((p) => { if (!isNational(p)) p.states.forEach((s) => set.add(s)) })
  return [...set].sort()
}

export function whereLabel(p: Programme): string {
  if (isNational(p)) return 'All India'
  return p.states.length > 2 ? `${p.states.slice(0, 2).join(', ')} +${p.states.length - 2}` : p.states.join(', ')
}
