# Colour Studio

A free, no-login colour-combination finder for painters, interior decisions and
fashion. It is inspired by the Japanese colour book series *A Dictionary of
Color Combinations* (*Haishoku Sōkan*, 1933–34) by Sanzo Wada.

## Live site

[`/colour-studio/`](https://yourownaiguru-jpg.github.io/personal-tools/colour-studio/)

## What it does

- **All 348 Wada combinations** (pairs, trios and sets of four) built from 159 named colours.
  You can filter them by size, by character (warm, cool, muted, vivid, light, dark) or by colour name.
- **Start from one colour**: pick any of the 159 swatches to see every combination that uses it.
- **Preview for your use**: *Painting*, *Interiors* or *Fashion*. Each one shows the palette
  on a simple canvas, room or outfit and gives the colours roles in about 60·30·10 proportions.
- **Codes for every colour**: HEX (click to copy), RGB and CMYK. Painting mode also gives an
  acrylic mixing starting point.
- **Value check**: switches the preview to greyscale so you can test light, mid and dark contrast.
- **Collections**: colour-wheel harmonies, 26 traditional Japanese colours (*dentō-shoku*),
  12 Heian layered-robe palettes (*kasane no irome*), five limited painter's palettes, and
  Itten's four seasons.

## Privacy

There's no account, analytics, cookies or server. The page loads its own HTML, CSS, JS, fonts and
`colour-data.json` from this site and makes no other network requests.

## Files

- `index.html`: page structure and static copy
- `styles.css`: design tokens and layout (no framework)
- `app.js`: filtering, previews, copy-to-clipboard (vanilla JS, no dependencies)
- `colour-data.json`: the colours, combinations and collections
- `fonts/`: self-hosted [Archivo](https://fonts.google.com/specimen/Archivo) (SIL Open Font License 1.1)

There is no build step: GitHub Pages serves the folder as it is. To run it locally:

```sh
cd colour-studio && python3 -m http.server 8000   # then open http://localhost:8000
```

(It must be served over HTTP; opening `index.html` as a file blocks the data fetch.)

## Sources and accuracy

- Wada colour values and combination membership come from Matt DesLauriers'
  [dictionary-of-colour-combinations](https://github.com/mattdesl/dictionary-of-colour-combinations)
  dataset (MIT licence), a digitisation of the 2010 Seigensha reprint. They were cross-checked
  against that dataset: all 159 colours and 348 combinations match.
- Japanese colour values follow commonly published digital values, which vary between sources.
  Heian layer palettes are approximate reconstructions.
- Acrylic mixing hints are computed starting points based on typical tube colours. Brands vary.
- Screens, inks, fabrics and pigments all render colour differently, so always test a physical sample.

This project is not affiliated with Seigensha or the Wada estate.
