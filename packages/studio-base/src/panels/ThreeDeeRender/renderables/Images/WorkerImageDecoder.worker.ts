// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { RawImage } from '@foxglove/schemas'
import type { Image as RosImage } from '../../ros'

import type { RawImageOptions } from './decodeImage'
import * as Comlink from 'comlink'
import { decodeRawImage } from './decodeImage'

function decode(image: RosImage | RawImage, options: Partial<RawImageOptions>): ImageData {
  const result = new ImageData(image.width, image.height)
  decodeRawImage(image, options, result.data)
  return Comlink.transfer(result, [result.data.buffer])
}

export const service = {
  decode,
}
Comlink.expose(service)
