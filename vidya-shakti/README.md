# Vidya Shakti — Homemaker Learning Finder

A no-login, no-tracking guide to 46 government courses, training schemes and fellowships that help women at home learn, earn and become financially independent. Everything runs in the browser.

> **New here? Read the [guide](GUIDE.md).** Privacy details are in [PRIVACY.md](PRIVACY.md).

*Vidya Shakti* (विद्या शक्ति) means "the strength of knowledge": learning as the route to independence.

## How it works

The programme list (`src/data/programmes.json`) is bundled into the page at build time. Filtering happens in memory in your browser. There is no backend, no database, no account and no network call after the page loads.

## Features

- Landing page with a "Dates to watch" panel (deadlines and expected openings)
- Goal shortcuts: start earning, start a business, move into tech, finish education, return after a career break
- Filters: search, qualification, state, area of interest, cost (free / stipend / low cost), women-only, career-break, open now
- Expandable cards with eligibility, cost, mode, states, status, official link and the source used
- Full list downloadable as CSV
- Accessible: skip link, keyboard and screen-reader friendly, 44px touch targets, reduced-motion aware

## Architecture

| Module | Role |
| --- | --- |
| `src/data/programmes.json` | The researched dataset (source of truth; also published as `public/programmes.csv`) |
| `src/data/programmes.ts` | Typed access to the data, goals and "Dates to watch" |
| `src/lib/types.ts` | `Programme`, `Filters` types |
| `src/lib/filter.ts` | Pure filter, sort and status logic (unit tested) |
| `src/App.tsx` | Single-page UI; owns all state (in memory only) |
| `src/styles.css` | Styling ported from the Claude Design file |
| `public/fonts/` | Self-hosted Bricolage Grotesque + Figtree (SIL OFL) |

## Limitations & assumptions

- Dates marked *Expected* come from past cycles. Always confirm on the official site.
- The qualification filter matches programmes that list your level; some accept others.
- Data is a snapshot (last checked 5 Nov 2026). Schemes change; update `programmes.json` and `public/programmes.csv` together.
- Not an official government site.

## Updating the data

1. Edit `src/data/programmes.json` (keep the same fields) and refresh `public/programmes.csv`.
2. Update `DATES` in `src/data/programmes.ts` if deadlines changed.
3. `npm run test` checks ids, links and date/goal references.

## Development

```bash
npm install
npm run dev
```

## Test & lint

```bash
npm run test   # vitest: data integrity + filter logic
npm run lint   # tsc type-check
```

## Build

```bash
npm run build
npm run preview
```

## Deployment

Static output in `dist/`, built with a relative base so it works at any sub-path. In the `personal-tools` repo it is served at `/personal-tools/vidya-shakti/` through the combined `deploy.yml` (add a build + copy step for this folder, and a path-scoped `ci.yml`).
