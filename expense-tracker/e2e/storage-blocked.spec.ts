import { expect, test } from '@playwright/test'
import { PDFDocument, StandardFonts } from 'pdf-lib'

// The docs tell privacy-conscious users they can run this in a private
// window or with site data blocked. In the strictest of those modes
// (Safari's "Block all cookies", some managed browsers) merely *touching*
// window.localStorage throws a SecurityError — so the app has to work with
// no persistence at all, and "Clear all data" must still clear the screen.
const LINES = [
  'GLOBAL BANK STATEMENT',
  'Statement Period: 01-03-2024 to 31-03-2024',
  '',
  '05-03-2024 UPI-SWIGGY BANGALORE 450.00 Dr',
  '12-03-2024 NEFT CR-ACME CORP-SALARY 55000.00 Cr',
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

test.beforeEach(async ({ page }) => {
  // Runs before any page script: every localStorage access throws, exactly
  // as it does when a browser blocks site data outright.
  await page.addInitScript(() => {
    const boom = () => {
      throw new DOMException('The operation is insecure.', 'SecurityError')
    }
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get: boom,
    })
  })
})

test('parses statements and renders the dashboard with storage blocked', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', (e) => pageErrors.push(e.message))

  await page.goto('./')
  await page.setInputFiles('input[type="file"]', {
    name: 'statement.pdf',
    mimeType: 'application/pdf',
    buffer: await makePdf(),
  })

  await expect(page.getByText('Added 2 new transactions.')).toBeVisible()
  await expect(page.getByText('UPI-SWIGGY BANGALORE')).toBeVisible()
  await expect(page.getByText('Spend by category')).toBeVisible()

  expect(pageErrors).toEqual([])
})

test('"Clear all data" clears the screen even when storage is unreachable', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', (e) => pageErrors.push(e.message))

  await page.goto('./')
  await page.setInputFiles('input[type="file"]', {
    name: 'statement.pdf',
    mimeType: 'application/pdf',
    buffer: await makePdf(),
  })
  await expect(page.getByText('Added 2 new transactions.')).toBeVisible()

  page.on('dialog', (d) => d.accept())
  await page.getByRole('button', { name: 'Clear all data' }).click()

  // The regression this guards: clearAllData() used to throw here, which
  // aborted the handler before it wiped React state — the user pressed the
  // privacy control and their transactions stayed on screen.
  await expect(page.getByText('All locally stored data has been cleared.')).toBeVisible()
  await expect(page.getByText('UPI-SWIGGY BANGALORE')).toHaveCount(0)
  await expect(page.getByText('Step 1')).toBeVisible()

  expect(pageErrors).toEqual([])
})
