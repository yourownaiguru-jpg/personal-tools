import { expect, test } from '@playwright/test'

test('loads with the default name, script, and letter map', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('heading', { name: 'Tamil-Brahmi', level: 2 })).toBeVisible()
  await expect(page.getByLabel(/Name or text/)).toHaveValue('Kaveri')
  // Three aksharas: ka, ve, ri.
  await expect(page.getByText('ka', { exact: true })).toBeVisible()
  await expect(page.getByText('ve', { exact: true })).toBeVisible()
  await expect(page.getByText('ri', { exact: true })).toBeVisible()
})

test('typing a new name updates the plate live, with no page reload', async ({ page }) => {
  await page.goto('./')
  const input = page.getByLabel(/Name or text/)
  await input.fill('Rama')
  await expect(page.getByText('ra', { exact: true })).toBeVisible()
  await expect(page.getByText('ma', { exact: true })).toBeVisible()
  // The input itself must survive the re-render with focus and content intact.
  await expect(input).toHaveValue('Rama')
  await expect(input).toBeFocused()
})

test('switching language changes the timeline to that language\'s eras', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Sanskrit / Hindi' }).click()
  await expect(page.getByRole('heading', { name: 'Ashokan Brahmi', level: 2 })).toBeVisible()
  await expect(page.getByText('Siddhamātṛkā', { exact: true })).toBeVisible()
  await expect(page.getByText('Nandinagari', { exact: true })).toBeVisible()
})

test('picking an era updates the plate and its note', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Sanskrit / Hindi' }).click()
  await page.getByText('Siddhamātṛkā', { exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Siddhamātṛkā', level: 2 })).toBeVisible()
  await expect(page.getByText('Shingon priests')).toBeVisible()
})

test('switching plate surface changes the background texture', async ({ page }) => {
  await page.goto('./')
  const plate = page.locator('.plate > div').first()
  const stoneBg = await plate.evaluate((el) => getComputedStyle(el).backgroundImage)
  // The radio itself is visually hidden (custom segmented-control styling);
  // its label is the clickable, visible surface.
  await page.locator('.seg-opt', { hasText: 'Copper plate' }).click()
  const copperBg = await plate.evaluate((el) => getComputedStyle(el).backgroundImage)
  expect(copperBg).not.toBe(stoneBg)
})

test('copy link updates the URL hash so the state survives a reload', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('./')
  await page.getByLabel(/Name or text/).fill('Priya')
  await page.getByRole('button', { name: 'Sanskrit / Hindi' }).click()
  await page.getByRole('button', { name: 'Copy link' }).click()
  await expect(page.getByRole('button', { name: 'Link copied' })).toBeVisible()
  await expect(page).toHaveURL(/#.*t=Priya.*l=Sanskrit|#.*l=Sanskrit.*t=Priya/)

  await page.reload()
  await expect(page.getByLabel(/Name or text/)).toHaveValue('Priya')
  await expect(page.getByRole('heading', { name: 'Ashokan Brahmi', level: 2 })).toBeVisible()
})

test('opening a shared link with a crafted name does not execute script or corrupt the page', async ({ page }) => {
  const dialogs: string[] = []
  page.on('dialog', (d) => {
    dialogs.push(d.message())
    void d.dismiss()
  })
  await page.goto('./#' + new URLSearchParams({ t: '<img src=x onerror=alert(1)>' }).toString())
  expect(dialogs).toHaveLength(0)
  // The malicious markup should appear as literal, inert text somewhere on
  // the page (its characters are still "letters" the parser passes through
  // unrecognized), never as a live <img> element.
  await expect(page.locator('img[src="x"]')).toHaveCount(0)
})

test('downloading the plate produces a PNG file', async ({ page }) => {
  await page.goto('./')
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download image' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/^Kaveri-tamil-brahmi\.png$/)
})

test('makes no network request outside Google Fonts and the page\'s own origin', async ({ page }) => {
  const externalHosts = new Set<string>()
  page.on('request', (req) => {
    const url = new URL(req.url())
    if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') externalHosts.add(url.hostname)
  })
  await page.goto('./')
  await page.getByLabel(/Name or text/).fill('a private name nobody should see leave the browser')
  await page.getByRole('button', { name: 'Sanskrit / Hindi' }).click()
  for (const host of externalHosts) {
    expect(['fonts.googleapis.com', 'fonts.gstatic.com']).toContain(host)
  }
})
