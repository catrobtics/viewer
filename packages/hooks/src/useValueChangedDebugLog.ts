// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import Logger from '@catrobotics/log'

import { useLayoutEffect, useRef } from 'react'

const log = Logger.getLogger(import.meta.url)

function noOpImpl() {}

function useValueChangedDebugLogImpl(value: unknown, msg: string): void {
  const prevValue = useRef<unknown>(value)
  if (prevValue.current !== value) {
    log.debug(`value changed: ${msg}`)
  }
  useLayoutEffect(() => {
    prevValue.current = value
  })
}

/**
 * useValueChangedDebugLog logs `msg` if `value` changes
 *
 * Note: In production builds this hook is a no-op.
 */
const useValueChangedDebugLog
  = import.meta.env.DEV || import.meta.env.MODE === 'test' ? useValueChangedDebugLogImpl : noOpImpl

export default useValueChangedDebugLog
