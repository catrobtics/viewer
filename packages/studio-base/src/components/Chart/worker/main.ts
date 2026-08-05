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

// Entrypoint for chartjs worker

import type { Channel } from '@catrobotics/studio-base/util/Rpc'
import Rpc from '@catrobotics/studio-base/util/Rpc'
import { inWebWorker } from '@catrobotics/studio-base/util/workers'

import ChartJsMux from './ChartJsMux'

if (inWebWorker()) {
  const workerChannel: Omit<Channel, 'terminate'> = {
    onmessage: null,
    postMessage(data, transfer) {
      const postMessage = Reflect.get(globalThis, 'postMessage')
      if (typeof postMessage !== 'function') {
        throw new TypeError('Chart worker cannot post messages')
      }
      Reflect.apply(postMessage, globalThis, [data, transfer ?? []])
    },
  }
  globalThis.addEventListener('message', event => workerChannel.onmessage?.(event))
  void new ChartJsMux(new Rpc(workerChannel))
}
