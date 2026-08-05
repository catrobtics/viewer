// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { MessageEvent } from '@catrobotics/studio'
import type { GlobalVariables } from '@catrobotics/studio-base/hooks/useGlobalVariables'
import type { AdvertiseOptions, Player, PlayerState, PublishPayload, SubscribePayload, Topic, TopicStats } from '@catrobotics/studio-base/players/types'
import type { RosDatatypes } from '@catrobotics/studio-base/types/RosDatatypes'
import type { Time } from '@foxglove/rostime'
import Log from '@catrobotics/log'
import {

  PlayerPresence,

} from '@catrobotics/studio-base/players/types'
import * as rostime from '@foxglove/rostime'

import { BenchmarkStats } from '../BenchmarkStats'

const log = Log.getLogger(import.meta.url)

const CAPABILITIES: string[] = []

class SinewavePlayer implements Player {
  #name: string = 'sinewave'
  #startTime: Time = rostime.fromDate(new Date())
  #listener?: (state: PlayerState) => Promise<void>
  #datatypes: RosDatatypes = new Map()
  #closed = false

  public constructor() {
    this.#datatypes.set('Sinewave', {
      name: 'Sinewave',
      definitions: [
        {
          name: 'value',
          type: 'float32',
        },
      ],
    })
  }

  public setListener(listener: (state: PlayerState) => Promise<void>): void {
    this.#listener = listener
    void this.#run()
  }

  public close(): void {
    this.#closed = true
  }

  public setSubscriptions(_subscriptions: SubscribePayload[]): void {}
  public setPublishers(_publishers: AdvertiseOptions[]): void {
    // no-op
  }

  public setParameter(_key: string, _value: unknown): void {
    throw new Error(
      'Parameter editing is not supported by the sinewave benchmark data source',
    )
  }

  public publish(_request: PublishPayload): void {
    throw new Error(
      'Publishing is not supported by the sinewave benchmark data source',
    )
  }

  public async callService(
    _service: string,
    _request: unknown,
  ): Promise<unknown> {
    throw new Error(
      'Service calls are not supported by the sinewave benchmark data source',
    )
  }

  public setGlobalVariables(_globalVariables: GlobalVariables): void {}

  async #run() {
    const listener = this.#listener
    if (!listener) {
      throw new Error('Invariant: listener is not set')
    }

    log.info('Initializing sinewave player')

    await listener({
      profile: undefined,
      presence: PlayerPresence.PRESENT,
      name: this.#name,
      playerId: this.#name,
      capabilities: CAPABILITIES,
      progress: {},
      urlState: {
        sourceId: 'sinewave',
      },
    })
    if (this.#closed) {
      return
    }

    const sinewaveCount = 100

    const topics: Topic[] = []

    const startTime = rostime.fromDate(new Date())

    for (let i = 0; i < sinewaveCount; ++i) {
      const topicName = `sinewave_${i}`
      topics.push({ name: topicName, schemaName: 'Sinewave' })
    }

    let messageCount = 0
    while (!this.#closed) {
      messageCount += 1

      const topicStats = new Map<string, TopicStats>()

      const now = rostime.fromDate(new Date())
      const value = Math.sin(rostime.toSec(now))

      const messages: MessageEvent[] = []

      for (let i = 0; i < sinewaveCount; ++i) {
        const topicName = `sinewave_${i}`
        messages.push({
          receiveTime: now,
          topic: topicName,
          schemaName: 'Sinewave',
          message: { value: value + i * 0.1 },
          sizeInBytes: 0,
        })

        topicStats.set(topicName, {
          numMessages: messageCount,
          firstMessageTime: startTime,
          lastMessageTime: now,
        })
      }

      const frameStartMs = performance.now()

      await listener({
        profile: undefined,
        presence: PlayerPresence.PRESENT,
        name: this.#name,
        playerId: this.#name,
        capabilities: CAPABILITIES,
        progress: {},
        activeData: {
          messages,
          totalBytesReceived: 0,
          currentTime: now,
          startTime: this.#startTime,
          isPlaying: true,
          speed: 1,
          lastSeekTime: 1,
          endTime: now,
          topics,
          topicStats,
          datatypes: this.#datatypes,
        },
      })

      if (this.#closed) {
        return
      }

      const frameEndMs = performance.now()
      const frameTimeMs = frameEndMs - frameStartMs

      BenchmarkStats.Instance().recordFrameTime(frameTimeMs)
    }
  }
}

export { SinewavePlayer }
