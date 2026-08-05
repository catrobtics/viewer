// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { IIterableSource } from '@catrobotics/studio-base/players/IterablePlayer/IIterableSource'

import type { Player } from '@catrobotics/studio-base/players/types'
import { describe, expect, it, vi } from 'vitest'

import { BenchmarkPlayer } from './BenchmarkPlayer'
import { PointcloudPlayer } from './PointcloudPlayer'
import { SinewavePlayer } from './SinewavePlayer'
import { TransformPlayer } from './TransformPlayer'
import { TransformPreloadingPlayer } from './TransformPreloadingPlayer'

function makeSource(): IIterableSource {
  return {
    async initialize() {
      throw new Error(
        'The source should not initialize after the player is closed',
      )
    },
    async* messageIterator() {},
    async getBackfillMessages() {
      return []
    },
  }
}

const playerFactories: Array<[string, () => Player]> = [
  ['benchmark', () => new BenchmarkPlayer('benchmark', makeSource())],
  ['pointcloud', () => new PointcloudPlayer()],
  ['sinewave', () => new SinewavePlayer()],
  ['transform', () => new TransformPlayer()],
  ['transform preloading', () => new TransformPreloadingPlayer()],
]

describe.each(playerFactories)('%s player', (_name, makePlayer) => {
  it('stops after close', async () => {
    const player = makePlayer()
    const listener = vi.fn(async () => {
      player.close()
    })

    player.setListener(listener)

    await vi.waitFor(() => {
      expect(listener).toHaveBeenCalledTimes(1)
    })
  })

  it('reports unsupported capabilities explicitly', async () => {
    const player = makePlayer()

    expect(() => {
      player.setParameter('key', 'value')
    }).toThrow('not supported')
    expect(() => {
      player.publish({ topic: '/topic', msg: {} })
    }).toThrow('not supported')
    await expect(player.callService('/service', {})).rejects.toThrow(
      'not supported',
    )
    expect(() => {
      player.setGlobalVariables({})
    }).not.toThrow()
  })
})
