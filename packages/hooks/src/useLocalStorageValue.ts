// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { useCallback, useState } from 'react'

export function useLocalStorageValue<T>(
  key: string,
  initialValue: T,
): [value: T, setValue: (value: T) => void] {
  const [value, setValueState] = useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(key)
      return storedValue == undefined ? initialValue : JSON.parse(storedValue) as T
    }
    catch {
      return initialValue
    }
  })

  const setValue = useCallback((nextValue: T) => {
    try {
      const serializedValue = JSON.stringify(nextValue)
      if (serializedValue == undefined) {
        localStorage.removeItem(key)
      }
      else {
        localStorage.setItem(key, serializedValue)
      }
      setValueState(nextValue)
    }
    catch {
      // Storage access can fail in restricted browser contexts. Keep the last persisted state.
    }
  }, [key])

  return [value, setValue]
}
