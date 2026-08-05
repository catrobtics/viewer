// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { RpcScales } from './types'

function scaleEquals(left: RpcScales['x'], right: RpcScales['x']): boolean {
  return (
    left === right
    || (
      left != undefined
      && right != undefined
      && Object.is(left.min, right.min)
      && Object.is(left.max, right.max)
      && Object.is(left.pixelMin, right.pixelMin)
      && Object.is(left.pixelMax, right.pixelMax)
    )
  )
}

export function scalesEqual(left: RpcScales | undefined, right: RpcScales): boolean {
  return left != undefined && scaleEquals(left.x, right.x) && scaleEquals(left.y, right.y)
}
