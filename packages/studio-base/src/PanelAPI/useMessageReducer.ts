// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/
//
// This file incorporates work covered by the following copyright and
// permission notice:
//
//   Copyright 2018-2021 Cruise LLC
//
//   This source code is licensed under the Apache License, Version 2.0,
//   found at http://www.apache.org/licenses/LICENSE-2.0
//   You may not use this file except in compliance with the License.

import type {
  MessagePipelineContext,
} from '@catrobotics/studio-base/components/MessagePipeline'
import type {
  MessageEvent,
  PlayerStateActiveData,
  SubscribePayload,
  SubscriptionPreloadType,
} from '@catrobotics/studio-base/players/types'

import { useShallowMemo } from '@catrobotics/hooks'
import Log from '@catrobotics/log'
import {
  useMessagePipeline,
} from '@catrobotics/studio-base/components/MessagePipeline'
import useShouldNotChangeOften from '@catrobotics/studio-base/hooks/useShouldNotChangeOften'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

const log = Log.getLogger(import.meta.url)

type MessagesReducer<T> = (state: T, messages: readonly MessageEvent[]) => T

interface Params<T> {
  /**
   * Topics to subscribe to. Can be a list of topic strings or `SubscribePayload` objects.
   */
  topics: readonly string[] | SubscribePayload[]
  /**
   * Preload type to be used for topic string subscriptions.
   * Has no effect on `SubscribePayload` topic subscriptions.
   * @default "partial"
   */
  preloadType?: SubscriptionPreloadType

  /**
   * Called on intialization, seek, and when reducers change.
   * @param state - Immutable. `undefined` when called on initialization or seek. Otherwise, the current state.
   * @returns - New state. Must be new reference to trigger rerender.
   */
  restore: (state: T | undefined) => T

  /**
   * Called for all new messages with the current state (Immutable).
   * Return new reference to trigger rerender.
   */
  addMessages: MessagesReducer<T>
}

function selectSetSubscriptions(ctx: MessagePipelineContext) {
  return ctx.setSubscriptions
}

export function useMessageReducer<T>(props: Params<T>): T {
  const [id] = useState(() => uuidv4())
  const { restore, addMessages, preloadType = 'partial' } = props

  useShouldNotChangeOften(props.restore, () => {
    log.warn(
      'useMessageReducer restore() is changing frequently. '
      + 'restore() will be called each time it changes, so a new function '
      + 'shouldn\'t be created on each render. (If you\'re using Hooks, try useCallback.)',
    )
  })
  useShouldNotChangeOften(props.addMessages, () => {
    log.warn(
      'useMessageReducer addMessages() is changing frequently. '
      + 'addMessages() will be called each time it changes, so a new function '
      + 'shouldn\'t be created on each render. (If you\'re using Hooks, try useCallback.)',
    )
  })

  const requestedTopics = useShallowMemo(props.topics)

  const subscriptions = useMemo<SubscribePayload[]>(() => {
    return requestedTopics.map((topic) => {
      if (typeof topic === 'string') {
        return { topic, preloadType }
      }
      else {
        return topic
      }
    })
  }, [preloadType, requestedTopics])

  const setSubscriptions = useMessagePipeline(selectSetSubscriptions)
  useEffect(() => {
    setSubscriptions(id, subscriptions)
  }, [id, setSubscriptions, subscriptions])
  useEffect(() => {
    return () => {
      setSubscriptions(id, [])
    }
  }, [id, setSubscriptions])

  const state = useRef<
    | Readonly<{
      messageEvents: PlayerStateActiveData['messages'] | undefined
      lastSeekTime: number | undefined
      reducedValue: T
      restore: typeof restore
      addMessages: typeof addMessages
    }>
    | undefined
  >(undefined)

  return useMessagePipeline(
    useCallback(
      // To compute the reduced value from new messages:
      // - Call restore() to initialize state, if lastSeekTime has changed, or if reducers have changed
      // - Call addMessages() if any new messages of interest have arrived
      // - Otherwise, return the previous reducedValue so that we don't trigger an unnecessary render.
      (ctx: MessagePipelineContext): T => {
        const messageEvents = ctx.messageEventsBySubscriberId.get(id)
        const lastSeekTime = ctx.playerState.activeData?.lastSeekTime

        let newReducedValue: T
        if (!state.current || lastSeekTime !== state.current.lastSeekTime) {
          newReducedValue = restore(undefined)
        }
        else if (
          restore !== state.current.restore
          || addMessages !== state.current.addMessages
        ) {
          newReducedValue = restore(state.current.reducedValue)
        }
        else {
          newReducedValue = state.current.reducedValue
        }

        if (
          messageEvents
          && messageEvents.length > 0
          && messageEvents !== state.current?.messageEvents
        ) {
          newReducedValue = addMessages(newReducedValue, messageEvents)
        }

        state.current = {
          messageEvents,
          lastSeekTime,
          reducedValue: newReducedValue,
          restore,
          addMessages,
        }

        return state.current.reducedValue
      },
      [id, addMessages, restore],
    ),
  )
}
