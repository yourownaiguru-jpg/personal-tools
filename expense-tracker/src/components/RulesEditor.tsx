import { useState } from 'react'
import type { CategoryRule } from '../lib/types'

interface RulesEditorProps {
  rules: CategoryRule[]
  onChange: (rules: CategoryRule[]) => void
  onReapply: () => void
}

export function RulesEditor({ rules, onChange, onReapply }: RulesEditorProps) {
  const [open, setOpen] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [keywordDraft, setKeywordDraft] = useState<Record<string, string>>({})

  const addKeyword = (category: string) => {
    const keyword = (keywordDraft[category] ?? '').trim().toLowerCase()
    if (!keyword) return
    onChange(
      rules.map((r) =>
        r.category === category && !r.keywords.includes(keyword)
          ? { ...r, keywords: [...r.keywords, keyword] }
          : r,
      ),
    )
    setKeywordDraft((d) => ({ ...d, [category]: '' }))
  }

  const removeKeyword = (category: string, keyword: string) => {
    onChange(
      rules.map((r) =>
        r.category === category ? { ...r, keywords: r.keywords.filter((k) => k !== keyword) } : r,
      ),
    )
  }

  const addCategory = () => {
    const category = newCategory.trim()
    if (!category || rules.some((r) => r.category === category)) return
    onChange([...rules, { category, keywords: [] }])
    setNewCategory('')
  }

  const removeCategory = (category: string) => {
    onChange(rules.filter((r) => r.category !== category))
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-slate-400 hover:text-slate-200 underline"
      >
        Edit categorization rules
      </button>
    )
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-300">Categorization rules</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-slate-500 hover:text-slate-300"
        >
          Close
        </button>
      </div>

      <div className="space-y-3">
        {rules.map((rule) => (
          <div key={rule.category} className="rounded-md border border-slate-800 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-200">{rule.category}</span>
              <button
                type="button"
                onClick={() => removeCategory(rule.category)}
                className="text-xs text-rose-400 hover:text-rose-300"
              >
                Remove category
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {rule.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300"
                >
                  {keyword}
                  <button
                    type="button"
                    aria-label={`Remove keyword ${keyword}`}
                    onClick={() => removeKeyword(rule.category, keyword)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    ×
                  </button>
                </span>
              ))}
              {rule.keywords.length === 0 && (
                <span className="text-xs text-slate-600">No keywords yet</span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={keywordDraft[rule.category] ?? ''}
                onChange={(e) =>
                  setKeywordDraft((d) => ({ ...d, [rule.category]: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addKeyword(rule.category)
                  }
                }}
                placeholder="add keyword…"
                aria-label={`Add keyword to ${rule.category}`}
                className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200"
              />
              <button
                type="button"
                onClick={() => addKeyword(rule.category)}
                className="text-xs rounded-md border border-slate-700 px-2 py-1 text-slate-300 hover:bg-slate-800"
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-2 border-t border-slate-800">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addCategory()
            }
          }}
          placeholder="New category name…"
          aria-label="New category name"
          className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200"
        />
        <button
          type="button"
          onClick={addCategory}
          className="text-xs rounded-md border border-slate-700 px-2 py-1 text-slate-300 hover:bg-slate-800"
        >
          Add category
        </button>
      </div>

      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Re-apply these rules to already-imported transactions. Manual category
          overrides will be replaced by keyword matches.
        </p>
        <button
          type="button"
          onClick={onReapply}
          className="shrink-0 text-xs rounded-md border border-sky-800 bg-sky-950/40 px-2 py-1 text-sky-300 hover:bg-sky-900/50"
        >
          Re-apply rules
        </button>
      </div>
    </div>
  )
}
