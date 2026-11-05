# Growing Citizens

A login-free, static website for parents of children in Grades 1–6. It turns the accompanying international education research into short, practical home-learning challenges.

## Live site

Once the repository's GitHub Pages workflow has run, the site is available at
[`/growing-citizens/`](https://yourownaiguru-jpg.github.io/personal-tools/growing-citizens/).

No build process, account system, database, or server is required. Parent progress is stored only in that browser's local storage.

## Grades & Content

- **Grades 1–4:** Bridge curriculum (40 weeks each) with foundational skills and practical applications
- **Grade 5:** Bridge curriculum (40 weeks) — percentages, fractions, decimals, ratios, argumentative writing, hypothesis testing, consent & body autonomy
- **Grade 6:** Bridge curriculum (40 weeks) — equations, statistics, analytical reading, circuits, ecosystems, digital citizenship, mental health & self-care

Each grade includes 30–40 weekly challenges, project showcases, and buffer weeks for review and rest.

## Files

- `index.html` — page structure and content (includes Grade 5–6 buttons)
- `styles.css` — responsive visual design  
- `app.js` — curriculum data for all 6 grades, filters, grade selection, challenge details, and local-only progress tracking

## Key Features

- **No login required** — parents use any browser
- **Offline-ready** — works without internet after first load
- **Local progress** — achievements stored only on the family's device
- **Research-backed** — curriculum built from NCERT (India) and international standards (US, UK, Singapore, Japan, Finland)
- **Whole-child focus** — academics + practical life skills (consent, emotions, self-care, digital literacy, responsibility)

## Companion Curricula

Full teaching scripts, parent prep notes, and activity details are available in companion files:
- `/curriculum/grade-5.md` (1,173 lines, 33 modules, 40-week structure)
- `/curriculum/grade-6.md` (1,347 lines, 33 modules, 40-week structure)

Parents and teachers can reference these detailed guides alongside the app's weekly prompts for deeper context and extension activities.

## Integration

Grade 5 and 6 curricula have been integrated into the Growing Citizens app from the separate bridge curriculum project. Data flows from the app's grid interface (week-by-week challenges) into detailed teaching scripts in the companion markdown files.

---

**Status:** Grades 1–6 complete and live. Ready for GitHub Pages deployment. All curricula research-backed and internationally aligned.
