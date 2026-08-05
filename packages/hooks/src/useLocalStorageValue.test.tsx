// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { act, renderHook } from '@testing-library/react'

import { useLocalStorageValue } from './useLocalStorageValue'

describe('useLocalStorageValue', () => {
  beforeEach(() => localStorage.clear())

  it('loads and persists JSON values', () => {
    localStorage.setItem('settings', JSON.stringify({ enabled: true }))
    const { result } = renderHook(() => useLocalStorageValue('settings', { enabled: false }))

    expect(result.current[0]).toEqual({ enabled: true })
    act(() => result.current[1]({ enabled: false }))
    expect(localStorage.getItem('settings')).toBe('{"enabled":false}')
  })
})
