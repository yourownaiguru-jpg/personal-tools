import { useMemo, useState } from 'react'
import type { Transaction } from '../lib/types'

type SortKey = 'date' | 'description' | 'category' | 'amount'
type SortDir = 'asc' | 'desc'

interface TransactionTableProps {
  transactions: Transaction[]
  categories: string[]
  onCategoryChange: (id: string, category: string) => void
}

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}

export function TransactionTable({
  transactions,
  categories,
  onCategoryChange,
}: TransactionTableProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [account, setAccount] = useState('All')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const accounts = useMemo(
    () => ['All', ...new Set(transactions.map((t) => t.account))],
    [transactions],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return transactions.filter((t) => {
      if (query && !t.description.toLowerCase().includes(query)) return false
      if (category !== 'All' && t.category !== category) return false
      if (account !== 'All' && t.account !== account) return false
      if (startDate && t.date < startDate) return false
      if (endDate && t.date > endDate) return false
      return true
    })
  }, [transactions, search, category, account, startDate, endDate])

  const sorted = useMemo(() => {
    const copy = [...filtered]
    copy.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'amount') cmp = a.amount - b.amount
      else cmp = String(a[sortKey]).localeCompare(String(b[sortKey]))
      return sortDir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [filtered, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const columns: { key: SortKey; label: string; align?: 'right' }[] = [
    { key: 'date', label: 'Date' },
    { key: 'description', label: 'Description' },
    { key: 'category', label: 'Category' },
    { key: 'amount', label: 'Amount', align: 'right' },
  ]

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex flex-wrap gap-2 mb-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search description…"
          aria-label="Search transactions"
          className="flex-1 min-w-[160px] rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-200 placeholder:text-slate-500"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
          className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-200"
        >
          <option>All</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          aria-label="Filter by account"
          className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-200"
        >
          {accounts.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          aria-label="Start date"
          className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-200"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          aria-label="End date"
          className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-200"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left text-xs text-slate-500">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`py-2 pr-3 font-medium cursor-pointer select-none ${col.align === 'right' ? 'text-right' : ''}`}
                  onClick={() => toggleSort(col.key)}
                >
                  {col.label}
                  {sortKey === col.key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((t) => (
              <tr key={t.id} className="border-b border-slate-900 hover:bg-slate-800/40">
                <td className="py-2 pr-3 text-slate-400 whitespace-nowrap tabular-nums">
                  {t.date}
                </td>
                <td className="py-2 pr-3 text-slate-200 max-w-xs truncate" title={t.description}>
                  {t.description}
                </td>
                <td className="py-2 pr-3">
                  <select
                    value={t.category}
                    onChange={(e) => onCategoryChange(t.id, e.target.value)}
                    aria-label={`Category for ${t.description}`}
                    className="rounded border border-slate-700 bg-slate-950 px-1.5 py-1 text-xs text-slate-300"
                  >
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </td>
                <td
                  className={`py-2 text-right tabular-nums whitespace-nowrap ${
                    t.amount < 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {formatCurrency(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-500">
            No transactions match these filters.
          </p>
        )}
      </div>
    </div>
  )
}
