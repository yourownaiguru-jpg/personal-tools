import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

// These drive the real app in Chrome against the actual sample PDFs shipped
// in samples/ (run `npm run samples` to regenerate) — the same files a user
// would download from this repo to try the app themselves.
const dirname = path.dirname(fileURLToPath(import.meta.url))
const samplesDir = path.join(dirname, '..', 'samples')

async function upload(page: import('@playwright/test').Page, fileName: string) {
  await page.goto('./')
  await page.setInputFiles('input[type="file"]', {
    name: fileName,
    mimeType: 'application/pdf',
    buffer: await readFile(path.join(samplesDir, fileName)),
  })
}

test('US credit card statement: totals and categories', async ({ page }) => {
  await upload(page, 'us-credit-card-statement.pdf')
  await expect(page.getByText('Added 8 new transactions.')).toBeVisible()

  // Expenses: 5.75+62.40+15.99+89.10+73.22+41.15+412.00 = 699.61; income 200.
  await expect(page.getByText('$700', { exact: true })).toBeVisible()
  await expect(page.getByText('$200', { exact: true })).toBeVisible()

  await expect(page.getByLabel('Category for STARBUCKS STORE #4521')).toHaveValue('Dining')
  await expect(page.getByLabel('Category for TRADER JOE S #102')).toHaveValue('Groceries')
  await expect(page.getByLabel('Category for DELTA AIR LINES')).toHaveValue('Travel')
  await expect(page.getByLabel('Category for PAYMENT RECEIVED - THANK YOU')).toHaveValue('Payment')

  // Dates parse as US month-first (no India hints, no unambiguous day>12 date).
  await expect(page.getByText('2024-03-28')).toBeVisible()
})

test('US bank statement: direct deposit and refund read as income', async ({ page }) => {
  await upload(page, 'us-bank-statement.pdf')
  await expect(page.getByText('Added 8 new transactions.')).toBeVisible()

  // Income: 2500 (payroll) + 25 (refund) = 2525. Expenses: 324.69.
  await expect(page.getByText('$2,525', { exact: true })).toBeVisible()
  await expect(page.getByText('$325', { exact: true })).toBeVisible()

  await expect(page.getByLabel('Category for DIRECT DEPOSIT PAYROLL ACME CORP')).toHaveValue(
    'Income',
  )
  await expect(page.getByLabel('Category for ELECTRIC BILL PAYMENT')).toHaveValue('Utilities')
})

test('India credit card statement: dd/mm dates and Dr/Cr markers', async ({ page }) => {
  await upload(page, 'india-credit-card-statement.pdf')
  await expect(page.getByText('Added 8 new transactions.')).toBeVisible()

  // Auto-detected as day-first from "25/03/2024" (day > 12). If this were
  // misread as US month-first, 25/03 would be an invalid date and get
  // dropped — so all 8 transactions landing confirms DMY was picked.
  await expect(page.getByText('2024-03-25')).toBeVisible() // Ola Cabs, not 2025-03-XX or dropped
  await expect(page.getByText('2024-03-05')).toBeVisible() // Swiggy

  // Expenses: 450+1299+2450+1860.50+6200+649+320 = 13228.50; income 5000.
  // Rendered in rupees: the ₹ in the statement is detected, rather than
  // every figure being labelled with a dollar sign as it once was.
  await expect(page.getByText('₹13,229', { exact: true })).toBeVisible()
  await expect(page.getByText('₹5,000', { exact: true })).toBeVisible()

  await expect(page.getByLabel('Category for SWIGGY BANGALORE')).toHaveValue('Dining')
  await expect(page.getByLabel('Category for AMAZON.IN')).toHaveValue('Shopping')
  // Regression check: "FLIPKART INTERNET PVT LTD" must not be miscategorized
  // as Utilities via a stray "internet" keyword match.
  await expect(page.getByLabel('Category for FLIPKART INTERNET PVT LTD')).toHaveValue('Shopping')
  await expect(page.getByLabel('Category for BIGBASKET ONLINE')).toHaveValue('Groceries')
  await expect(page.getByLabel('Category for INDIGO AIRLINES')).toHaveValue('Travel')
  // Regression check: "OLA CABS" must not need to rely on bare "ola", which
  // would also match inside "coca-cola".
  await expect(page.getByLabel('Category for OLA CABS BANGALORE')).toHaveValue('Transport')
})

test('India bank statement: 3-column debit/credit/balance layout', async ({ page }) => {
  await upload(page, 'india-bank-statement.pdf')
  // ATM withdrawal and interest credit both parse as transactions (9 debit/
  // credit rows minus none skipped — all rows have a nonzero debit or credit).
  await expect(page.getByText('Added 8 new transactions.')).toBeVisible()

  // Expenses: 450+1860.50+2450+1000+5000+320 = 11080.50
  // Income: 55000 (salary) + 125.40 (interest) = 55125.40
  // This sample prints no currency symbol at all — the UPI/NEFT vocabulary
  // is the only thing identifying it as rupees.
  await expect(page.getByText('₹11,081', { exact: true })).toBeVisible()
  await expect(page.getByText('₹55,125', { exact: true })).toBeVisible()

  await expect(
    page.getByLabel('Category for UPI-SWIGGY INSTAMART-swiggy.instamart@icici-401234567890'),
  ).toHaveValue('Dining')
  await expect(
    page.getByLabel('Category for UPI-BIGBASKET-bigbasket@ybl-401234567891'),
  ).toHaveValue('Groceries')
  await expect(page.getByLabel('Category for NEFT CR-ACME CORP-SALARY-MAR24')).toHaveValue(
    'Income',
  )
  await expect(
    page.getByLabel('Category for UPI-FLIPKART INTERNET PVT LTD-flipkart@icici-401234567892'),
  ).toHaveValue('Shopping')
  // A P2P UPI transfer with no merchant match falls back to the generic
  // "upi" keyword under Payment rather than staying Uncategorized.
  await expect(
    page.getByLabel('Category for UPI-RAHUL SHARMA-rahul@oksbi-401234567893'),
  ).toHaveValue('Payment')

  // 2024-03-05 (dd-mm-yyyy salary credit row) must be read as March, not a
  // rejected/garbled date — confirms hyphenated dd-mm-yyyy dates parse too.
  await expect(page.getByText('2024-03-05')).toBeVisible()
})
