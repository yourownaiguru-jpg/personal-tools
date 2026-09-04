import { useState } from 'react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { UploadZone, type ParsedStatement } from './components/UploadZone'
import { Dashboard } from './components/Dashboard'
import { guessStatementYear } from './lib/pdf'
import { parseStatementText } from './lib/parseStatement'
import { categorizeAll } from './lib/categorize'
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
    setTransactions((prev) => [...prev, ...categorizeAll(parsed)])
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8 space-y-6">
        <UploadZone onStatementsExtracted={handleStatements} />
        {transactions.length > 0 && <Dashboard transactions={transactions} />}
      </main>
      <Footer />
    </div>
  )
}

export default App
