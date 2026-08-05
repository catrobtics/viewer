// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { Immutable, MessageEvent, ParameterValue } from '@catrobotics/studio'
import type { BuiltinPanelExtensionContext } from '@catrobotics/studio-base/components/PanelExtensionAdapter'
import type {
  AdvertiseOptions,
  PlayerState,
  PublishPayload,
  SubscribePayload,
  Topic,
} from '@catrobotics/studio-base/players/types'
import type { RosDatatypes } from '@catrobotics/studio-base/types/RosDatatypes'
import type { Time } from '@foxglove/rostime'

type ResumeFrame = () => void
export type MessagePipelineContext = Immutable<{
  playerState: PlayerState
  sortedTopics: Topic[]
  datatypes: RosDatatypes
  subscriptions: SubscribePayload[]
  messageEventsBySubscriberId: Map<string, MessageEvent[]>
  setSubscriptions: (id: string, subscriptionsForId: Immutable<SubscribePayload[]>) => void
  setPublishers: (id: string, publishersForId: AdvertiseOptions[]) => void
  setParameter: (key: string, value: ParameterValue) => void
  publish: (request: PublishPayload) => void
  callService: (service: string, request: unknown) => Promise<unknown>
  fetchAsset: BuiltinPanelExtensionContext['unstable_fetchAsset']
  startPlayback?: () => void
  pausePlayback?: () => void
  playUntil?: (time: Time) => void
  setPlaybackSpeed?: (speed: number) => void
  seekPlayback?: (time: Time) => void
  // Don't render the next frame until the returned function has been called.
  pauseFrame: (name: string) => ResumeFrame
}>
