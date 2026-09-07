import { expect, test, type Page } from '@playwright/test'
import { PDFDocument, StandardFonts } from 'pdf-lib'

// Guards the app's core promise: the PDF's bytes are never persisted, and
// neither is the extracted text beyond the parsed transactions themselves.
//
// The sample below deliberately puts sensitive-looking data on lines that
// are NOT transactions (account holder, account number, IFSC). Those lines
// are read into memory during parsing, so a careless refactor — caching the
// raw `pages` array, stashing the File for "re-parse later" — would leak
// them into storage. These assertions fail loudly if that ever happens.
const HOLDER = 'ACCOUNT-HOLDER-SENTINEL-QX7'
const ACCOUNT_NO = 'ACCTNO-SENTINEL-99881122'
const IFSC = 'IFSCSENTINEL0001'

const LINES = [
  'GLOBAL BANK - SAVINGS ACCOUNT STATEMENT',
  `Account Holder: ${HOLDER}`,
  `Account No: ${ACCOUNT_NO}  IFSC: ${IFSC}`,
  'Statement Period: 01-03-2024 to 31-03-2024',
  '',
  '05-03-2024 UPI-SWIGGY BANGALORE 450.00 Dr',
  '12-03-2024 NEFT CR-ACME CORP-SALARY 55000.00 Cr',
  '',
  'Page 1 of 1',
]

async function makePdf(): Promise<Buffer> {
  const doc = await PDFDocument.create()
  const page = doc.addPage([612, 792])
  const font = await doc.embedFont(StandardFonts.Helvetica)
  let y = 750
  for (const line of LINES) {
    if (line) page.drawText(line, { x: 50, y, size: 11, font })
    y -= 18
  }
  return Buffer.from(await doc.save())
}

/** Everything this origin has persisted, as one searchable blob. */
async function dumpAllStorage(page: Page) {
  return page.evaluate(async () => {
    const read = (s: Storage) =>
      Object.fromEntries(
        Array.from({ length: s.length }, (_, i) => s.key(i)!).map((k) => [k, s.getItem(k) ?? '']),
      )

    const idbNames = indexedDB.databases ? (await indexedDB.databases()).map((d) => d.name) : []

    return {
      localStorage: read(window.localStorage),
      sessionStorage: read(window.sessionStorage),
      indexedDbNames: idbNames.filter(Boolean) as string[],
      cacheNames: 'caches' in window ? await caches.keys() : [],
      cookies: document.cookie,
    }
  })
}

test('a parsed statement leaves no PDF bytes and no non-transaction text in storage', async ({
  page,
}) => {
  await page.goto('./')
  await page.setInputFiles('input[type="file"]', {
    name: 'sensitive-statement.pdf',
    mimeType: 'application/pdf',
    buffer: await makePdf(),
  })
  await expect(page.getByText('Added 2 new transactions.')).toBeVisible()

  const storage = await dumpAllStorage(page)
  const everything = JSON.stringify(storage)

  // 1. No raw PDF, in any encoding the app could plausibly have used.
  expect(everything).not.toContain('%PDF')
  expect(everything).not.toContain('JVBERi') // base64 of "%PDF"
  expect(everything).not.toContain('endobj')

  // 2. No header/identity text — proves only parsed transactions persist,
  //    not the full extracted page text the parser worked from.
  expect(everything).not.toContain(HOLDER)
  expect(everything).not.toContain(ACCOUNT_NO)
  expect(everything).not.toContain(IFSC)

  // 3. Nothing persisted outside the three known localStorage keys. The
  //    currency key holds a three-letter code and nothing else — it is
  //    listed here so that any *new* key has to be justified in this test.
  expect(Object.keys(storage.localStorage).sort()).toEqual([
    'expense-tracker:currency:v1',
    'expense-tracker:rules:v1',
    'expense-tracker:transactions:v1',
  ])
  expect(Object.keys(storage.sessionStorage)).toEqual([])
  expect(storage.indexedDbNames).toEqual([])
  expect(storage.cacheNames).toEqual([])
  expect(storage.cookies).toBe('')

  // 4. Sanity: the transactions that SHOULD persist actually did, so the
  //    assertions above aren't passing simply because nothing was stored.
  expect(everything).toContain('SWIGGY BANGALORE')
  expect(everything).toContain('55000')
})

test('the file input holds no reference to the file after parsing', async ({ page }) => {
  await page.goto('./')
  await page.setInputFiles('input[type="file"]', {
    name: 'sensitive-statement.pdf',
    mimeType: 'application/pdf',
    buffer: await makePdf(),
  })
  await expect(page.getByText('Added 2 new transactions.')).toBeVisible()

  // UploadZone clears input.value after each selection, so the browser
  // isn't left holding the File handle once parsing is done.
  const remaining = await page.evaluate(
    () => (document.querySelector('input[type="file"]') as HTMLInputElement).files?.length ?? 0,
  )
  expect(remaining).toBe(0)
})
