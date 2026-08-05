// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { StoryObj } from '@storybook/react-vite'
import type { ReactElement } from 'react'

import { LaunchingInDesktopScreen } from '@catrobotics/studio-base/screens/LaunchingInDesktopScreen'

export default {
  title: 'LaunchingInDesktopScreen',
  component: LaunchingInDesktopScreen,
}

export const LaunchingInDesktopScreenRender: StoryObj = {
  render: (): ReactElement => {
    return <LaunchingInDesktopScreen />
  },
}
