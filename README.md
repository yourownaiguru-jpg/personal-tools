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

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deployment

This project deploys to GitHub Pages via GitHub Actions — see
[.github/workflows/deploy.yml](./.github/workflows/deploy.yml). Pushing to
`main` builds and publishes the site automatically.

## Status

This project is under active development. See open tasks in the repo issues.
