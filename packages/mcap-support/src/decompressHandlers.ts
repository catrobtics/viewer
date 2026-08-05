// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { McapTypes } from '@mcap/core'
import { decompress as decompressLZ4 } from 'lz4-lite'
import Bunzip from 'seek-bzip'

let handlersPromise: Promise<McapTypes.DecompressHandlers> | undefined
export async function loadDecompressHandlers(): Promise<McapTypes.DecompressHandlers> {
  return await (handlersPromise ??= _loadDecompressHandlers())
}

async function _loadDecompressHandlers(): Promise<McapTypes.DecompressHandlers> {
  const zstd = await import('@hpcc-js/wasm-zstd').then(async ({ Zstd }) => await Zstd.load())

  return {
    lz4: (buffer, decompressedSize) => decompressLZ4(buffer, Number(decompressedSize)),

    bz2: (buffer, decompressedSize) =>
      Bunzip.decode(buffer, new Uint8Array(Number(decompressedSize))),

    zstd: buffer => zstd.decompress(buffer),
  }
}
