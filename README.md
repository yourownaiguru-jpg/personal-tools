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
- Multi-statement merge with duplicate detection
- Local-only persistence (localStorage) with a one-click "Clear all data"
- CSV export

## Development

```bash
npm install
npm run dev
```

## Test

```bash
npm run test
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
   builds and publishes the site automatically; a pull request instead
   triggers [.github/workflows/ci.yml](./.github/workflows/ci.yml) (lint,
   test, build) without deploying.
4. The published URL appears in the Actions run summary and under
   **Settings → Pages**.

## Status

This project is under active development. See open tasks in the repo issues.
