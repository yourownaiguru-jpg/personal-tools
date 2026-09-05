import { useEffect, useState } from 'react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { UploadZone, type ParsedStatement } from './components/UploadZone'
import { Dashboard } from './components/Dashboard'
import { RulesEditor } from './components/RulesEditor'
import { guessStatementYear } from './lib/pdf'
import { parseStatementText } from './lib/parseStatement'
import { guessDateFormat, type DateFormat } from './lib/dateFormat'
import { guessCurrency, CURRENCIES, CURRENCY_LABELS, type Currency } from './lib/currency'
import { categorizeAll, DEFAULT_RULES } from './lib/categorize'
import { transactionsToCsv, downloadTextFile } from './lib/csv'
import {
  clearAllData,
  loadCurrencySettings,
  loadRules,
  loadTransactions,
  mergeTransactions,
  saveCurrencySettings,
  saveRules,
  saveTransactions,
  DEFAULT_CURRENCY_SETTINGS,
} from './lib/storage'
import type { CategoryRule, Transaction } from './lib/types'

function accountNameFromFile(fileName: string): string {
  return fileName.replace(/\.pdf$/i, '')
}

function EmptyState() {
  const steps = [
    { title: 'Drop in a statement', body: 'Drag a bank or credit card PDF onto the box above, or click to choose one.' },
    { title: 'Parsed in your browser', body: 'pdf.js reads the file locally — it is never uploaded anywhere.' },
    { title: 'See your dashboard', body: 'Transactions are categorized automatically and charted for you.' },
  ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
      {steps.map((step, i) => (
        <div key={step.title} className="rounded-lg border border-slate-800 p-4">
          <p className="text-xs text-slate-600 mb-1">Step {i + 1}</p>
          <p className="text-sm font-medium text-slate-200 mb-1">{step.title}</p>
          <p className="text-xs text-slate-500">{step.body}</p>
        </div>
      ))}
    </div>
  )
}

type DateFormatChoice = 'auto' | DateFormat
type CurrencyChoice = 'auto' | Currency

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions())
  const [rules, setRules] = useState<CategoryRule[]>(() => loadRules() ?? DEFAULT_RULES)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [dateFormatChoice, setDateFormatChoice] = useState<DateFormatChoice>('auto')
  const [currencySettings, setCurrencySettings] = useState(() => loadCurrencySettings())

  // What the dashboard actually renders in: the user's explicit pick, or
  // whatever the last import detected while the selector is on auto.
  const currency: Currency =
    currencySettings.choice === 'auto' ? currencySettings.detected : currencySettings.choice

  useEffect(() => {
    saveTransactions(transactions)
  }, [transactions])

  useEffect(() => {
    saveRules(rules)
  }, [rules])

  useEffect(() => {
    saveCurrencySettings(currencySettings)
  }, [currencySettings])

  const allCategories = [...new Set([...rules.map((r) => r.category), 'Uncategorized'])]

  const handleStatements = (statements: ParsedStatement[]) => {
    // The last statement in a batch decides the detected currency — mixing
    // currencies in one dashboard would make the totals meaningless anyway,
    // and the selector is there to override a wrong guess.
    const lastStatement = statements.at(-1)
    if (lastStatement) {
      const detected = guessCurrency(lastStatement.pages)
      setCurrencySettings((prev) => ({ ...prev, detected }))
    }

    const parsed = statements.flatMap((s) =>
      parseStatementText(s.pages, {
        account: accountNameFromFile(s.fileName),
        sourceStatement: s.fileName,
        statementYear: guessStatementYear(s.pages),
        dateFormat: dateFormatChoice === 'auto' ? guessDateFormat(s.pages) : dateFormatChoice,
      }),
    )
    // Merge outside the state updater — updaters must stay pure (StrictMode
    // runs them twice), and the status message is a separate state change.
    const { merged, addedCount, duplicateCount } = mergeTransactions(
      transactions,
      categorizeAll(parsed, rules),
    )
    setTransactions(merged)
    setStatusMessage(
      duplicateCount > 0
        ? `Added ${addedCount} new transaction${addedCount === 1 ? '' : 's'} (skipped ${duplicateCount} already-imported duplicate${duplicateCount === 1 ? '' : 's'}).`
        : `Added ${addedCount} new transaction${addedCount === 1 ? '' : 's'}.`,
    )
  }

  const handleCategoryChange = (id: string, category: string) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, category } : t)))
  }

  const handleReapplyRules = () => {
    setTransactions((prev) => categorizeAll(prev, rules))
    setStatusMessage('Re-applied categorization rules to all transactions.')
  }

  const handleClearData = () => {
    if (!window.confirm('Clear all imported transactions from this browser? This cannot be undone.')) {
      return
    }
    clearAllData()
    setTransactions([])
    setRules(DEFAULT_RULES)
    setCurrencySettings(DEFAULT_CURRENCY_SETTINGS)
    setStatusMessage('All locally stored data has been cleared.')
  }

  const handleExportCsv = () => {
    downloadTextFile('transactions.csv', transactionsToCsv(transactions, currency), 'text/csv')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8 space-y-6">
        <UploadZone onStatementsExtracted={handleStatements} />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 -mt-2">
          <div className="flex items-center gap-2">
            <label htmlFor="date-format" className="text-xs text-slate-500">
              Date format in these statements:
            </label>
            <select
              id="date-format"
              value={dateFormatChoice}
              onChange={(e) => setDateFormatChoice(e.target.value as DateFormatChoice)}
              className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-300"
            >
              <option value="auto">Auto-detect</option>
              <option value="MDY">MM/DD/YYYY (US)</option>
              <option value="DMY">DD/MM/YYYY (India, UK, most other countries)</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="currency" className="text-xs text-slate-500">
              Currency:
            </label>
            <select
              id="currency"
              value={currencySettings.choice}
              onChange={(e) =>
                setCurrencySettings((prev) => ({
                  ...prev,
                  choice: e.target.value as CurrencyChoice,
                }))
              }
              className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-300"
            >
              <option value="auto">
                Auto-detect{transactions.length > 0 ? ` (${CURRENCY_LABELS[currency]})` : ''}
              </option>
              {CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {CURRENCY_LABELS[code]}
                </option>
              ))}
            </select>
          </div>
        </div>
        {statusMessage && (
          <p role="status" className="text-xs text-slate-500">
            {statusMessage}
          </p>
        )}
        {transactions.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="flex flex-wrap gap-3 justify-between items-center">
              <p className="text-xs text-slate-500">
                {transactions.length} transaction{transactions.length === 1 ? '' : 's'} stored
                locally in this browser.
              </p>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="text-xs text-slate-400 hover:text-slate-200 underline"
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={handleClearData}
                  className="text-xs text-rose-400 hover:text-rose-300 underline"
                >
                  Clear all data
                </button>
              </div>
            </div>
            <Dashboard
              transactions={transactions}
              categories={allCategories}
              currency={currency}
              onCategoryChange={handleCategoryChange}
            />
            <RulesEditor rules={rules} onChange={setRules} onReapply={handleReapplyRules} />
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default App
