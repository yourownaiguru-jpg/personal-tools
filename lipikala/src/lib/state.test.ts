import { describe, expect, it } from 'vitest'
import { derive, initStateFromHash } from './state'

describe('initStateFromHash', () => {
  it('defaults to "Kaveri" in Tamil at era 0 with no hash', () => {
    const s = initStateFromHash('')
    expect(s).toMatchObject({ text: 'Kaveri', lang: 'Tamil', eraIdx: 0, surf: null })
  })

  it('restores text, language, era, and surface from a shared link', () => {
    const s = initStateFromHash('#t=Rama&l=Sanskrit&e=siddham&s=copper')
    expect(s.text).toBe('Rama')
    expect(s.lang).toBe('Sanskrit')
    expect(s.surf).toBe('copper')
    expect(derive(s).era.id).toBe('siddham')
  })

  it('falls back to Tamil for an unknown language id rather than crashing', () => {
    const s = initStateFromHash('#l=Klingon')
    expect(s.lang).toBe('Tamil')
  })

  it('falls back to era 0 for an unknown era id', () => {
    const s = initStateFromHash('#l=Tamil&e=nonexistent-era')
    expect(s.eraIdx).toBe(0)
  })

  it('ignores an invalid surface value rather than storing garbage', () => {
    const s = initStateFromHash('#s=marble')
    expect(s.surf).toBeNull()
  })
})

describe('derive', () => {
  it('clamps eraIdx to the last era if a language has fewer eras than the stored index', () => {
    const s = { text: 'Kaveri', lang: 'Tamil' as const, eraIdx: 99, surf: null, shareLabel: 'Copy link' }
    expect(() => derive(s)).not.toThrow()
    const { era, eras } = derive(s)
    expect(era).toBe(eras[eras.length - 1])
  })

  it('defaults to the stone surface when none is set', () => {
    const s = initStateFromHash('')
    expect(derive(s).surf).toBe('stone')
  })
})
