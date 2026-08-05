// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import Logger from '@catrobotics/log'

import { useRef } from 'react'

const log = Logger.getLogger(import.meta.url)

function useMustNotChangeImpl(value: unknown): void {
  const valueRef = useRef<unknown>(value)
  if (valueRef.current !== value) {
    log.error('Value must not change', valueRef.current)
  }
  valueRef.current = value
}

function noOpImpl() {}

/**
 * useMustNotChange throws if the value provided as the first argument ever changes.
 *
 * Note: In production builds this hook is a no-op.
 *
 */
const useMustNotChange = import.meta.env.DEV ? useMustNotChangeImpl : noOpImpl

export default useMustNotChange

// for tests
export { useMustNotChangeImpl }
