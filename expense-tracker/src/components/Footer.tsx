export function Footer() {
  return (
    <footer className="border-t border-slate-800 mt-16">
      <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-slate-500 flex flex-col sm:flex-row gap-2 sm:justify-between">
        <p>
          Your statement PDFs are read in your browser and never leave your
          device. See PRIVACY.md in the repository for details.
        </p>
        <p>No accounts. No servers. No tracking.</p>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-6 text-xs text-slate-500">
        <p>
          Made by YourAI Guru ·{' '}
          <a className="underline hover:text-slate-300" href="https://yourownaiguru-jpg.github.io/personal-tools/tools/">More free tools</a> ·{' '}
          <a className="underline hover:text-slate-300" href="https://yourownaiguru-jpg.github.io/personal-tools/work-with-me/">Want a tool like this? Work with me</a>
        </p>
      </div>
    </footer>
  )
}
