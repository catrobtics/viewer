// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import DirectionalPad from './DirectionalPad'

export default {
  title: 'panels/Teleop/DirectionalPad',
  component: DirectionalPad,
}

export const Basic: StoryObj = {
  render: () => {
    return <DirectionalPad onAction={fn()} />
  },
}

export const Disabled: StoryObj = {
  render: () => {
    return <DirectionalPad disabled onAction={fn()} />
  },
}
