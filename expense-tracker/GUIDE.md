# A Guide to the Privacy Expense Tracker

**What it does:** you give it a bank or credit card statement PDF, and it
turns that into a spending dashboard — totals, categories, trends, and a
searchable transaction table.

**What makes it different:** your statement never leaves your computer.
There is no server to send it to. Everything happens inside your browser
tab, on your own machine.

This guide has two halves. The first shows you how to use it. The second
explains how it's built and how you can check the privacy claim yourself
rather than taking it on faith — because with financial documents, "trust
us" isn't good enough.

---

# Part 1 — Using it

## The basic flow

1. **Open the app.** It's a normal web page; there's no account, no
   sign-up, and no email required.
2. **Drop in a statement.** Drag a PDF onto the upload box, or click it to
   pick a file. You can add several at once.
3. **Read your dashboard.** You'll get total spent and received, a
   spend-by-category chart, a month-by-month trend, and a full transaction
   table.
4. **Fix anything it got wrong.** Categories are guessed from the merchant
   name, so some will be off. Change any of them with the dropdown in the
   transaction table.
5. **Clear your data when you're done** — see below. This is the step
   worth building a habit around.

## Adding more statements

Upload as many as you like; they accumulate into one combined dashboard.
Re-uploading a statement you've already imported is safe: the app detects
duplicates by date, description, amount, and account, and skips them. It
will tell you exactly how many it skipped.

It's careful about one edge case: if you genuinely bought the same coffee
twice on the same day for the same amount, both are kept. Only true
re-imports get dropped.

## Statement formats it understands

Both US and Indian statements are supported and tested:

| | US | India |
|---|---|---|
| Dates | `03/14/2024` (month first) | `14/03/2024` or `14-03-2024` (day first) |
| Credits | `CR` suffix | `Cr` / `Dr` markers |
| Layout | one amount per line | one amount, or Debit/Credit/Balance columns |
| Currency | `$` | `₹`, `Rs.`, `INR`, or no symbol at all |

The date format is detected automatically. If a statement's dates come out
wrong, set the format manually with the **Date format** dropdown above the
upload box and upload it again.

The currency is detected the same way — from the symbol on the statement,
or, when an Indian bank prints none, from its UPI/NEFT lines and `Dr`/`Cr`
markers. Rupee amounts are shown as ₹ and grouped the Indian way
(₹1,23,456, not ₹123,456). The **Currency** dropdown next to it overrides
a wrong guess, and your choice is remembered on this browser.

Merchant recognition covers common names in both countries — Starbucks,
Whole Foods, Delta on one side; Swiggy, Zomato, Flipkart, Ola, BigBasket,
IRCTC, Airtel on the other — plus UPI, NEFT, and IMPS transfers.

## Clearing your data

Click **Clear all data** in the top-right of the dashboard. It asks for
confirmation, then removes every transaction the app has stored on your
machine and resets your categories to the defaults. This is immediate and
permanent — there's no copy anywhere else to restore from.

**Do this when:** you're on a shared or work computer, you're finished
with an analysis session, or you simply don't want the data sitting
around. It costs you nothing but re-uploading the PDF next time.

You can also clear it from outside the app, through your browser's
"Clear site data" or history settings — the app has no special hold on it.

## If you'd rather leave no trace at all: use a private window

Running the app in a **private / incognito window** is a good idea, and
for more concrete reasons than the usual privacy-mode folklore:

- **Nothing is written to your disk.** Chrome keeps private-window storage
  in memory only. Normally the app's saved transactions live in a database
  file in your Chrome profile — in a private window, they never get there.
- **Extensions are switched off by default.** Browser extensions with
  access to a page can read what a site has stored. Private windows
  disable them unless you've explicitly allowed one, which closes a
  genuinely underrated hole.
- **Everything is wiped when you close the window.** No cleanup to
  remember.

**The trade-off:** you lose persistence. Close the window and your
dashboard is gone, so you re-upload your statements next session. That's a
fair deal for occasional analysis, and a poor one if you check your
spending weekly.

**What a private window does *not* do:** it isn't a shield against malware
or a compromised machine, and it doesn't isolate you from other pages on
the *same* site within that same private session. It's about leaving no
residue, and at that it works well.

The app is tested to work correctly with storage blocked entirely, so the
strictest settings — including Safari's "Block all cookies" — won't break
it. You simply get a session-only dashboard.

## Exporting

**Export CSV** downloads your transactions for use in Excel, Numbers, or
Google Sheets. The file is generated inside your browser and saved
straight to your machine; it isn't uploaded anywhere.

The export also defuses a subtle trap: spreadsheet apps execute cells that
begin with `=`, `+`, `-`, or `@` as formulas, so a merchant name crafted to
look like a formula could otherwise run when you opened the file. Those
values are neutralized automatically.

---

# Part 2 — How it's built

This half is here so the privacy claim is something you can check rather
than believe. You don't need to be a programmer to follow it.

## Why there's nothing to leak

Most web apps work by sending your file to a company's server, which
processes it and sends back a result. That design means trusting that
company with your bank statements — their storage, their staff, their
breach history, their privacy policy changes.

**This app has no server.** It's a set of static files — HTML, JavaScript,
CSS — that your browser downloads once and then runs locally. The PDF
parsing library ([pdf.js](https://mozilla.github.io/pdf.js/), the same
engine Firefox uses to display PDFs) runs inside your tab. There is no
back end, no database, no API. There is nowhere for your data to be sent,
because nothing exists to receive it.

## What happens to your PDF, step by step

1. You select a file. The browser hands the app a reference to it.
2. The app reads the bytes into memory and passes them to pdf.js.
3. pdf.js extracts the text — the app reconstructs lines from the
   positioned words on each page.
4. Lines that look like transactions (a date, then a description, then an
   amount) are parsed into records. Everything else — headers, your
   account number, page numbers — is ignored.
5. **The PDF's bytes are released.** The document is explicitly closed and
   discarded.
6. Categories are assigned by matching merchant keywords.

What survives step 5 is a plain list of transactions. The PDF itself is
never written to disk, never uploaded, and never kept.

## What is stored, and where

Only the parsed transactions and your category rules, in your browser's
`localStorage`, under two names: `expense-tracker:transactions:v1` and
`expense-tracker:rules:v1`. That's what makes your dashboard still be
there when you come back. A third name, `expense-tracker:currency:v1`,
holds your currency preference — a three-letter code, nothing more.

**Be clear-eyed about this:** the PDF isn't stored, but what *is* stored is
still financial data. Transaction descriptions on Indian statements often
contain UPI IDs and the names of people you paid. "The PDF is safe" is
true; "nothing sensitive is saved" is not.

Two things follow from that, and both are why **Clear all data** matters:

- **It sits unencrypted on your disk.** Browsers don't encrypt ordinary
  site storage the way they encrypt saved passwords. Anyone who can read
  your user profile can read it.
- **It's shared with other pages on the same web address.** Browsers
  isolate storage by *site*, not by page. Any other page published under
  the same `github.io` account — including other tools added to this
  repository later — can read it. Other people's sites cannot; this is
  only about pages published under that same account.

A random malicious website *cannot* read it. That isolation is enforced by
the browser itself and is one of the web's oldest and most reliable
guarantees.

## The locks that are actually enforced

Two protections don't depend on the code behaving well:

- **A Content Security Policy** ships with the app telling your browser to
  refuse any script from another source and to block *all* outgoing
  network connections. Even if a piece of the app were compromised, the
  browser would refuse to let it send your data anywhere.
- **Only the browser's own file picker** ever touches your disk. The app
  can't go looking for files on its own.

## How it's kept honest

The privacy claims are enforced by automated tests that run on every
change, not just documented:

- A test uploads a statement and **records every network request the page
  makes**, then asserts that none of them go anywhere but the local
  machine.
- A test uploads a statement whose account holder name, account number,
  and IFSC code sit on non-transaction lines, then **dumps every storage
  mechanism the browser has** — local storage, session storage, IndexedDB,
  caches, cookies — and asserts none of that text appears, along with no
  trace of the PDF itself.
- A test blocks storage completely and confirms the app still works and
  that **Clear all data** still clears the screen.

Altogether there are 45 tests of the parsing and storage logic and 13
tests that drive the real app in a real Chrome browser. They run
automatically on GitHub before anything is published.

## Checking it yourself

You don't have to take any of the above on trust:

- **The ten-second version:** load the page, then turn off your Wi-Fi.
  Keep using it — upload a statement, browse the dashboard. It all works,
  which is only possible if nothing needs to leave your machine.
- **Watch the network.** Open your browser's developer tools, go to the
  Network tab, and upload a statement. After the page itself finishes
  loading, nothing further is requested.
- **Read the code.** It's all public. The parsing and storage logic is
  under `src/lib/`, and each file is a few hundred lines at most.
- **Build it yourself.** Clone the repository and run `npm install` and
  `npm run build`, and you're running only what you compiled.

## The honest limits

No tool is risk-free, and you should know where this one's edges are:

- **Scanned statements won't work.** If your PDF is a photo or scan rather
  than real text, there's no text to extract. Nothing will be found.
- **Password-protected PDFs aren't supported.** Remove the password first,
  or use a different export from your bank.
- **The parser isn't perfect.** Every bank formats statements differently.
  Always check the transaction table against your statement before relying
  on the numbers.
- **Amounts are never converted between currencies.** The app detects
  whether your statement is in dollars, rupees, pounds, or euros and labels
  the figures accordingly (₹ amounts group the Indian way: ₹1,23,456), but
  it shows every value exactly as printed. Use the **Currency** selector
  above the upload box if a statement is read as the wrong one — and don't
  mix currencies in one dashboard, since the totals would add rupees to
  dollars.
- **The hosted version asks you to trust the host.** The published site is
  served by GitHub Pages. If you want to remove even that assumption,
  build and run it yourself.
- **Anyone who controls the code could change it.** These guarantees hold
  for this version. That's precisely why the code is public, the tests are
  public, and the offline check above exists.

---

## Questions worth asking

**Do I need an account?** No. There's nothing to sign up for.

**Does it work offline?** Yes, once the page has loaded.

**Can I use it on my phone?** Yes, the layout adapts to small screens.

**Will you see my data?** No. It never reaches anyone — there's no
server, and the tests above prove nothing is transmitted.

**What if I upload the wrong file?** Nothing is stored until it parses as
a statement, and **Clear all data** removes everything regardless.

**Is my data backed up?** No — deliberately. It exists only in your
browser. Export a CSV if you want a copy you control.
