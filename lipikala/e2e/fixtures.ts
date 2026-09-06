import { test as base, expect } from '@playwright/test'

// Every page load fires a GoatCounter visit-count beacon (see PRIVACY.md).
// That's the right thing in production, but CI running this suite dozens
// of times a day would otherwise inflate the real visit count with test
// traffic. The spec imports `test` from here instead of directly from
// @playwright/test so this block applies automatically, everywhere.
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(/^https:\/\/(gc\.zgo\.at|[\w-]+\.goatcounter\.com)\//, (route) => route.abort())
    await use(page)
  },
})

export { expect }
