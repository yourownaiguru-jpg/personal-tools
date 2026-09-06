import { expect, test } from './fixtures'
import type { Page } from '@playwright/test'
import { PDFDocument, StandardFonts } from 'pdf-lib'

// A synthetic but realistically shaped credit card statement, generated as
// a real PDF (with a text layer) at test time — no binary fixture to
// maintain, and the whole pipeline from PDF bytes to dashboard is covered.
const STATEMENT_LINES = [
  'SAMPLE BANK',
  'Statement Period: 03/01/2024 - 03/31/2024',
  'Account ending in 1234',
  '',
  'Date  Description  Amount',
  '03/01 STARBUCKS STORE #4521 5.75',
  '03/02 TRADER JOE S #102 62.40',
  '03/05 NETFLIX.COM 15.99',
  '03/12 PAYMENT RECEIVED - THANK YOU 200.00 CR',
  '03/18 WHOLE FOODS MARKET 73.22',
  '03/28 DELTA AIR LINES 412.00',
  '',
  'Page 1 of 1',
]

async function makeStatementPdf(lines: string[]): Promise<Buffer> {
  const doc = await PDFDocument.create()
  const page = doc.addPage([612, 792])
  const font = await doc.embedFont(StandardFonts.Helvetica)
  let y = 750
  for (const line of lines) {
    if (line) page.drawText(line, { x: 50, y, size: 11, font })
    y -= 18
  }
  return Buffer.from(await doc.save())
}

async function uploadStatement(page: Page, fileName = 'sample-statement.pdf') {
  await page.setInputFiles('input[type="file"]', {
    name: fileName,
    mimeType: 'application/pdf',
    buffer: await makeStatementPdf(STATEMENT_LINES),
  })
}

test('shows the empty state before any upload', async ({ page }) => {
  await page.goto('./')
  await expect(
    page.getByText('Drop bank or credit card statement PDFs here', { exact: false }),
  ).toBeVisible()
  await expect(page.getByText('Step 1')).toBeVisible()
})

// The one disclosed exception to "no network egress" — a page-load visit
// count with no statement data. See PRIVACY.md's "The one thing this app
// now counts" section.
const ALLOWED_EXTERNAL_HOSTS = ['gc.zgo.at', 'yourownaiguru.goatcounter.com']

test('parses an uploaded statement into the dashboard without any request carrying statement data', async ({
  page,
}) => {
  const externalRequests: { url: string; postData: string | null }[] = []
  page.on('request', (request) => {
    const hostname = new URL(request.url()).hostname
    if (!hostname.match(/^(localhost|127\.0\.0\.1)$/)) {
      externalRequests.push({ url: request.url(), postData: request.postData() })
    }
  })

  await page.goto('./')
  await uploadStatement(page)

  await expect(page.getByText('Added 6 new transactions.')).toBeVisible()

  // Summary tiles: 5.75 + 62.40 + 15.99 + 73.22 + 412.00 spent, 200 in.
  await expect(page.getByText('Total spent')).toBeVisible()
  await expect(page.getByText('$569', { exact: true })).toBeVisible()
  await expect(page.getByText('$200', { exact: true })).toBeVisible()

  // Charts rendered.
  await expect(page.getByText('Spend by category')).toBeVisible()
  await expect(page.getByText('Income vs. expenses by month')).toBeVisible()

  // Table rows with auto-assigned categories.
  await expect(page.getByText('STARBUCKS STORE #4521')).toBeVisible()
  await expect(page.getByLabel('Category for STARBUCKS STORE #4521')).toHaveValue('Dining')
  await expect(page.getByLabel('Category for TRADER JOE S #102')).toHaveValue('Groceries')
  await expect(page.getByLabel('Category for DELTA AIR LINES')).toHaveValue('Travel')

  // The privacy promise, verified: every non-local request goes only to
  // the one disclosed, allowed host, and even that one carries nothing
  // derived from the statement — no merchant name, no amount.
  for (const req of externalRequests) {
    expect(ALLOWED_EXTERNAL_HOSTS).toContain(new URL(req.url).hostname)
  }
  const sensitiveStrings = ['STARBUCKS', '4521', 'TRADER JOE', '62.40', 'NETFLIX', 'DELTA', '412.00', '569', 'sample-statement']
  for (const req of externalRequests) {
    const haystack = req.url + (req.postData ?? '')
    for (const needle of sensitiveStrings) {
      expect(haystack).not.toContain(needle)
    }
  }
})

test('skips duplicates when the same statement is uploaded twice', async ({ page }) => {
  await page.goto('./')
  await uploadStatement(page)
  await expect(page.getByText('Added 6 new transactions.')).toBeVisible()

  await uploadStatement(page)
  await expect(
    page.getByText('Added 0 new transactions (skipped 6 already-imported duplicates).'),
  ).toBeVisible()
  await expect(page.getByText('6 transactions stored locally', { exact: false })).toBeVisible()
})

test('persists transactions across a reload, and Clear all data removes them', async ({
  page,
}) => {
  await page.goto('./')
  await uploadStatement(page)
  await expect(page.getByText('Added 6 new transactions.')).toBeVisible()

  await page.reload()
  await expect(page.getByText('6 transactions stored locally', { exact: false })).toBeVisible()

  page.on('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Clear all data' }).click()
  await expect(page.getByText('All locally stored data has been cleared.')).toBeVisible()
  await expect(page.getByText('Step 1')).toBeVisible()

  await page.reload()
  await expect(page.getByText('Step 1')).toBeVisible()
})

test('exports the parsed transactions as CSV', async ({ page }) => {
  await page.goto('./')
  await uploadStatement(page)
  await expect(page.getByText('Added 6 new transactions.')).toBeVisible()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export CSV' }).click()
  const download = await downloadPromise

  expect(download.suggestedFilename()).toBe('transactions.csv')
  const stream = await download.createReadStream()
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(chunk as Buffer)
  const csv = Buffer.concat(chunks).toString('utf-8')
  expect(csv.split('\n')[0]).toBe('Date,Description,Category,Account,Amount (USD)')
  expect(csv).toContain('2024-03-01,STARBUCKS STORE #4521,Dining,sample-statement,-5.75')
  expect(csv).toContain('2024-03-12,PAYMENT RECEIVED - THANK YOU,Payment,sample-statement,200.00')
})

test('currency is detected per statement, overridable, and survives a reload', async ({ page }) => {
  await page.goto('./')

  // An Indian statement. It writes "Rs." rather than ₹ because pdf-lib's
  // built-in Helvetica is WinAnsi-only and cannot encode the rupee sign —
  // the same reason the sample PDFs avoid it. The dashboard still renders ₹.
  await page.setInputFiles('input[type="file"]', {
    name: 'india-statement.pdf',
    mimeType: 'application/pdf',
    buffer: await makeStatementPdf([
      'SAMPLE BANK INDIA',
      'Statement Period: 01/03/2024 - 31/03/2024',
      '',
      '05/03/2024 SWIGGY BANGALORE Rs.450.00 Dr',
      '14/03/2024 BIGBASKET ONLINE Rs.1,299.00 Dr',
    ]),
  })
  await expect(page.getByText('Added 2 new transactions.')).toBeVisible()
  await expect(page.getByText('₹1,749', { exact: true })).toBeVisible()

  // The detected currency is stored alongside the transactions, so a reload
  // must not redraw rupee figures as dollars.
  await page.reload()
  await expect(page.getByText('₹1,749', { exact: true })).toBeVisible()

  // A wrong guess is correctable, and the override persists too.
  await page.getByLabel('Currency:').selectOption('USD')
  await expect(page.getByText('$1,749', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByText('$1,749', { exact: true })).toBeVisible()
})
