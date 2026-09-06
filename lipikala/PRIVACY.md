# Privacy & Data Handling

Nothing you type into Lipikāla is ever sent anywhere. This is a static
site with no backend, no analytics, and no accounts.

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

## The one network request this app does make

Rendering six historic scripts (Brahmi, Grantha, Siddhaṃ, Śāradā,
Bhaiksuki, Nandinagari) needs specific Noto fonts that no device ships
with. Those fonts — and the app's own body/heading fonts — are loaded
from Google Fonts on page load.

That request is for **fonts, not your data**: it happens once, when the
page loads, and carries none of what you type. But it is still a real
request to Google's servers, and Google's standard server logs will show
that this page was visited, from your IP address, at that time — the same
as any site using Google Fonts. If that's a distinction you care about,
you can verify it yourself (see below) or avoid the tool.

The app's Content-Security-Policy — enforced by your browser, not just a
promise in this document — allows style and font requests to
`fonts.googleapis.com`/`fonts.gstatic.com` and nothing else external.
`connect-src 'self'` blocks any script (this app's own, or a hypothetical
injected one) from sending a `fetch`/`XHR`/WebSocket request anywhere,
which is the mechanism that would carry what you typed off the page. A
font file has no way to do that.

## No analytics, no tracking

No third-party analytics, telemetry, or tracking scripts of any kind.

## Verifying this yourself

- Read the source — `src/lib/` has no networking code beyond what the
  browser does to fetch its own bundled assets.
- Open your browser's Network tab while using the app. You'll see the
  page's own files load, one request to `fonts.googleapis.com` for the
  font CSS, then a handful of font file requests to `fonts.gstatic.com` —
  and nothing else, no matter what you type.
- `e2e/lipikala.spec.ts` asserts exactly this on every CI run: that typing
  a name produces no request to any host besides Google Fonts.
