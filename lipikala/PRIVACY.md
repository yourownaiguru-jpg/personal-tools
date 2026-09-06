# Privacy & Data Handling

Nothing you type into Lipikāla is ever sent anywhere. This is a static
site with no backend and no accounts. It does count how many times the
page is visited — see below for exactly what that does and doesn't mean.

## What happens to what you type

- The name is parsed and rendered entirely in your browser's own
  JavaScript. There is no server for it to be sent to.
- Nothing is saved. Close or reload the tab and the name is gone — there
  is no `localStorage`, no cookie, nothing to clear.
- The **Download image** button renders a PNG on an in-memory `<canvas>`
  and saves it directly to your device — a local file write, not an
  upload.
- The **Copy link** button builds a URL that encodes the name, language,
  era, and surface in the fragment (`#t=...`) — the part after `#` is
  never sent to any server, by design of how URLs work; it only reaches
  wherever you paste the link.

## The two network requests this app does make

**Fonts.** Rendering six historic scripts (Brahmi, Grantha, Siddhaṃ,
Śāradā, Bhaiksuki, Nandinagari) needs specific Noto fonts that no device
ships with. Those fonts — and the app's own body/heading fonts — are
loaded from Google Fonts on page load. It's a static, contentless
request: it carries none of what you type.

**A visit count.** The page also loads
[GoatCounter](https://www.goatcounter.com/), an open-source, cookieless
counter, so the person who built this can see how many people use it —
nothing more specific than that. It fires once, on page load, **before
you've typed a single letter**, so it has no way to know your name even
if it wanted to. It sets no cookies and reads nothing from `localStorage`.

Both requests happen once, when the page loads, and both are real
requests to someone else's servers — Google's and GoatCounter's standard
logs will show that this page was visited, from your IP address, at that
time, the same as any site using either service. If that's a distinction
you care about, you can verify all of this yourself (see below) or avoid
the tool.

The app's Content-Security-Policy — enforced by your browser, not just a
promise in this document — allows style/font requests to
`fonts.googleapis.com`/`fonts.gstatic.com`, script/beacon requests to
`gc.zgo.at`/`yourownaiguru.goatcounter.com`, and nothing else external.
`connect-src` permits only those two hosts beyond `'self'`, which blocks
any script (this app's own, or a hypothetical injected one) from sending
a `fetch`/`XHR`/WebSocket request anywhere else — the mechanism that
would carry what you typed off the page. Neither a font file nor a
page-load visit count has any way to do that.

## No tracking of what you type

Beyond that one page-load count, this app includes no analytics,
telemetry, or tracking of your actual input. GoatCounter doesn't build
visitor profiles or follow you across sites — its whole design goal is a
simple count, not surveillance.

## Verifying this yourself

- Read the source — `src/lib/` has no networking code beyond what the
  browser does to fetch its own bundled assets.
- Open your browser's Network tab while using the app. You'll see the
  page's own files load, a request to `fonts.googleapis.com` for the font
  CSS, a handful of font files from `fonts.gstatic.com`, and one visit-
  count beacon to GoatCounter — all on page load — and nothing else, no
  matter what you type.
- `e2e/lipikala.spec.ts` asserts exactly this on every CI run: that
  typing a name produces no request to any host besides Google Fonts and
  GoatCounter, and that the visit-count request itself carries none of
  the typed text.
