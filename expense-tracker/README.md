# Privacy Expense Tracker

A dashboard for tracking expenses from bank and credit card statements —
entirely in your browser. No backend, no server, no upload.

> **New here? Read [the guide](./GUIDE.md).** It walks through using the
> tool, explains how it's built and why your statements can't leak, and
> shows you how to verify that yourself in about ten seconds.

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
- Works with both US-style (single amount, `CR` marker) and India-style
  (day-first dates, `Dr`/`Cr` markers, 2- or 3-column Debit/Credit/Balance
  layouts) statement formats — see [Regional statement formats](#regional-statement-formats)

## Regional statement formats

The parser was built against US formats first, then extended for India.
Both are covered by sample PDFs in [`samples/`](./samples) — see
[Try it with sample statements](#try-it-with-sample-statements) below.

| | US | India |
|---|---|---|
| Date order | month-first (`03/14/2024`) | day-first (`14/03/2024` or `14-03-2024`) — auto-detected, or set manually with the "Date format" control above the upload box |
| Amount sign | plain = charge, `CR` suffix = credit | plain = charge, `Dr`/`Cr` suffix = explicit debit/credit |
| Statement layout | one trailing amount per line (most credit cards) | credit cards: one amount + `Dr`/`Cr`; bank accounts: 2 columns (amount, running balance) or 3 columns (debit, credit, balance) |
| Currency | `$` | `₹`, `Rs.`, `INR`, or no symbol (all recognized; dashboard renders ₹) |

Auto-detection scans for an unambiguous date (day > 12) first, then for
India-specific hints (`₹`, `IFSC`, `UPI`, `GSTIN`, `NEFT`, `IMPS`) in the
statement text, and defaults to month-first if neither is found. If a
statement is read with the wrong date order, override it with the
**Date format** selector above the upload box before re-uploading.

## Architecture

The app is a static Vite + React + TypeScript site. All statement logic
lives in small, individually tested modules under `src/lib/`:

| Module | Responsibility |
|---|---|
| `pdf.ts` | pdf.js wrapper — extracts positioned text and reconstructs lines per page |
| `dateFormat.ts` | Infers month-first vs. day-first dates from the statement text |
| `currency.ts` | Infers the statement's currency and formats amounts for display |
| `parseStatement.ts` | Generic line parser: leading date + 1–3 trailing amount columns → transaction |
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
- **Date format** is auto-detected per statement (see
  [Regional statement formats](#regional-statement-formats)) with a manual
  override. A genuinely ambiguous date (day ≤ 12 in both positions, no
  India hints in the document) falls back to month-first, so a statement
  with no unambiguous dates and no recognized hints can still be misread —
  use the override if so.
- **Amount conventions:** a line with one trailing amount is a charge
  unless marked `CR`/`Cr`, parenthesized, negative, or matching a
  payment/refund keyword. Two trailing amounts are read as
  `[transaction, running balance]`; three as `[debit, credit, balance]`.
  Four or more trailing numbers on one line are too ambiguous to guess at
  and are skipped rather than risk a wrong sign or amount.
- **Currency is detected, not converted.** The symbol printed on the
  statement (`$`, `₹`/`Rs.`/`INR`, `£`, `€`) sets how the dashboard renders
  amounts — rupee figures show as ₹ with lakh grouping (₹1,23,456). An
  Indian statement that prints no symbol at all is recognized by its
  UPI/NEFT/IFSC vocabulary or its `Dr`/`Cr` markers. Override a wrong guess
  with the **Currency** selector above the upload box. Values are never
  converted between currencies — they are shown as printed, so mixing
  statements in different currencies would produce meaningless totals.
- The generic parser aims for broad coverage rather than per-bank
  perfection — check the table after import and correct categories inline.
  If a specific bank's layout doesn't parse correctly, its statement lines
  likely don't match any of the shapes above.

## Try it with sample statements

[`samples/`](./samples) has four synthetic (not real) statement PDFs — run
the app (`npm run dev`) and drop one in:

| File | Format |
|---|---|
| `us-credit-card-statement.pdf` | US credit card — month-first dates, plain amounts, one `CR` credit |
| `us-bank-statement.pdf` | US checking account — payroll deposit and a refund, both inferred as income from their description |
| `india-credit-card-statement.pdf` | India credit card — day-first dates, `Dr`/`Cr` markers |
| `india-bank-statement.pdf` | India savings account — day-first dates, UPI/NEFT descriptions, 3-column Debit/Credit/Balance layout |

Regenerate them any time with `npm run samples` (uses `pdf-lib`, a dev
dependency — nothing is added to the production bundle). The same files
are also asserted against in `e2e/samples.spec.ts`, so a broken parser
change fails CI, not just a manual check.

## Development

```bash
npm install
npm run dev
```

## Test & lint

```bash
npm run test   # unit tests (vitest)
npm run e2e    # browser tests (Playwright — real Chrome locally, Chromium in CI)
npm run lint
```

The end-to-end suite generates a synthetic statement PDF at test time,
uploads it into the running app, and verifies parsing, categorization,
dedupe, persistence, CSV export — and that **zero network requests leave
localhost** while a statement is processed.

## Build

```bash
npm run build
npm run preview
```

## Deployment (GitHub Pages)

This tool lives in the [`personal-tools`](../) monorepo and owns the root
of that repo's Pages site (`/personal-tools/`) — the workflows and
`vite.config.ts`'s `REPO_NAME` assume that, and it stays that way because
this URL is already shared publicly. Other tools added later (e.g.
[`lipikala`](../lipikala)) live at their own subpath instead, so this
one's `base` never has to move.

1. In the repository's **Settings → Pages**, set **Source** to
   **GitHub Actions**.
2. Push to `main` with changes under `expense-tracker/`.
   [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) (at
   the repo root) builds every tool in the monorepo and publishes them
   together as one Pages artifact — this tool at the root, others at their
   subpath; a pull request instead triggers
   [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) (lint, test,
   build, e2e) without deploying, scoped to `expense-tracker/**` changes
   so it doesn't run for other tools in this repo.
4. The published URL appears in the Actions run summary and under
   **Settings → Pages**.
