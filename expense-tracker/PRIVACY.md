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

## The one thing this app now counts

The app loads [GoatCounter](https://www.goatcounter.com/), an open-source,
cookieless visit counter, so the person who built this can see how many
people use it — nothing more specific than that.

- It fires **once, on page load**, before you've chosen a file. It has no
  way to know anything about a statement, because it runs before one
  exists.
- It sets no cookies and reads nothing from `localStorage`. GoatCounter
  doesn't build visitor profiles or track you across sites — its entire
  design goal is a simple count, not surveillance.
- It sends the page URL and referrer to `yourownaiguru.goatcounter.com`,
  which is the one thing this app's Content-Security-Policy now allows
  beyond `'self'` (see `vite.config.ts`). Nothing else is permitted to
  leave the page — the CSP still blocks any other network destination.

This is the one exception to "no analytics, no tracking" this app has ever
made, and it's the only one the CSP allows. Every claim below still holds
for the thing that actually matters here — your statement.

## No analytics, no tracking of your financial data

Beyond that one page-load count, this app includes no third-party
analytics, telemetry, or tracking scripts. Your statement and the
transactions parsed from it are never sent anywhere, to GoatCounter or
otherwise — the CSP's `connect-src` permits exactly `'self'` and the
GoatCounter endpoint above, nothing else, so even a hypothetical injected
script could not send your data anywhere else. (Pages can't set response
headers, so the policy ships as a `<meta>` tag; it is enforcement-grade in
all modern browsers.)

## Verifying this yourself

Because this is open-source and runs as a static site, you can:
- Read the source, in particular `src/lib/` for parsing/storage code.
- Open your browser's Network tab while using the app. You'll see one
  request to GoatCounter when the page loads, and — no matter what
  statement you upload — nothing else, ever.
- The Playwright suite (`e2e/expense-tracker.spec.ts`) asserts on every CI
  run that parsing a statement makes **zero** requests to any origin
  besides GoatCounter's visit-count endpoint.
