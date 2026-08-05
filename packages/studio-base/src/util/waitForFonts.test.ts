// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import waitForFonts from './waitForFonts'

describe('waitForFonts', () => {
  it('does not prevent startup when a font fails to load', async () => {
    const load = vi
      .fn()
      .mockRejectedValue(new DOMException('A network error occurred.', 'NetworkError'))
    vi.stubGlobal('document', { fonts: [{ load }] })

    await expect(waitForFonts()).resolves.toBeUndefined()
    expect(load).toHaveBeenCalledOnce()

    vi.unstubAllGlobals()
  })
})
