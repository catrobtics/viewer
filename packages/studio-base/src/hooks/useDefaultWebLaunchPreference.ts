// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type {
  MessagePipelineContext,
} from '@catrobotics/studio-base/components/MessagePipeline'

import { useSessionStorageValue } from '@catrobotics/hooks'
import { AppSetting } from '@catrobotics/studio-base/AppSetting'
import {
  useMessagePipeline,
} from '@catrobotics/studio-base/components/MessagePipeline'
import { LaunchPreferenceValue } from '@catrobotics/studio-base/types/LaunchPreferenceValue'
import isDesktopApp from '@catrobotics/studio-base/util/isDesktopApp'
import { useEffect } from 'react'

const selectHasUrlState = (ctx: MessagePipelineContext) => ctx.playerState.urlState != undefined

export function useDefaultWebLaunchPreference(): void {
  const hasUrlState = useMessagePipeline(selectHasUrlState)
  const [launchPreference, setLaunchPreference] = useSessionStorageValue(
    AppSetting.LAUNCH_PREFERENCE,
  )

  // Set a sessionStorage preference for web if we have a stable URL state.
  // This allows us to avoid asking for the preference immediately on
  // launch of an empty session and makes refreshes do the right thing.
  useEffect(() => {
    if (isDesktopApp()) {
      return
    }

    if (hasUrlState && !launchPreference) {
      setLaunchPreference(LaunchPreferenceValue.WEB)
    }
  }, [launchPreference, setLaunchPreference, hasUrlState])
}
