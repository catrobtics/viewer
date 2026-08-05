// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { StoryObj } from '@storybook/react-vite'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { fn } from 'storybook/test'

import PanelErrorBoundary from './PanelErrorBoundary'

function Broken(): React.JSX.Element | null {
  throw Object.assign(new Error('Hello!'), {
    stack: `
  an error occurred
  it's caught by this component
  now the user sees
      `,
  })
  return null
}

export default {
  title: 'components/PanelErrorBoundary',
}

export const Default: StoryObj = {
  render: () => {
    return (
      <DndProvider backend={HTML5Backend}>
        <PanelErrorBoundary
          onRemovePanel={fn()}
          onResetPanel={fn()}
        >
          <Broken />
        </PanelErrorBoundary>
      </DndProvider>
    )
  },
}

export const ShowingDetails: StoryObj = {
  render: () => {
    return (
      <DndProvider backend={HTML5Backend}>
        <PanelErrorBoundary
          showErrorDetails
          hideErrorSourceLocations
          onRemovePanel={fn()}
          onResetPanel={fn()}
        >
          <Broken />
        </PanelErrorBoundary>
      </DndProvider>
    )
  },
}
