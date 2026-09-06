# Personal Tools

A collection of small, self-contained tools. Each one lives in its own
subfolder with its own README, dependencies, and (where it has one) CI.

| Tool | What it does |
|---|---|
| [`expense-tracker/`](./expense-tracker) | Client-side-only expense dashboard that parses bank/credit card PDF statements entirely in the browser — nothing is ever uploaded or stored server-side. Supports both US and India statement formats. **[Guide](./expense-tracker/GUIDE.md)** · **[Privacy](./expense-tracker/PRIVACY.md)** |
| [`lipikala/`](./lipikala) | Types a name and re-sets it in a historic Indian script (Brahmi, Grantha, Siddhaṃ, Śāradā, Bhaiksuki, Nandinagari) as it might have looked cut in stone, on copper, or on a palm leaf — entirely client-side. **[Guide](./lipikala/GUIDE.md)** · **[Privacy](./lipikala/PRIVACY.md)** |

## Conventions

- Each tool is independent: its own `package.json`, its own test suite, no
  shared dependencies between tools unless a tool explicitly needs one.
- GitHub Actions workflows for a tool live at the repo root under
  `.github/workflows/` (required by GitHub) but are scoped to that tool's
  subfolder via `paths:` filters and `working-directory`, so one tool's CI
  doesn't run on another tool's changes.
- GitHub Pages serves `expense-tracker`'s build at the site's root (that
  URL is already shared publicly, so it stays put) and every other tool at
  its own subpath — `lipikala` lives at `/lipikala/`. A single combined
  workflow (`.github/workflows/deploy.yml`) builds every tool and publishes
  them together as one Pages artifact; each tool's own `ci.yml` only
  validates pull requests and is scoped to that tool's subfolder via
  `paths:` filters, same as the convention above.
