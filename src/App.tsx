import { useEffect, useState } from 'react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { UploadZone, type ParsedStatement } from './components/UploadZone'
import { Dashboard } from './components/Dashboard'
import { guessStatementYear } from './lib/pdf'
import { parseStatementText } from './lib/parseStatement'
import { categorizeAll, DEFAULT_RULES } from './lib/categorize'
import { clearAllData, loadTransactions, mergeTransactions, saveTransactions } from './lib/storage'
import type { Transaction } from './lib/types'

const ALL_CATEGORIES = [...DEFAULT_RULES.map((r) => r.category), 'Uncategorized']

function accountNameFromFile(fileName: string): string {
  return fileName.replace(/\.pdf$/i, '')
}

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions())
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  useEffect(() => {
    saveTransactions(transactions)
  }, [transactions])

  const handleStatements = (statements: ParsedStatement[]) => {
    const parsed = statements.flatMap((s) =>
      parseStatementText(s.pages, {
        account: accountNameFromFile(s.fileName),
        sourceStatement: s.fileName,
        statementYear: guessStatementYear(s.pages),
      }),
    )
    setTransactions((prev) => {
      const { merged, addedCount, duplicateCount } = mergeTransactions(prev, categorizeAll(parsed))
      setStatusMessage(
        duplicateCount > 0
          ? `Added ${addedCount} new transaction${addedCount === 1 ? '' : 's'} (skipped ${duplicateCount} already-imported duplicate${duplicateCount === 1 ? '' : 's'}).`
          : `Added ${addedCount} new transaction${addedCount === 1 ? '' : 's'}.`,
      )
      return merged
    })
  }

  const handleCategoryChange = (id: string, category: string) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, category } : t)))
  }

  const handleClearData = () => {
    if (!window.confirm('Clear all imported transactions from this browser? This cannot be undone.')) {
      return
    }
    clearAllData()
    setTransactions([])
    setStatusMessage('All locally stored data has been cleared.')
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
        {transactions.length > 0 && (
          <>
            <div className="flex justify-between items-center">
              <p className="text-xs text-slate-500">
                {transactions.length} transaction{transactions.length === 1 ? '' : 's'} stored
                locally in this browser.
              </p>
              <button
                type="button"
                onClick={handleClearData}
                className="text-xs text-rose-400 hover:text-rose-300 underline"
              >
                Clear all data
              </button>
            </div>
            <Dashboard
              transactions={transactions}
              categories={ALL_CATEGORIES}
              onCategoryChange={handleCategoryChange}
            />
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default App
