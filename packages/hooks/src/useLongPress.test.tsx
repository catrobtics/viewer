// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { act, renderHook } from '@testing-library/react'

import { useLongPress } from './useLongPress'

describe('useLongPress', () => {
  it('fires after the delay and cancels when released early', () => {
    vi.useFakeTimers()
    const callback = vi.fn()
    const { result } = renderHook(() => useLongPress(callback, 300))
    const event = { button: 0, isPrimary: true } as React.PointerEvent

    act(() => result.current.onPointerDown(event))
    act(() => vi.advanceTimersByTime(299))
    expect(callback).not.toHaveBeenCalled()
    act(() => result.current.onPointerUp(event))
    act(() => vi.advanceTimersByTime(1))
    expect(callback).not.toHaveBeenCalled()

    act(() => result.current.onPointerDown(event))
    act(() => vi.advanceTimersByTime(300))
    expect(callback).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })
})
