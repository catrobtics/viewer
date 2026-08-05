// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { MessageEvent } from '@catrobotics/studio'
import type { GlobalVariables } from '@catrobotics/studio-base/hooks/useGlobalVariables'
import type { IIterableSource } from '@catrobotics/studio-base/players/IterablePlayer/IIterableSource'
import type { AdvertiseOptions, Player, PlayerState, Progress, PublishPayload, SubscribePayload } from '@catrobotics/studio-base/players/types'
import { filterMap } from '@catrobotics/den/collection'
import Log from '@catrobotics/log'
import { BlockLoader } from '@catrobotics/studio-base/players/IterablePlayer/BlockLoader'
import PlayerProblemManager from '@catrobotics/studio-base/players/PlayerProblemManager'
import {

  PlayerCapabilities,
  PlayerPresence,

} from '@catrobotics/studio-base/players/types'
import delay from '@catrobotics/studio-base/util/delay'
import { toRFC3339String } from '@foxglove/rostime'

const log = Log.getLogger(import.meta.url)

const DEFAULT_CACHE_SIZE_BYTES = 1.0e9
const MIN_MEM_CACHE_BLOCK_SIZE_NS = 0.1e9
const MAX_BLOCKS = 400
const CAPABILITIES: string[] = [PlayerCapabilities.playbackControl]

class BenchmarkPlayer implements Player {
  #source: IIterableSource
  #name: string
  #listener?: (state: PlayerState) => Promise<void>
  #subscriptions: SubscribePayload[] = []
  #blockLoader?: BlockLoader
  #problemManager = new PlayerProblemManager()
  #closed = false

  public constructor(name: string, source: IIterableSource) {
    this.#name = name
    this.#source = source
  }

  public setListener(listener: (state: PlayerState) => Promise<void>): void {
    this.#listener = listener
    void this.#run()
  }

  public close(): void {
    this.#closed = true
    void this.#blockLoader?.stopLoading()
  }

  public setSubscriptions(subscriptions: SubscribePayload[]): void {
    this.#subscriptions = subscriptions
  }

  public setPublishers(_publishers: AdvertiseOptions[]): void {
    // This playback-only benchmark does not advertise publishers.
  }

  public setParameter(_key: string, _value: unknown): void {
    throw new Error(
      'Parameter editing is not supported by the benchmark data source',
    )
  }

  public publish(_request: PublishPayload): void {
    throw new Error('Publishing is not supported by the benchmark data source')
  }

  public async callService(
    _service: string,
    _request: unknown,
  ): Promise<unknown> {
    throw new Error(
      'Service calls are not supported by the benchmark data source',
    )
  }

  public setGlobalVariables(_globalVariables: GlobalVariables): void {}

  async #run() {
    const listener = this.#listener
    if (!listener) {
      throw new Error('Invariant: listener is not set')
    }

    log.info('Initializing benchmark player')

    await listener({
      profile: undefined,
      presence: PlayerPresence.INITIALIZING,
      name: `${this.#name}\ninitializing source`,
      playerId: this.#name,
      capabilities: CAPABILITIES,
      progress: {},
    })
    if (this.#closed) {
      return
    }

    // initialize
    const result = await this.#source.initialize()
    if (this.#closed) {
      return
    }

    const {
      start: startTime,
      end: endTime,
      topicStats,
      datatypes,
      topics,
    } = result

    // Bail on any problems
    for (const problem of result.problems) {
      throw new Error(problem.message)
    }

    do {
      log.info('Waiting for topic subscriptions…')

      // Allow the layout to subscribe to any messages it needs
      await delay(500)
      if (this.#closed) {
        return
      }

      await listener({
        profile: undefined,
        presence: PlayerPresence.INITIALIZING,
        name: `${this.#name}\ngetting messages`,
        playerId: this.#name,
        capabilities: CAPABILITIES,
        progress: {},
        activeData: {
          messages: [],
          totalBytesReceived: 0,
          currentTime: startTime,
          startTime,
          isPlaying: false,
          speed: 1,
          lastSeekTime: 1,
          endTime,
          topics,
          topicStats,
          datatypes,
        },
      })
    } while (!this.#closed && this.#subscriptions.length === 0)

    if (this.#closed) {
      return
    }

    // Get all messages for our subscriptions
    const subscribeTopics = new Map(
      this.#subscriptions.map(sub => [sub.topic, sub]),
    )
    const topicsForPreload = new Map(
      filterMap(this.#subscriptions, sub =>
        sub.preloadType === 'full' ? [sub.topic, sub] : undefined),
    )
    const iterator = this.#source.messageIterator({
      topics: subscribeTopics,
    })
    try {
      this.#blockLoader = new BlockLoader({
        cacheSizeBytes: DEFAULT_CACHE_SIZE_BYTES,
        source: this.#source,
        start: startTime,
        end: endTime,
        maxBlocks: MAX_BLOCKS,
        minBlockDurationNs: MIN_MEM_CACHE_BLOCK_SIZE_NS,
        problemManager: this.#problemManager,
      })
    }
    catch (err) {
      log.error(err)

      const startStr = toRFC3339String(startTime)
      const endStr = toRFC3339String(endTime)

      this.#problemManager.addProblem('block-loader', {
        severity: 'warn',
        message: 'Failed to initialize message preloading',
        tip: `The start (${startStr}) and end (${endStr}) of your data is too far apart.`,
        error: err,
      })
    }
    this.#blockLoader?.setTopics(topicsForPreload)

    const msgEvents: MessageEvent[] = []
    const frameMs: number[] = []

    // Load all messages into memory
    for await (const item of iterator) {
      if (this.#closed) {
        return
      }
      // any problem bails
      if (item.type === 'problem') {
        throw new Error(item.problem.message)
      }
      if (item.type === 'message-event') {
        msgEvents.push(item.msgEvent)
      }
      frameMs.push(0)
    }
    let progressForListener: Progress = {}

    log.info('Preloading messages')
    performance.mark('preloading-start')
    await this.#blockLoader?.startLoading({
      progress: (progress: Progress) => {
        progressForListener = progress
        if (
          progress.fullyLoadedFractionRanges?.length === 1
          && progress.fullyLoadedFractionRanges[0]!.end === 1
        ) {
          void this.#blockLoader?.stopLoading()
        }
      },
    })
    if (this.#closed) {
      return
    }
    performance.mark('preloading-end')
    performance.measure('preloading', 'preloading-start', 'preloading-end')

    log.info(`Starting playback of ${msgEvents.length} message events`)

    performance.mark('message-emit-start')

    let totalBytesReceived = 0
    for (let i = 0; i < msgEvents.length && !this.#closed; i++) {
      const msgEvent = msgEvents[i]!
      totalBytesReceived += msgEvent.sizeInBytes
      const startFrame = performance.now()
      await listener({
        profile: undefined,
        presence: PlayerPresence.PRESENT,
        name: this.#name,
        playerId: this.#name,
        capabilities: CAPABILITIES,
        progress: progressForListener,
        activeData: {
          messages: [msgEvent],
          totalBytesReceived,
          startTime,
          endTime,
          currentTime: msgEvent.receiveTime,
          isPlaying: true,
          speed: 1,
          lastSeekTime: 1,
          topics,
          topicStats,
          datatypes,
        },
      })
      if (this.#closed) {
        return
      }
      const endFrame = performance.now()
      frameMs[i] = endFrame - startFrame
    }

    performance.mark('message-emit-end')
    performance.measure(
      'message-emit',
      'message-emit-start',
      'message-emit-end',
    )

    // Discard the first and last frames
    const filteredFrameMs = frameMs.slice(1, -1)

    const frameMsStats = getFrameStats(filteredFrameMs)

    log.info(
      `Frame time (filtered) average: ${frameMsStats.avgFrameMs}, median: ${frameMsStats.medianFrameMs}, P90: ${frameMsStats.p90FrameMs}`,
    )

    console.log(frameMs)

    const tries = 20
    const steps = 10
    const seekFramesMsTotals = Array.from({ length: steps }).fill(0) as number[]
    for (let count = 0; count < tries && !this.#closed; count++) {
      const seekFramesMs = []
      // test seek backwards over 10 steps
      for (let i = steps - 1; i >= 0 && !this.#closed; i--) {
        const seekToMessage
          = msgEvents[Math.floor((i / steps) * msgEvents.length)]!
        const startFrame = performance.now()
        await listener({
          profile: undefined,
          presence: PlayerPresence.PRESENT,
          name: this.#name,
          playerId: this.#name,
          capabilities: CAPABILITIES,
          progress: progressForListener,
          activeData: {
            messages: [seekToMessage],
            totalBytesReceived,
            startTime,
            endTime,
            currentTime: seekToMessage.receiveTime,
            isPlaying: false,
            speed: 1,
            lastSeekTime: Date.now(),
            topics,
            topicStats,
            datatypes,
          },
        })
        if (this.#closed) {
          return
        }
        const endFrame = performance.now()
        seekFramesMs.push(endFrame - startFrame)
      }
      seekFramesMs.forEach((ms, i) => (seekFramesMsTotals[i]! += ms))
    }

    log.info(
      `Seek frame times (from end to beginning of playtime): ${seekFramesMsTotals
        .map((total) => {
          return (total / tries).toFixed(2)
        })
        .join('ms, ')}ms`,
    )
  }
}

function getFrameStats(frames: number[]) {
  const totalFrameMs = frames.reduce((a, b) => a + b, 0)
  const avgFrameMs = totalFrameMs / frames.length

  const sortedFrameMs = frames.sort()
  const medianFrameMs = sortedFrameMs[Math.floor(sortedFrameMs.length * 0.5)]!
  const p90FrameMs = sortedFrameMs[Math.floor(sortedFrameMs.length * 0.9)]!
  return {
    avgFrameMs,
    medianFrameMs,
    p90FrameMs,
  }
}

export { BenchmarkPlayer }
