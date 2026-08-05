// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import 'vite/client'

declare global {
  const CATROBOTICS_VERSION: string | undefined
  // eslint-disable-next-line vars-on-top -- A global var declaration exposes the Electron bridge on globalThis.
  var desktopBridge: unknown | undefined
}
