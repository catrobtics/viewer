// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { expect, test } from '@playwright/test'

test('starts from a relative-path production build without browser errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') {
      const location = message.location()
      errors.push(
        `${message.text()} (${location.url}:${location.lineNumber}:${location.columnNumber})`,
      )
    }
  })
  page.on('pageerror', (error) => {
    errors.push(
      [error.stack, error.message, error.name].find(
        value => value != undefined && value.length > 0,
      )
      ?? 'Unknown page error',
    )
  })
  page.on('requestfailed', (request) => {
    errors.push(
      `Request failed: ${request.url()} (${request.failure()?.errorText ?? 'unknown error'})`,
    )
  })
  page.on('response', (response) => {
    if (response.status() >= 400) {
      errors.push(`HTTP ${response.status()}: ${response.url()}`)
    }
  })

  await page.goto('./')
  await expect(page.locator('#root')).toBeVisible()

  // Lazy panels and other dynamic imports may reject after the initial document has loaded.
  // Keep observing browser errors until the startup module graph has settled.
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1_000)
  expect(errors).toEqual([])
  await expect(page.locator('#root > *').first()).toBeVisible()

  expect(await page.evaluate(() => typeof Reflect.get(globalThis, 'Buffer'))).toBe('function')

  const moduleScripts = await page
    .locator('script[type="module"]')
    .evaluateAll(scripts => scripts.map(script => (script as HTMLScriptElement).src))
  expect(moduleScripts.length).toBeGreaterThan(0)
})

test('loads Vite\'s optimized bzip2 WASM module when running against a dev server', async ({
  page,
  request,
}) => {
  const moduleUrl = new URL(
    './node_modules/.vite/deps/@foxglove_wasm-bz2.js',
    process.env.BASE_URL ?? 'http://127.0.0.1:41873/',
  )
  const response = await request.get(moduleUrl.href)
  test.skip(
    response.headers()['content-type']?.includes('javascript') !== true,
    'The production preview does not expose Vite optimized dependency modules',
  )

  await page.goto('./')
  await page.evaluate(async (url) => {
    const module = (await import(url)) as {
      default: { init: () => Promise<unknown> }
    }
    await module.default.init()
  }, moduleUrl.href)
})
