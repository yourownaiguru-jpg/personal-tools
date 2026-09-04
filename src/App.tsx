import { useState } from 'react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { UploadZone, type ParsedStatement } from './components/UploadZone'

function App() {
  const [statements, setStatements] = useState<ParsedStatement[]>([])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8 space-y-6">
        <UploadZone
          onStatementsExtracted={(newStatements) =>
            setStatements((prev) => [...prev, ...newStatements])
          }
        />
        {statements.length > 0 && (
          <ul className="text-sm text-slate-400 space-y-1">
            {statements.map((s) => (
              <li key={s.fileName}>
                Read {s.fileName} — {s.pages.flat().length} lines extracted
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default App
