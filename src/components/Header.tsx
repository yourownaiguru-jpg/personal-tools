export function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="7" fill="#0f172a" />
            <path
              d="M9 21.5V10.5H16.5C18.9853 10.5 21 12.5147 21 15C21 17.4853 18.9853 19.5 16.5 19.5H12"
              stroke="#38bdf8"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="16.5" cy="15" r="1.4" fill="#38bdf8" />
          </svg>
          <span className="text-lg font-semibold text-slate-100">
            Privacy Expense Tracker
          </span>
        </div>
        <p className="hidden sm:block text-xs text-slate-500">
          Statements are parsed on your device. Nothing is uploaded.
        </p>
      </div>
    </header>
  )
}
