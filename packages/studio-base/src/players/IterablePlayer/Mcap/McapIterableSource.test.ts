// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { TempBuffer } from '@catrobotics/mcap-support'
import { McapWriter } from '@mcap/core'

import { vi } from 'vitest'

import { McapIterableSource } from './McapIterableSource'

vi.mock('@catrobotics/mcap-support', async importOriginal => ({
  ...(await importOriginal()),
  loadDecompressHandlers: async () => ({}),
}))
describe('mcapIterableSource', () => {
  it('returns an appropriate error message for an empty MCAP file', async () => {
    const tempBuffer = new TempBuffer()

    const writer = new McapWriter({ writable: tempBuffer })
    await writer.start({ library: '', profile: '' })
    await writer.end()

    const source = new McapIterableSource({
      type: 'file',
      file: new Blob([new Uint8Array(tempBuffer.get())]),
    })
    const { problems } = await source.initialize()
    expect(problems).toEqual([
      {
        message: 'This file contains no messages.',
        severity: 'warn',
      },
    ])
  })
})
