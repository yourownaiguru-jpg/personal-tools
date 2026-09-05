# Personal Tools

A collection of small, self-contained tools. Each one lives in its own
subfolder with its own README, dependencies, and (where it has one) CI.

| Tool | What it does |
|---|---|
| [`expense-tracker/`](./expense-tracker) | Client-side-only expense dashboard that parses bank/credit card PDF statements entirely in the browser — nothing is ever uploaded or stored server-side. Supports both US and India statement formats. **[Guide](./expense-tracker/GUIDE.md)** · **[Privacy](./expense-tracker/PRIVACY.md)** |

## Conventions

- Each tool is independent: its own `package.json`, its own test suite, no
  shared dependencies between tools unless a tool explicitly needs one.
- GitHub Actions workflows for a tool live at the repo root under
  `.github/workflows/` (required by GitHub) but are scoped to that tool's
  subfolder via `paths:` filters and `working-directory`, so one tool's CI
  doesn't run on another tool's changes.
- GitHub Pages currently serves a single tool's build as the whole site
  (see `expense-tracker/README.md`'s deployment section). Once a second
  tool needs a public deployment, Pages routing will move to per-tool
  subpaths.
