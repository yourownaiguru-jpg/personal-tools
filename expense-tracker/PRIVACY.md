# Privacy & Data Handling

This app is designed so that your financial documents never leave your
device.

## What happens to a statement you upload

- The PDF you select is read with the browser's `File` API and handed
  directly to [pdf.js](https://mozilla.github.io/pdf.js/), which runs
  entirely client-side (WebAssembly / JS, no network calls).
- Text is extracted from the PDF in memory, parsed into transactions, and
  then the PDF bytes are discarded. **The PDF file itself is never written
  to disk, never sent over the network, and never stored anywhere.**
- There is no backend server for this app. It is a static site — there is
  nothing for it to upload to even if it wanted to.

## What is stored

- Only the **parsed transaction data** (date, description, amount,
  category, and which statement/account it came from) is optionally saved
  to your browser's `localStorage`, so your dashboard persists across
  page reloads.
- This stored data never leaves your browser. It is not synced, backed up,
  or transmitted anywhere by this app.
- You can clear all stored data at any time with the app's
  "Clear all data" control, or by clearing your browser's site data for
  this origin.
- The CSV export is generated in the browser and saved directly to your
  machine — it is a local download, not a network transfer.

## One caveat: shared browser storage on GitHub Pages

Browsers scope `localStorage` to an *origin* (the domain), not to a path.
When this app is hosted on a GitHub Pages account site (e.g.
`<user>.github.io/personal-tools/`), every other page published under
that same `<user>.github.io` domain — including other tools added to
this repository later, or any other repository's Pages site on the same
account — runs on the same origin and **can read the transaction data
this app stores**.

Practical guidance:
- This only matters for pages *you* (the account owner) publish; other
  people's sites are different origins and have no access.
- If you host untrusted or third-party code anywhere on the same
  `github.io` account, use "Clear all data" here first, or run this tool
  on its own domain.
- The stored data is parsed transactions only — never the PDF itself.

## No analytics, no tracking

This app does not include any third-party analytics, telemetry, or
tracking scripts.

The production build also ships a Content-Security-Policy that blocks
scripts from any other origin and blocks all network connections
(`connect-src 'self'`) — so even a hypothetical injected script could
not send your data anywhere. (Pages can't set response headers, so the
policy ships as a `<meta>` tag; it is enforcement-grade in all modern
browsers.)

## Verifying this yourself

Because this is open-source and runs as a static site, you can:
- Read the source, in particular `src/lib/` for parsing/storage code.
- Open your browser's Network tab while using the app and confirm no
  requests are made after the page and its assets load.
- The Playwright suite (`e2e/expense-tracker.spec.ts`) asserts on every
  CI run that parsing a statement makes **zero** requests to any
  non-localhost origin.
