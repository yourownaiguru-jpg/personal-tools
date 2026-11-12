# Personal Tools

**[All tools (home page)](https://yourownaiguru-jpg.github.io/personal-tools/tools/)** · **[Work with me](https://yourownaiguru-jpg.github.io/personal-tools/work-with-me/)**

A collection of small, self-contained tools. Each one lives in its own
subfolder with its own README, dependencies, and (where it has one) CI.

| Tool | What it does |
|---|---|
| [`expense-tracker/`](./expense-tracker) | Client-side-only expense dashboard that parses bank/credit card PDF statements entirely in the browser — nothing is ever uploaded or stored server-side. Supports both US and India statement formats. **[Guide](./expense-tracker/GUIDE.md)** · **[Privacy](./expense-tracker/PRIVACY.md)** · **[Open site](https://yourownaiguru-jpg.github.io/personal-tools/)** |
| [`lipikala/`](./lipikala) | Types a name and re-sets it in a historic Indian script (Brahmi, Grantha, Siddhaṃ, Śāradā, Bhaiksuki, Nandinagari) as it might have looked cut in stone, on copper, or on a palm leaf — entirely client-side. **[Guide](./lipikala/GUIDE.md)** · **[Privacy](./lipikala/PRIVACY.md)** · **[Open site](https://yourownaiguru-jpg.github.io/personal-tools/lipikala/)** |
| [`growing-citizens/`](./growing-citizens) | A research-informed, no-login home-learning companion for parents of children in Grades 1–8. Includes 40-week curricula per grade with hands-on challenges, parent prompts, subject filters, and on-device progress tracking. **[Open site](https://yourownaiguru-jpg.github.io/personal-tools/growing-citizens/)** |
| [`vidya-shakti/`](./vidya-shakti) | A no-login, no-tracking guide to 46 central and state government programmes (courses, training, fellowships) that help women at home learn, earn and become financially independent — filter by qualification, state and goal. Entirely client-side. **[Guide](./vidya-shakti/GUIDE.md)** · **[Privacy](./vidya-shakti/PRIVACY.md)** · **[Open site](https://yourownaiguru-jpg.github.io/personal-tools/vidya-shakti/)** |
| [`colour-studio/`](./colour-studio) | A free, no-login colour-combination finder for painting, interiors and fashion, inspired by Sanzo Wada's Japanese colour book series *A Dictionary of Color Combinations*. Browse all 348 combinations or start from one of 159 colours, preview each palette on a canvas, room or outfit, and copy HEX, RGB and CMYK codes with acrylic mixing hints. Also includes harmonies, Japanese dye colours, Heian layered palettes and limited palettes. **[Open site](https://yourownaiguru-jpg.github.io/personal-tools/colour-studio/)** |

## Site pages

- [`tools/`](./tools) is the home page that lists every tool. It also holds `site.css`, which the
  work-with-me page shares.
- [`work-with-me/`](./work-with-me) is the enquiry page. Its form posts to
  [Web3Forms](https://web3forms.com), which emails the enquiry to the owner. The access key is set
  at the top of `work-with-me/form.js`; until it is set, the page shows Instagram and X message
  buttons instead of the form. No third-party script is loaded.
- Every tool's footer links to both pages.

## Conventions

- Each tool is independent: its own `package.json`, its own test suite, no
  shared dependencies between tools unless a tool explicitly needs one.
- GitHub Actions workflows for a tool live at the repo root under
  `.github/workflows/` (required by GitHub) but are scoped to that tool's
  subfolder via `paths:` filters and `working-directory`, so one tool's CI
  doesn't run on another tool's changes.
- GitHub Pages serves `expense-tracker`'s build at the site's root (that
  URL is already shared publicly, so it stays put) and every other tool at
  its own subpath — `lipikala` lives at `/lipikala/`, Vidya Shakti at `/vidya-shakti/`,
  Growing Citizens at `/growing-citizens/` and Colour Studio at `/colour-studio/`. A single combined workflow
  (`.github/workflows/deploy.yml`) builds or copies every tool and publishes
  them together as one Pages artifact; each tool's own `ci.yml` only
  validates pull requests and is scoped to that tool's subfolder via
  `paths:` filters, same as the convention above.
