// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { PropsWithChildren } from 'react'
import type { LocalStorageSaveState } from './types'
import { useLocalStorageValue } from '@catrobotics/hooks'
import Log from '@catrobotics/log'

import { StudioLogsSettingsContext } from '@catrobotics/studio-base/context/StudioLogsSettingsContext'
import { useEffect, useRef, useState } from 'react'

import { createStudioLogsSettingsStore } from './store'

function StudioLogsSettingsProvider(props: PropsWithChildren): React.JSX.Element {
  const [studioLogsSettingsSavedState, setStudioLogsSettingsSavedState]
    = useLocalStorageValue<LocalStorageSaveState>('catrobotics.studio-logs-settings', {})

  const [studioLogsSettingsStore, setStudioLogsSettingsStore] = useState(() =>
    createStudioLogsSettingsStore(studioLogsSettingsSavedState),
  )

  // To avoid resetting effect below when the localstorage state changes we use a ref for the localstorage state
  const savedStateRef = useRef<LocalStorageSaveState>(studioLogsSettingsSavedState)
  useEffect(() => {
    savedStateRef.current = studioLogsSettingsSavedState
  })

  // Setup an interval to check for changes to the total number of logging channels
  //
  // When the total number of channels changes we re-initialize the settings store so we display any
  // newly added log channels.
  useEffect(() => {
    const storeChannelsCount = studioLogsSettingsStore.getState().channels.length
    const intervalHandle = setInterval(() => {
      if (storeChannelsCount !== Log.channels().length) {
        setStudioLogsSettingsStore(createStudioLogsSettingsStore(savedStateRef.current))
      }
    }, 1000)

    return () => {
      clearInterval(intervalHandle)
    }
  }, [studioLogsSettingsStore, studioLogsSettingsSavedState])

  useEffect(() => {
    return studioLogsSettingsStore.subscribe((value) => {
      const disabledChannels: string[] = []

      for (const channel of value.channels) {
        if (!channel.enabled) {
          disabledChannels.push(channel.name)
        }
      }
      setStudioLogsSettingsSavedState({ globalLevel: value.globalLevel, disabledChannels })
    })
  }, [studioLogsSettingsStore, setStudioLogsSettingsSavedState])

  return (
    <StudioLogsSettingsContext.Provider value={studioLogsSettingsStore}>
      {props.children}
    </StudioLogsSettingsContext.Provider>
  )
}

export { StudioLogsSettingsProvider }
