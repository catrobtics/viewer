// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { Time } from '@foxglove/rostime'
import type { StoryObj } from '@storybook/react-vite'
import type { PropsWithChildren } from 'react'

import { AppSetting } from '@catrobotics/studio-base/AppSetting'
import Timestamp from '@catrobotics/studio-base/components/Timestamp'
import AppConfigurationContext from '@catrobotics/studio-base/context/AppConfigurationContext'
import { makeMockAppConfiguration } from '@catrobotics/studio-base/util/makeMockAppConfiguration'
import { Stack } from '@mui/material'
import { useState } from 'react'

const ABSOLUTE_TIME = { sec: 1643800942, nsec: 222222222 }
const RELATIVE_TIME = { sec: 630720000, nsec: 597648236 }

export default {
  component: Timestamp,
  title: 'components/Timestamp',
}

interface Props {
  config?: [AppSetting, string | undefined][]
  time: Time
}

function TimestampStory(props: PropsWithChildren<Props>): React.JSX.Element {
  const { config, time } = props
  const [value] = useState(() => makeMockAppConfiguration(config))

  return (
    <AppConfigurationContext.Provider value={value}>
      <Stack
        spacing={2}
        sx={{
          padding: 2,
        }}
      >
        <Timestamp horizontal time={time} />
        <Timestamp time={time} />
        <Timestamp disableDate time={time} />
      </Stack>
    </AppConfigurationContext.Provider>
  )
}

export const Default: StoryObj = {
  render: () => {
    return <TimestampStory config={[[AppSetting.TIMEZONE, 'UTC']]} time={ABSOLUTE_TIME} />
  },
}

export const TimeFormatSeconds: StoryObj = {
  render: () => {
    return (
      <TimestampStory
        config={[
          [AppSetting.TIME_FORMAT, 'SEC'],
          [AppSetting.TIMEZONE, 'UTC'],
        ]}
        time={ABSOLUTE_TIME}
      />
    )
  },
}

export const TimeFormatTOD: StoryObj = {
  render: () => {
    return (
      <TimestampStory
        config={[
          [AppSetting.TIME_FORMAT, 'TOD'],
          [AppSetting.TIMEZONE, 'UTC'],
        ]}
        time={ABSOLUTE_TIME}
      />
    )
  },
}

export const TimeFormatRelative: StoryObj = {
  render: () => {
    return (
      <TimestampStory
        config={[
          [AppSetting.TIME_FORMAT, 'TOD'],
          [AppSetting.TIMEZONE, 'UTC'],
        ]}
        time={RELATIVE_TIME}
      />
    )
  },
}
