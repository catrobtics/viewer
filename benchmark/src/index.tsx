// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import Logger from '@catrobotics/log'

import { initI18n } from '@catrobotics/studio-base'
import { createRoot } from 'react-dom/client'

const log = Logger.getLogger(import.meta.url)
log.debug('initializing')

window.onerror = (...args) => {
  console.error(...args)
}

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('missing #root element')
}
const root = createRoot(rootEl)

async function main() {
  const { overwriteFetch, waitForFonts } = await import('@catrobotics/studio-base')
  overwriteFetch()
  // consider moving waitForFonts into App to display an app loading screen
  await waitForFonts()

  await initI18n()

  const { Root } = await import('./Root')

  root.render(<Root />)
}

void main()
