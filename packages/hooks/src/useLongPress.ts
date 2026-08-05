// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { PointerEventHandler } from 'react'
import { useCallback, useEffect, useRef } from 'react'

interface LongPressHandlers {
  onPointerCancel: PointerEventHandler
  onPointerDown: PointerEventHandler
  onPointerLeave: PointerEventHandler
  onPointerUp: PointerEventHandler
}

export function useLongPress(callback: () => void, delay = 300): LongPressHandlers {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const cancel = useCallback(() => {
    if (timerRef.current != undefined) {
      clearTimeout(timerRef.current)
      timerRef.current = undefined
    }
  }, [])
  const start = useCallback<PointerEventHandler>((event) => {
    if (!event.isPrimary || event.button !== 0) {
      return
    }
    cancel()
    timerRef.current = setTimeout(callback, delay)
  }, [callback, cancel, delay])

  useEffect(() => cancel, [cancel])

  return {
    onPointerCancel: cancel,
    onPointerDown: start,
    onPointerLeave: cancel,
    onPointerUp: cancel,
  }
}
