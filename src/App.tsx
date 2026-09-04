import { useEffect, useState } from 'react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { UploadZone, type ParsedStatement } from './components/UploadZone'
import { Dashboard } from './components/Dashboard'
import { RulesEditor } from './components/RulesEditor'
import { guessStatementYear } from './lib/pdf'
import { parseStatementText } from './lib/parseStatement'
import { categorizeAll, DEFAULT_RULES } from './lib/categorize'
import { transactionsToCsv, downloadTextFile } from './lib/csv'
import {
  clearAllData,
  loadRules,
  loadTransactions,
  mergeTransactions,
  saveRules,
  saveTransactions,
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

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions())
  const [rules, setRules] = useState<CategoryRule[]>(() => loadRules() ?? DEFAULT_RULES)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  useEffect(() => {
    saveTransactions(transactions)
  }, [transactions])

  useEffect(() => {
    saveRules(rules)
  }, [rules])

  const allCategories = [...new Set([...rules.map((r) => r.category), 'Uncategorized'])]

  const handleStatements = (statements: ParsedStatement[]) => {
    const parsed = statements.flatMap((s) =>
      parseStatementText(s.pages, {
        account: accountNameFromFile(s.fileName),
        sourceStatement: s.fileName,
        statementYear: guessStatementYear(s.pages),
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
    setStatusMessage('All locally stored data has been cleared.')
  }

  const handleExportCsv = () => {
    downloadTextFile('transactions.csv', transactionsToCsv(transactions), 'text/csv')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8 space-y-6">
        <UploadZone onStatementsExtracted={handleStatements} />
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
