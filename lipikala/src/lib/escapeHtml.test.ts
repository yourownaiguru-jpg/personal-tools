import { describe, expect, it } from 'vitest'
import { escapeHtml } from './escapeHtml'

describe('escapeHtml', () => {
  it('escapes the five HTML-significant characters', () => {
    expect(escapeHtml(`<script>alert(1)&"'</script>`)).toBe(
      '&lt;script&gt;alert(1)&amp;&quot;&#39;&lt;/script&gt;',
    )
  })

  it('leaves ordinary Unicode text (diacritics, Indic scripts) untouched', () => {
    expect(escapeHtml('Śāradā · காவேரி')).toBe('Śāradā · காவேரி')
  })

  it('neutralizes an attribute-breakout attempt, the actual risk since shared #t= links reach this', () => {
    const malicious = `x" onerror="alert(1)`
    const out = escapeHtml(malicious)
    expect(out).not.toContain('"')
  })
})
