// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:41873/'

export default defineConfig({
  testDir: 'web/integration-test',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'msedge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command:
          'corepack pnpm web:build:prod && corepack pnpm exec vite preview --config vite.config.mts --host 127.0.0.1 --port 41873 --strictPort',
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120_000,
      },
})
