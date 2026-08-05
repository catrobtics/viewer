// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { act, renderHook, waitFor } from '@testing-library/react'

import { useAsync, useAsyncFn } from './useAsync'

describe('useAsync', () => {
  it('runs an async function and stores its value', async () => {
    const { result } = renderHook(() => useAsync(async () => 42, []))

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current).toEqual({ loading: false, value: 42 }))
  })

  it('keeps only the latest invocation result', async () => {
    const resolvers: Array<(value: number) => void> = []
    const { result } = renderHook(() => useAsyncFn(
      async () => await new Promise<number>(resolve => resolvers.push(resolve)),
      [],
    ))

    let first!: Promise<number>
    let second!: Promise<number>
    act(() => {
      first = result.current[1]()
      second = result.current[1]()
    })
    await act(async () => {
      resolvers[1]?.(2)
      await second
      resolvers[0]?.(1)
      await first
    })

    expect(result.current[0]).toEqual({ loading: false, value: 2 })
  })
})
