import { Header } from './components/Header'
import { Footer } from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8">
        <div className="rounded-xl border border-dashed border-slate-700 p-12 text-center text-slate-400">
          Upload a statement to get started.
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default App
