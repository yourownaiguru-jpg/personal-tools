# Growing Citizens

A login-free, static website for parents of children in Grades 1–6. It turns the accompanying international education research into short, practical home-learning challenges.

## Live site

Once the repository's GitHub Pages workflow has run, the site is available at
[`/growing-citizens/`](https://yourownaiguru-jpg.github.io/personal-tools/growing-citizens/).

No build process, account system, database, or server is required. Parent progress is stored only in that browser's local storage.

## Grades & Content

- **Grades 1–4:** Bridge curriculum (40 weeks each) focusing on foundational skills with practical applications
- **Grade 5:** Bridge curriculum (40 weeks) focusing on percentages, fractions, decimals, ratios, argumentative writing, hypothesis testing, and consent
- **Grade 6:** Bridge curriculum (40 weeks) focusing on equations, statistics, analytical reading, circuits, ecosystems, digital citizenship, and mental health

Each grade includes 30–40 weekly challenges, project showcases, and buffer weeks for review and rest.

## Files

- `index.html` — page structure and content (includes Grade 5–6 buttons)
- `styles.css` — responsive visual design
- `app.js` — curriculum data (5 & 6 added), filters, grade selection, challenge details, and local-only progress

## Key Features

- **No login required** — parents use any browser
- **Offline-ready** — works without internet after first load
- **Local progress** — achievements stored only on the family's device
- **Research-backed** — curriculum built from NCERT (India) and international standards (US, UK, Singapore, Japan, Finland)
- **Whole-child focus** — academics + practical life skills (consent, emotions, self-care, digital literacy)

## Integration

Grade 5 and 6 curricula from the companion `/curriculum/` folder have been integrated into the app. Full teaching scripts, parent prep notes, and activity details are available in:
- `/curriculum/grade-5.md` (1173 lines, 33 modules)
- `/curriculum/grade-6.md` (1347 lines, 33 modules)

Teachers and parents can reference these detailed guides alongside the app's weekly prompts.

---

**Status:** Grades 1–6 complete and live. Ready for deployment to GitHub Pages.
