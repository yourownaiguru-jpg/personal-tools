import { useState } from 'react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { UploadZone, type ParsedStatement } from './components/UploadZone'
import { guessStatementYear } from './lib/pdf'
import { parseStatementText } from './lib/parseStatement'
import type { Transaction } from './lib/types'

function accountNameFromFile(fileName: string): string {
  return fileName.replace(/\.pdf$/i, '')
}

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const handleStatements = (statements: ParsedStatement[]) => {
    const parsed = statements.flatMap((s) =>
      parseStatementText(s.pages, {
        account: accountNameFromFile(s.fileName),
        sourceStatement: s.fileName,
        statementYear: guessStatementYear(s.pages),
      }),
    )
    setTransactions((prev) => [...prev, ...parsed])
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8 space-y-6">
        <UploadZone onStatementsExtracted={handleStatements} />
        {transactions.length > 0 && (
          <div className="text-sm text-slate-400">
            <p className="mb-2">
              Parsed {transactions.length} transaction
              {transactions.length === 1 ? '' : 's'}.
            </p>
            <ul className="space-y-1 font-mono text-xs">
              {transactions.slice(0, 10).map((t) => (
                <li key={t.id} className="flex gap-3">
                  <span className="text-slate-500">{t.date}</span>
                  <span className="flex-1 truncate">{t.description}</span>
                  <span className={t.amount < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                    {t.amount.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default App
