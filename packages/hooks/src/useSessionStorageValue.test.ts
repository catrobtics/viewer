/** @vitest-environment jsdom */
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { act, renderHook } from '@testing-library/react'

import { useSessionStorageValue } from './useSessionStorageValue'

describe('useSessionStorageValue', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('synchronizes updates in the current document', () => {
    const first = renderHook(() => useSessionStorageValue('preference'))
    const second = renderHook(() => useSessionStorageValue('preference'))

    act(() => first.result.current[1]('desktop'))

    expect(first.result.current[0]).toBe('desktop')
    expect(second.result.current[0]).toBe('desktop')
  })

  it('preserves empty strings and removes only undefined values', () => {
    const { result } = renderHook(() => useSessionStorageValue('preference'))

    act(() => result.current[1](''))
    expect(result.current[0]).toBe('')
    expect(sessionStorage.getItem('preference')).toBe('')

    act(() => result.current[1](undefined))
    expect(result.current[0]).toBeUndefined()
    expect(sessionStorage.getItem('preference')).toBeNull()
  })

  it('tracks storage events from other documents', () => {
    const { result } = renderHook(() => useSessionStorageValue('preference'))
    sessionStorage.setItem('preference', 'web')

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'preference',
          newValue: 'web',
          storageArea: sessionStorage,
        }),
      )
    })

    expect(result.current[0]).toBe('web')
  })
})
