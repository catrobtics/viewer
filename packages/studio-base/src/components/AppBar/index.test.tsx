/** @vitest-environment jsdom */
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import MockMessagePipelineProvider from '@catrobotics/studio-base/components/MessagePipeline/MockMessagePipelineProvider'

import MultiProvider from '@catrobotics/studio-base/components/MultiProvider'
import StudioToastProvider from '@catrobotics/studio-base/components/StudioToastProvider'
import AppConfigurationContext from '@catrobotics/studio-base/context/AppConfigurationContext'
import MockCurrentLayoutProvider from '@catrobotics/studio-base/providers/CurrentLayoutProvider/MockCurrentLayoutProvider'
import TimelineInteractionStateProvider from '@catrobotics/studio-base/providers/TimelineInteractionStateProvider'
import WorkspaceContextProvider from '@catrobotics/studio-base/providers/WorkspaceContextProvider'
import ThemeProvider from '@catrobotics/studio-base/theme/ThemeProvider'
import { makeMockAppConfiguration } from '@catrobotics/studio-base/util/makeMockAppConfiguration'
import { render } from '@testing-library/react'

import { AppBar } from '.'

function Wrapper({ children }: React.PropsWithChildren): React.JSX.Element {
  const appConfiguration = makeMockAppConfiguration()
  const providers = [
    <WorkspaceContextProvider />,
    <AppConfigurationContext.Provider value={appConfiguration} />,
    <StudioToastProvider />,
    <TimelineInteractionStateProvider />,
    <MockMessagePipelineProvider />,
    <MockCurrentLayoutProvider />,
    <ThemeProvider isDark />,
  ]
  return <MultiProvider providers={providers}>{children}</MultiProvider>
}

describe('<AppBar />', () => {
  it('calls functions for custom window controls', async () => {
    const mockMinimize = vi.fn()
    const mockMaximize = vi.fn()
    const mockUnmaximize = vi.fn()
    const mockClose = vi.fn()

    const root = render(
      <Wrapper>
        <AppBar
          showCustomWindowControls
          onMinimizeWindow={mockMinimize}
          onMaximizeWindow={mockMaximize}
          onUnmaximizeWindow={mockUnmaximize}
          onCloseWindow={mockClose}
        />
      </Wrapper>,
    )

    const minButton = await root.findByTestId('win-minimize')
    minButton.click()
    expect(mockMinimize).toHaveBeenCalled()

    const maxButton = await root.findByTestId('win-maximize')
    maxButton.click()
    expect(mockMaximize).toHaveBeenCalled()
    expect(mockUnmaximize).not.toHaveBeenCalled()

    root.rerender(
      <Wrapper>
        <AppBar
          showCustomWindowControls
          onMinimizeWindow={mockMinimize}
          onMaximizeWindow={mockMaximize}
          onUnmaximizeWindow={mockUnmaximize}
          onCloseWindow={mockClose}
          isMaximized
          initialZoomFactor={1}
        />
      </Wrapper>,
    )
    maxButton.click()
    expect(mockUnmaximize).toHaveBeenCalled()

    const closeButton = await root.findByTestId('win-close')
    closeButton.click()
    expect(mockClose).toHaveBeenCalled()

    root.unmount()
  })
})
