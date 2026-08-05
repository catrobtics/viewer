// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { scalesEqual } from './scales'

describe('scalesEqual', () => {
  it('compares scale values without relying on object identity', () => {
    expect(
      scalesEqual(
        { x: { min: 0, max: 10, pixelMin: 20, pixelMax: 200 } },
        { x: { min: 0, max: 10, pixelMin: 20, pixelMax: 200 } },
      ),
    ).toBe(true)
  })

  it('detects changed and missing axes', () => {
    const scales = { x: { min: 0, max: 10, pixelMin: 20, pixelMax: 200 } }

    expect(scalesEqual(scales, { ...scales, y: scales.x })).toBe(false)
    expect(scalesEqual(scales, { x: { ...scales.x, max: 11 } })).toBe(false)
    expect(scalesEqual(undefined, scales)).toBe(false)
  })

  it('uses numeric identity semantics for non-finite values', () => {
    const nanScale = { x: { min: Number.NaN, max: Infinity, pixelMin: -0, pixelMax: 1 } }

    expect(scalesEqual(nanScale, nanScale)).toBe(true)
    expect(
      scalesEqual(nanScale, {
        x: { min: Number.NaN, max: Infinity, pixelMin: 0, pixelMax: 1 },
      }),
    ).toBe(false)
  })
})
