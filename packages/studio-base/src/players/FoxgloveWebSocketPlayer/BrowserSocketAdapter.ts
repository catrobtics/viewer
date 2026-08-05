// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { IWebSocket } from '@foxglove/ws-protocol'

function toWebSocketData(data: string | ArrayBuffer | ArrayBufferView): string | ArrayBuffer {
  if (typeof data === 'string' || data instanceof ArrayBuffer) {
    return data
  }
  const copy = new Uint8Array(data.byteLength)
  copy.set(new Uint8Array(data.buffer, data.byteOffset, data.byteLength))
  return copy.buffer
}

export default class BrowserSocketAdapter implements IWebSocket {
  readonly #socket: WebSocket

  public protocol: string = ''
  public onerror: ((event: unknown) => void) | undefined = undefined
  public onopen: ((event: unknown) => void) | undefined = undefined
  public onclose: ((event: unknown) => void) | undefined = undefined
  public onmessage: ((event: unknown) => void) | undefined = undefined

  public constructor(url: string, protocols?: string[] | string) {
    this.#socket = new WebSocket(url, protocols)
    this.#socket.onerror = event => this.onerror?.(event)
    this.#socket.onopen = (event) => {
      this.protocol = this.#socket.protocol
      this.onopen?.(event)
    }
    this.#socket.onclose = event => this.onclose?.(event)
    this.#socket.onmessage = event => this.onmessage?.(event)
  }

  public get binaryType(): string {
    return this.#socket.binaryType
  }

  public set binaryType(value: string) {
    if (value !== 'arraybuffer' && value !== 'blob') {
      throw new TypeError(`Unsupported WebSocket binary type: ${value}`)
    }
    this.#socket.binaryType = value
  }

  public close(): void {
    this.#socket.close()
  }

  public send(data: string | ArrayBuffer | ArrayBufferView): void {
    this.#socket.send(toWebSocketData(data))
  }
}
