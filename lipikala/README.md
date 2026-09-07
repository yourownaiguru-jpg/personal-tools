# Lipikāla

Type a name and see it re-set in a historic Indian script — Brahmi,
Grantha, Siddhaṃ, Śāradā, Bhaiksuki, Nandinagari — as it might have
appeared cut in stone, on a copper plate, or on a palm leaf. Everything
runs in your browser; nothing you type is ever sent anywhere.

> **New here? Read [the guide](./GUIDE.md).** It explains how to use the
> tool, what "authentic" vs. "approximation" means, and why some eras look
> the way they do.

## How it works

1. Type a name — in roman letters, or directly in any of eight modern
   Indian scripts (Tamil, Kannada, Telugu, Malayalam, Devanagari, Bengali,
   Gujarati, Odia).
2. Pick a language and a point on its timeline.
3. The name is parsed into its underlying sounds and re-set letter for
   letter in that era's script, rendered with the actual Unicode code
   points for that script — not a font trick over a modern script.
4. Download the result as an image, or copy a link that reproduces the
   exact name, language, era, and surface for someone else.

See [PRIVACY.md](./PRIVACY.md) for what does and doesn't leave your
browser.

## Features

- Roman input (double a vowel for a long one: `aa`, `ee`, `oo`) or direct
  typing in any of eight modern Indic scripts
- Six historic scripts with real Unicode encodings: Brahmi, Grantha,
  Siddhaṃ, Śāradā, Bhaiksuki, Nandinagari
- A researched timeline per language (Tamil, Kannada, Telugu, Malayalam,
  Sanskrit/Hindi, Bengali, Gujarati, Odia), each era dated and sourced to
  a specific inscription, dynasty, or manuscript tradition
- Every era is labeled **authentic** (its own script has a Unicode
  encoding) or **approximation** (it doesn't, so the closest living
  descendant stands in) — never presented as more certain than it is
- Letter-by-letter breakdown: historic glyph, modern glyph, and IAST-style
  romanization side by side
- Three plate textures (stone, copper, palm leaf), each rendered
  procedurally — no photographs, so nothing is licensed from a stock site
- Download as a PNG, or copy a shareable link that restores the exact
  name/language/era/surface

## Architecture

A static Vite + TypeScript site — no framework, ~13 modules, no runtime
dependencies. All transliteration logic lives in `src/lib/`:

| Module | Responsibility |
| --- | --- |
| `scripts.ts` | Per-script Unicode letter tables (historic and modern) |
| `transliterate.ts` | `parse()`: text (roman or any modern script) → phonemic tokens. `render()`: tokens → any one script's text |
| `cells.ts` | Groups tokens into letter-map cells (historic / modern / roman) |
| `data.ts` | The researched language/era/surface content |
| `state.ts` | App state, URL-hash (de)serialization for shareable links |
| `downloadImage.ts` | Canvas rendering for the downloadable PNG |
| `escapeHtml.ts` | HTML-escapes anything derived from typed text before it's interpolated — the typed name is reachable via a shared `#t=...` link, so this is a real injection boundary, not just a habit |
| `view.ts` | Renders the app's markup from state |

`main.ts` wires DOM events to state changes and re-renders on every
change, preserving the input's cursor position across re-renders.

## Origin

This tool started as a design built with [Claude
Design](https://claude.ai/code) — the transliteration tables and the
researched era content were authored there and ported here largely
unchanged; this repo adds the tests, the privacy/CSP hardening, and the
deployment.

## Development

```bash
npm install
npm run dev
```

## Test & lint

```bash
npm run test   # unit tests (vitest) — the transliteration engine, spot-checked against real Unicode code charts
npm run e2e    # browser tests (Playwright) — typing, era/language switching, download, sharing, XSS, network egress
npm run lint
```

The e2e suite asserts that typing a name never produces a network request
to anywhere other than Google Fonts (needed to render the historic
scripts) — the same zero-egress guarantee this repo's other tools make,
verified the same way.

## Build

```bash
npm run build
npm run preview
```

## Deployment (GitHub Pages)

This tool lives in the [`personal-tools`](../) monorepo, at
`/personal-tools/lipikala/` — a subpath, since
[`expense-tracker`](../expense-tracker) already owns the site's root and
that URL is shared publicly. Push to `main` with changes under
`lipikala/`, and
[`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) builds
and publishes both tools together; a pull request instead triggers
[`.github/workflows/ci-lipikala.yml`](../.github/workflows/ci-lipikala.yml)
(lint, test, build, e2e) without deploying.
