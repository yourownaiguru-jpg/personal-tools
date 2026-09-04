# Privacy Expense Tracker

A dashboard for tracking expenses from bank and credit card statements —
entirely in your browser. No backend, no server, no upload.

## How it works

1. You drop a PDF bank or credit card statement onto the page.
2. The PDF is parsed **in the browser** using [pdf.js](https://mozilla.github.io/pdf.js/).
3. Transactions are extracted, categorized, and rendered into a dashboard —
   all in memory / local browser storage on your device.
4. The original PDF file is **never stored, never transmitted, and never
   written to disk** by this app. Closing or reloading the tab discards it;
   only the parsed transaction data (dates, amounts, descriptions,
   categories) is optionally kept in your browser's local storage so your
   dashboard persists between visits.

See [PRIVACY.md](./PRIVACY.md) for details.

## Features

- Drag-and-drop or file-picker upload of one or more PDF statements
- Client-side text extraction and transaction parsing (date, description, amount)
- Automatic, editable keyword-based categorization
- Dashboard: spend summary, spend-by-category chart, income-vs-expense trend
- Sortable, filterable, searchable transaction table with inline category edits
- Multi-statement merge with occurrence-aware duplicate detection (re-uploading
  an overlapping statement skips duplicates, but two genuinely identical
  purchases on the same day are both kept)
- Local-only persistence (localStorage) with a one-click "Clear all data"
- CSV export (generated in the browser, downloaded directly to your machine)

## Architecture

The app is a static Vite + React + TypeScript site. All statement logic
lives in small, individually tested modules under `src/lib/`:

| Module | Responsibility |
|---|---|
| `pdf.ts` | pdf.js wrapper — extracts positioned text and reconstructs lines per page |
| `parseStatement.ts` | Generic line parser: leading date + trailing amount → transaction |
| `categorize.ts` | Keyword rules → category; first matching rule wins |
| `aggregate.ts` | Summary totals, spend-by-category, monthly income/expense series |
| `storage.ts` | localStorage persistence (validated on load) and merge/dedupe |
| `csv.ts` | CSV serialization and local file download |

Components under `src/components/` are thin views over these modules;
`App.tsx` owns all state.

## Limitations & assumptions

- **Text-based PDFs only.** Scanned/image-only statements have no text
  layer and will produce no transactions (there is no OCR).
- **Encrypted PDFs are not supported** and are reported as unreadable.
- **Date format:** US `mm/dd` is assumed. Unambiguous `dd/mm` dates (day
  > 12) are detected and swapped, but an ambiguous European date like
  `05/03` will be read as May 3.
- **Amount conventions:** lines are treated as charges (money out) unless
  marked `CR`, parenthesized, negative, or matching payment/refund
  keywords. Bank statements that use separate debit/credit columns may
  need a format adapter.
- **Currency display is USD**; parsing strips `$` and `,` only.
- The generic parser aims for broad coverage rather than per-bank
  perfection — check the table after import and correct categories inline.

## Development

```bash
npm install
npm run dev
```

## Test & lint

```bash
npm run test
npm run lint
```

## Build

```bash
npm run build
npm run preview
```

## Deployment (GitHub Pages)

1. Push this repository to GitHub. If you rename it from
   `privacy-expense-tracker`, update `REPO_NAME` in `vite.config.ts` to
   match — GitHub Pages project sites are served at `/<repo-name>/`, and
   the build's asset paths need to match.
2. In the repository's **Settings → Pages**, set **Source** to
   **GitHub Actions**.
3. Push to `main`. [.github/workflows/deploy.yml](./.github/workflows/deploy.yml)
   builds, tests, and publishes the site automatically; a pull request
   instead triggers [.github/workflows/ci.yml](./.github/workflows/ci.yml)
   (lint, test, build) without deploying.
4. The published URL appears in the Actions run summary and under
   **Settings → Pages**.
