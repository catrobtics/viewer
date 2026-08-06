// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { mountViewer } from '@catrobtics/viewer'
import '@catrobtics/viewer/style.css'

window.onerror = (...args) => {
  console.error(...args)
}

const rootElement = document.getElementById('root')
if (rootElement == undefined) {
  throw new Error('missing #root element')
}

mountViewer(rootElement, {
  deepLinks: [window.location.href],
  enableGlobalCss: true,
  enableLaunchPreferenceScreen: true,
  installDevtoolsFormatters: true,
  manageContextMenu: true,
  manageDocumentTitle: true,
  patchFetchErrors: true,
  syncUrl: true,
})
