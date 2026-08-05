// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { DependencyList } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useMountedState } from './useMountedState'

export interface AsyncState<T> {
  error?: Error
  loading: boolean
  value?: T
}

type AsyncFunction<T, Args extends readonly unknown[]> = (...args: Args) => Promise<T>

function normalizeError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}

export function useAsyncFn<T, Args extends readonly unknown[]>(
  fn: AsyncFunction<T, Args>,
  dependencies: DependencyList,
  initialState: AsyncState<T> = { loading: false },
): [AsyncState<T>, (...args: Args) => Promise<T>] {
  const callIdRef = useRef(0)
  const isMounted = useMountedState()
  const [state, setState] = useState(initialState)

  const callback = useCallback(async (...args: Args) => {
    const callId = ++callIdRef.current
    setState(previous => ({ ...previous, loading: true }))
    try {
      const value = await fn(...args)
      if (isMounted() && callId === callIdRef.current) {
        setState({ loading: false, value })
      }
      return value
    }
    catch (error) {
      const normalizedError = normalizeError(error)
      if (isMounted() && callId === callIdRef.current) {
        setState({ error: normalizedError, loading: false })
      }
      throw normalizedError
    }
  }, dependencies)

  return [state, callback]
}

export function useAsync<T>(fn: () => Promise<T>, dependencies: DependencyList): AsyncState<T> {
  const [state, callback] = useAsyncFn(fn, dependencies, { loading: true })

  useEffect(() => {
    void callback().catch(() => {})
  }, [callback])

  return state
}
