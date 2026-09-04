// Generates synthetic (not real) statement PDFs for manually testing the
// app's parser against different regional formats. Run with `npm run samples`.
//
// Note: pdf-lib's built-in Helvetica only supports WinAnsi-encoded text, so
// these intentionally avoid the ₹ symbol (samples use plain numbers, which
// is also how many real Indian bank PDF exports render amounts). ₹ parsing
// itself is covered separately by unit tests in src/lib/parseStatement.test.ts.

import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFDocument, StandardFonts } from 'pdf-lib'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'samples')

async function buildPdf(lines) {
  const doc = await PDFDocument.create()
  const page = doc.addPage([612, 792])
  const font = await doc.embedFont(StandardFonts.Helvetica)
  let y = 750
  for (const line of lines) {
    if (line) page.drawText(line, { x: 50, y, size: 10.5, font })
    y -= 18
  }
  return doc.save()
}

const SAMPLES = {
  'us-credit-card-statement.pdf': [
    'FIRST NATIONAL BANK VISA SIGNATURE',
    'Statement Period: 03/01/2024 - 03/31/2024',
    'Account ending in 1234',
    '',
    'Date        Description                          Amount',
    '03/02/2024 STARBUCKS STORE #4521 5.75',
    '03/03/2024 TRADER JOE S #102 62.40',
    '03/05/2024 NETFLIX.COM 15.99',
    '03/10/2024 AMAZON.COM AMZN.COM/BILL 89.10',
    '03/12/2024 PAYMENT RECEIVED - THANK YOU 200.00 CR',
    '03/18/2024 WHOLE FOODS MARKET 73.22',
    '03/22/2024 SHELL OIL 41.15',
    '03/28/2024 DELTA AIR LINES 412.00',
    '',
    'Page 1 of 1',
  ],
  'us-bank-statement.pdf': [
    'COMMUNITY CHECKING ACCOUNT STATEMENT',
    'Statement Period: 03/01/2024 - 03/31/2024',
    'Account ending in 5678',
    '',
    'Date        Description                          Amount',
    '03/01/2024 DIRECT DEPOSIT PAYROLL ACME CORP 2500.00',
    '03/03/2024 CHECK CARD PURCHASE WALMART 54.32',
    '03/07/2024 ATM WITHDRAWAL 100.00',
    '03/10/2024 ELECTRIC BILL PAYMENT 88.40',
    '03/15/2024 CVS PHARMACY #221 22.10',
    '03/18/2024 REFUND MERCHANDISE RETURN 25.00',
    '03/20/2024 CHECK CARD PURCHASE TARGET 45.67',
    '03/25/2024 UBER TRIP 14.20',
    '',
    'Page 1 of 1',
  ],
  'india-credit-card-statement.pdf': [
    'GLOBAL BANK OF INDIA - PLATINUM CREDIT CARD',
    'Statement Period: 01/03/2024 to 31/03/2024',
    'Card ending 4321',
    '',
    'Date        Transaction Details                  Amount',
    '05/03/2024 SWIGGY BANGALORE 450.00 Dr',
    '07/03/2024 AMAZON.IN 1,299.00 Dr',
    '10/03/2024 FLIPKART INTERNET PVT LTD 2,450.00 Dr',
    '12/03/2024 PAYMENT RECEIVED 5,000.00 Cr',
    '15/03/2024 BIGBASKET ONLINE 1,860.50 Dr',
    '18/03/2024 INDIGO AIRLINES 6,200.00 Dr',
    '22/03/2024 NETFLIX.COM 649.00 Dr',
    '25/03/2024 OLA CABS BANGALORE 320.00 Dr',
    '',
    'Page 1 of 1',
  ],
  'india-bank-statement.pdf': [
    'GLOBAL BANK OF INDIA - SAVINGS ACCOUNT STATEMENT',
    'Statement Period: 01-03-2024 to 31-03-2024',
    'Account No: XXXXXX7890  IFSC: GBIN0001234',
    '',
    'Date       Narration                                          Withdrawal   Deposit    Balance',
    '01-03-2024 UPI-SWIGGY INSTAMART-swiggy.instamart@icici-401234567890 450.00 0.00 45230.00',
    '03-03-2024 UPI-BIGBASKET-bigbasket@ybl-401234567891 1860.50 0.00 43369.50',
    '05-03-2024 NEFT CR-ACME CORP-SALARY-MAR24 0.00 55000.00 98369.50',
    '08-03-2024 UPI-FLIPKART INTERNET PVT LTD-flipkart@icici-401234567892 2450.00 0.00 95919.50',
    '12-03-2024 UPI-RAHUL SHARMA-rahul@oksbi-401234567893 1000.00 0.00 94919.50',
    '15-03-2024 ATM WDL NEW DELHI 5000.00 0.00 89919.50',
    '18-03-2024 UPI-OLA CABS-ola@icici-401234567894 320.00 0.00 89599.50',
    '20-03-2024 INTEREST CREDIT MAR24 0.00 125.40 89724.90',
    '',
    'Page 1 of 1',
  ],
}

await mkdir(outDir, { recursive: true })

for (const [fileName, lines] of Object.entries(SAMPLES)) {
  const bytes = await buildPdf(lines)
  await writeFile(path.join(outDir, fileName), bytes)
  console.log(`Wrote samples/${fileName}`)
}
