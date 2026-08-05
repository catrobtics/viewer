// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { useCallback, useSyncExternalStore } from 'react'

const SESSION_STORAGE_CHANGE_EVENT = 'catrobotics:session-storage-change'
const sessionStorageEvents = new EventTarget()

/**
 * This provides a convenience wrapper around sessionStorage and triggers
 * a react state change when values change.
 *
 * @param key sessionStorage key to manage.
 * @returns [value, setValue] tuple for that key.
 */
export function useSessionStorageValue(
  key: string,
): [value: string | undefined, setValue: (newValue: string | undefined) => void] {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const onLocalChange = (event: Event) => {
        if ((event as CustomEvent<string>).detail === key) {
          onStoreChange()
        }
      }
      const onStorage = (event: StorageEvent) => {
        if (event.storageArea === sessionStorage && event.key === key) {
          onStoreChange()
        }
      }

      sessionStorageEvents.addEventListener(SESSION_STORAGE_CHANGE_EVENT, onLocalChange)
      window.addEventListener('storage', onStorage)
      return () => {
        sessionStorageEvents.removeEventListener(SESSION_STORAGE_CHANGE_EVENT, onLocalChange)
        window.removeEventListener('storage', onStorage)
      }
    },
    [key],
  )
  const getSnapshot = useCallback(() => sessionStorage.getItem(key) ?? undefined, [key])
  const value = useSyncExternalStore(subscribe, getSnapshot, () => undefined)

  const setValue = useCallback(
    (newValue: string | undefined) => {
      if (newValue != undefined) {
        sessionStorage.setItem(key, newValue)
      }
      else {
        sessionStorage.removeItem(key)
      }

      sessionStorageEvents.dispatchEvent(
        new CustomEvent<string>(SESSION_STORAGE_CHANGE_EVENT, { detail: key }),
      )
    },
    [key],
  )

  return [value, setValue]
}
