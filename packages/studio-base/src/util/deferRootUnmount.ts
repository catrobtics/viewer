// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { Root } from 'react-dom/client'

/** Avoid synchronously unmounting a nested root during a parent React render. */
export function deferRootUnmount(root: Root): void {
  queueMicrotask(() => {
    root.unmount()
  })
}
