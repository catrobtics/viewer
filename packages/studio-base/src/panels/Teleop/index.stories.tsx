// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { StoryContext, StoryFn, StoryObj } from '@storybook/react-vite'
import { PlayerCapabilities } from '@catrobotics/studio-base/players/types'

import PanelSetup from '@catrobotics/studio-base/stories/PanelSetup'
import { fn } from 'storybook/test'

import TeleopPanel from './index'

export default {
  title: 'panels/Teleop',
  component: TeleopPanel,
  decorators: [
    (StoryComponent: StoryFn, context: StoryContext): React.JSX.Element => {
      return (
        <PanelSetup
          fixture={{ capabilities: [PlayerCapabilities.advertise], publish: fn() }}
          includeSettings={context.parameters.includeSettings}
        >
          <StoryComponent />
        </PanelSetup>
      )
    },
  ],
}

export const Unconfigured: StoryObj = {
  render: () => {
    return <TeleopPanel />
  },
}

export const WithSettings: StoryObj = {
  render: function Story() {
    return <TeleopPanel overrideConfig={{ topic: '/abc' }} />
  },

  parameters: {
    colorScheme: 'light',
    includeSettings: true,
  },
}

export const WithTopic: StoryObj = {
  render: () => {
    return <TeleopPanel overrideConfig={{ topic: '/abc' }} />
  },
}
