import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

/**
 * Extracts text from a PDF entirely in the browser. The file's bytes only
 * ever live in memory for the duration of this call — nothing is written
 * to disk or sent over the network.
 *
 * Returns one array of reconstructed text lines per page, built by
 * grouping text items that share a vertical position (pdf.js exposes text
 * as unordered positioned glyphs/words, not lines).
 */
export async function extractLinesFromPdf(file: File): Promise<string[][]> {
  const data = await file.arrayBuffer()
  const doc = await pdfjsLib.getDocument({ data }).promise

  const pages: string[][] = []
  try {
    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum)
      const content = await page.getTextContent()

      const lineMap = new Map<number, { x: number; str: string }[]>()
      for (const item of content.items) {
        if (!('str' in item) || !item.str.trim()) continue
        const y = Math.round(item.transform[5])
        const x = item.transform[4]
        const bucket = [...lineMap.keys()].find((key) => Math.abs(key - y) <= 2)
        const key = bucket ?? y
        if (!lineMap.has(key)) lineMap.set(key, [])
        lineMap.get(key)!.push({ x, str: item.str })
      }

      const sortedY = [...lineMap.keys()].sort((a, b) => b - a)
      const lines = sortedY
        .map((y) =>
          lineMap
            .get(y)!
            .sort((a, b) => a.x - b.x)
            .map((i) => i.str)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim(),
        )
        .filter(Boolean)

      pages.push(lines)
      page.cleanup()
    }
  } finally {
    await doc.destroy()
  }

  return pages
}

/** Best-effort guess at the statement year, for dates printed without one. */
export function guessStatementYear(pages: string[][]): number {
  const text = pages.flat().join(' ')
  const match = text.match(/\b(20\d{2})\b/)
  return match ? parseInt(match[1], 10) : new Date().getFullYear()
}
