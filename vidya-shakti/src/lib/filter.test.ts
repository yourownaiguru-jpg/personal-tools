import { describe, expect, it } from 'vitest'
import { PROGRAMMES, DATES, GOALS, STREAMS } from '../data/programmes'
import { EMPTY_FILTERS } from './types'
import { filterProgrammes, kindOf, stateList } from './filter'

const f = (patch: object) => ({ ...EMPTY_FILTERS, ...patch })

describe('data integrity', () => {
  it('has 46 programmes with unique ids', () => {
    expect(PROGRAMMES).toHaveLength(46)
    expect(new Set(PROGRAMMES.map((p) => p.id)).size).toBe(46)
  })
  it('every date and goal points at real data', () => {
    DATES.forEach((d) => expect(PROGRAMMES.some((p) => p.id === d.id)).toBe(true))
    GOALS.forEach((g) => g.streams.forEach((s) => expect(STREAMS).toContain(s)))
  })
  it('only http(s) links, so the UI never renders a javascript: URL', () => {
    PROGRAMMES.forEach((p) => {
      ;[p.official_url, p.source_url].filter(Boolean).forEach((u) => expect(u).toMatch(/^https?:\/\//))
    })
  })
})

describe('filtering', () => {
  it('no filters returns everything', () => expect(filterProgrammes(PROGRAMMES, EMPTY_FILTERS)).toHaveLength(46))
  it('women-only matches the data count', () =>
    expect(filterProgrammes(PROGRAMMES, f({ women: true }))).toHaveLength(PROGRAMMES.filter((p) => p.women_only).length))
  it('state filter keeps national schemes plus that state', () => {
    const r = filterProgrammes(PROGRAMMES, f({ state: 'Kerala' }))
    expect(r.some((p) => p.id === 'P030')).toBe(true) // Kerala-only
    expect(r.some((p) => p.id === 'P001')).toBe(true) // national
    expect(r.some((p) => p.id === 'P036')).toBe(false) // Karnataka-only
  })
  it('"my state not listed" shows national only', () => {
    filterProgrammes(PROGRAMMES, f({ state: 'OTHER' })).forEach((p) => expect(p.states).toContain('All India'))
  })
  it('open-only keeps only open/rolling programmes', () => {
    filterProgrammes(PROGRAMMES, f({ openOnly: true })).forEach((p) => expect(kindOf(p)).toBe('open'))
  })
  it('text search is case-insensitive and covers agency', () => {
    expect(filterProgrammes(PROGRAMMES, f({ q: 'nielit' })).length).toBeGreaterThan(2)
  })
  it('sorts open programmes before not-announced ones', () => {
    const r = filterProgrammes(PROGRAMMES, EMPTY_FILTERS)
    expect(kindOf(r[0])).toBe('open')
    expect(kindOf(r[r.length - 1])).toBe('none')
  })
  it('lists states without "All India"', () => {
    const s = stateList(PROGRAMMES)
    expect(s).toContain('Kerala')
    expect(s).not.toContain('All India')
  })
})
