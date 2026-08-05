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

// this type mirrors the MessageChannel and MessagePort APIs which are available on
// instances of web-workers and shared-workers respectively, as well as avaiable on
// 'global' within them.
export interface Channel {
  postMessage(data: unknown, transfer?: Transferable[]): void
  onmessage?: ((ev: MessageEvent) => unknown) | null
  terminate: () => void
}

const RESPONSE = '$$RESPONSE'
const ERROR = '$$ERROR'

interface RpcEnvelope {
  id: number
  topic: string
  data?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value != undefined
}

function isRpcError(value: unknown): value is Record<typeof ERROR, true> & {
  name: string
  message: string
  stack?: string
} {
  return isRecord(value)
    && value[ERROR] === true
    && typeof value.name === 'string'
    && typeof value.message === 'string'
    && (value.stack == undefined || typeof value.stack === 'string')
}

// helper function to create linked channels for testing
export function createLinkedChannels(): { local: Channel, remote: Channel } {
  const local: Channel = {
    onmessage: undefined,

    postMessage(data: unknown, _transfer?: Array<ArrayBuffer>) {
      const ev = new MessageEvent('message', { data })
      if (remote.onmessage) {
        remote.onmessage(ev)
      }
    },
    terminate: () => {
      // no-op
    },
  }

  const remote: Channel = {
    onmessage: undefined,

    postMessage(data: unknown, _transfer?: Array<ArrayBuffer>) {
      const ev = new MessageEvent('message', { data })
      if (local.onmessage) {
        local.onmessage(ev)
      }
    },
    terminate: () => {
      // no-op
    },
  }
  return { local, remote }
}

// This class allows you to hook up bi-directional async calls across web-worker
// boundaries where a single call to or from a worker can 'wait' on the response.
// Errors in receivers are propigated back to the caller as a rejection.
// It also supports returning transferables over the web-worker postMessage api,
// which was the main shortcomming with the worker-rpc npm module.
// To attach rpc to an instance of a worker in the main thread:
//   const rpc = new Rpc(workerInstace);
// To attach rpc within an a web worker:
//   const rpc = new Rpc(global);
// Check out the tests for more examples.
export default class Rpc {
  public static transferables = '$$TRANSFERABLES'
  #channel: Omit<Channel, 'terminate'>
  #messageId: number = 0
  #pendingCallbacks: Record<number, (info: RpcEnvelope) => void> = {}
  #receivers = new Map<string, (arg0: unknown) => unknown>()

  public constructor(channel: Omit<Channel, 'terminate'>) {
    this.#channel = channel
    if (this.#channel.onmessage) {
      throw new Error(
        'channel.onmessage is already set. Can only use one Rpc instance per channel.',
      )
    }
    this.#channel.onmessage = this.#onChannelMessage
  }

  #onChannelMessage = (ev: MessageEvent<RpcEnvelope>): void => {
    const { id, topic, data } = ev.data
    if (topic === RESPONSE) {
      this.#pendingCallbacks[id]?.(ev.data)
      delete this.#pendingCallbacks[id]
      return
    }
    // invoke the receive handler in a promise so if it throws synchronously we can reject
    new Promise<unknown>((resolve) => {
      const handler = this.#receivers.get(topic)
      if (!handler) {
        throw new Error(`no receiver registered for ${topic}`)
      }
      // This works both when `handler` returns a value or a Promise.

      resolve(handler(data))
    })
      .then((result) => {
        if (result == undefined) {
          this.#channel.postMessage({ topic: RESPONSE, id })
          return
        }
        let transferables: Transferable[] | undefined
        if (isRecord(result)) {
          const candidateTransferables = result[Rpc.transferables]
          if (Array.isArray(candidateTransferables)) {
            transferables = candidateTransferables.filter(
              (item): item is Transferable => typeof item === 'object' && item != undefined,
            )
          }
          delete result[Rpc.transferables]
        }
        const message = {
          topic: RESPONSE,
          id,
          data: result,
        }
        this.#channel.postMessage(message, transferables)
      })
      .catch((cause: unknown) => {
        const err = cause instanceof Error ? cause : new Error(String(cause))
        const message = {
          topic: RESPONSE,
          id,
          data: {
            [ERROR]: true,
            name: err.name,
            message: err.message,
            stack: err.stack,
          },
        }
        this.#channel.postMessage(message)
      })
  }

  /** Call this when the channel has been terminated to reject any outstanding send callbacks. */
  public terminate(): void {
    for (const [id, callback] of Object.entries(this.#pendingCallbacks)) {
      callback({
        topic: RESPONSE,
        id: Number(id),
        data: {
          [ERROR]: true,
          name: 'Error',
          message: 'Rpc terminated',
          stack: new Error('Rpc terminated').stack,
        },
      })
    }
  }

  // send a message across the rpc boundary to a receiver on the other side
  // this returns a promise for the receiver's response.  If there is no registered
  // receiver for the given topic, this method throws
  public async send<TResult, TData = unknown>(
    topic: string,
    data?: TData,
    transfer?: Transferable[],
  ): Promise<TResult> {
    const id = this.#messageId++
    const message = { topic, id, data }
    const result = new Promise<TResult>((resolve, reject) => {
      this.#pendingCallbacks[id] = (info) => {
        if (isRpcError(info.data)) {
          const error = new Error(info.data.message)
          error.name = info.data.name
          error.stack = info.data.stack
          reject(error)
        }
        else {
          resolve(info.data as TResult)
        }
      }
    })
    this.#channel.postMessage(message, transfer)
    return await result
  }

  // register a receiver for a given message on a topic
  // only one receiver can be registered per topic and currently
  // 'deregistering' a receiver is not supported since this is not common
  public receive<T, TOut>(topic: string, handler: (arg0: T) => TOut): void {
    if (this.#receivers.has(topic)) {
      throw new Error(`Receiver already registered for topic: ${topic}`)
    }
    this.#receivers.set(topic, data => handler(data as T))
  }
}
