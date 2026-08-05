// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type {
  MessagePipelineContext,
} from '@catrobotics/studio-base/components/MessagePipeline'
import { AppSetting } from '@catrobotics/studio-base/AppSetting'
import {
  useMessagePipeline,
} from '@catrobotics/studio-base/components/MessagePipeline'

import { useAppConfigurationValue, useAppTimeFormat } from '@catrobotics/studio-base/hooks'
import { format } from '@catrobotics/studio-base/util/formatTime'
import { formatTimeRaw, isAbsoluteTime } from '@catrobotics/studio-base/util/time'
import { useTheme } from '@mui/material'
import { useEffect, useRef } from 'react'

const selectEndTime = (ctx: MessagePipelineContext) => ctx.playerState.activeData?.endTime

export function EndTimestamp(): React.JSX.Element | null {
  const endTime = useMessagePipeline(selectEndTime)
  const [timezone] = useAppConfigurationValue<string>(AppSetting.TIMEZONE)
  const { timeFormat } = useAppTimeFormat()
  const theme = useTheme()

  const timeRef = useRef<HTMLDivElement>(null)

  // We bypass react and update the DOM elements directly for better performance here.
  useEffect(() => {
    if (!timeRef.current) {
      return
    }
    if (endTime == undefined) {
      timeRef.current.textContent = ''
      return
    }
    const timeOfDayString = format(endTime, timezone)
    const timeRawString = formatTimeRaw(endTime)

    timeRef.current.textContent
      = timeFormat === 'SEC' || !isAbsoluteTime(endTime) ? timeRawString : timeOfDayString
  }, [endTime, timeFormat, timezone])

  return (
    <div
      style={{ fontFeatureSettings: `${theme.typography.fontFeatureSettings}, "zero"` }}
      ref={timeRef}
    />
  )
}
