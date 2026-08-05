/** @vitest-environment jsdom */
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type {
  PanelCatalog,
  PanelInfo,
} from '@catrobotics/studio-base/context/PanelCatalogContext'
import Panel from '@catrobotics/studio-base/components/Panel'
import AppConfigurationContext from '@catrobotics/studio-base/context/AppConfigurationContext'
import PanelCatalogContext from '@catrobotics/studio-base/context/PanelCatalogContext'
import MockCurrentLayoutProvider from '@catrobotics/studio-base/providers/CurrentLayoutProvider/MockCurrentLayoutProvider'

import { PanelStateContextProvider } from '@catrobotics/studio-base/providers/PanelStateContextProvider'
import WorkspaceContextProvider from '@catrobotics/studio-base/providers/WorkspaceContextProvider'
import { makeMockAppConfiguration } from '@catrobotics/studio-base/util/makeMockAppConfiguration'
import { render, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { UnconnectedPanelLayout } from './PanelLayout'

class MockPanelCatalog implements PanelCatalog {
  public constructor(private allPanels: PanelInfo[]) {}
  public getPanels(): readonly PanelInfo[] {
    return this.allPanels
  }

  public getPanelByType(type: string): PanelInfo | undefined {
    return this.allPanels.find(panel => !panel.config && panel.type === type)
  }
}

describe('unconnectedPanelLayout', () => {
  beforeEach(() => {
    // jsdom can't parse our @container CSS so we have to silence console.error for this test.
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.mocked(console.error).mockRestore()
  })

  it('does not remount panels when changing split percentage', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const renderA = vi.fn().mockReturnValue(<>A</>)
    const moduleA = vi.fn().mockResolvedValue({
      default: Panel(Object.assign(renderA, { panelType: 'a', defaultConfig: {} })),
    })

    const renderB = vi.fn().mockReturnValue(<>B</>)
    const moduleB = vi.fn().mockResolvedValue({
      default: Panel(Object.assign(renderB, { panelType: 'b', defaultConfig: {} })),
    })

    const renderC = vi.fn().mockReturnValue(<>C</>)
    const moduleC = vi.fn().mockResolvedValue({
      default: Panel(Object.assign(renderC, { panelType: 'c', defaultConfig: {} })),
    })

    const panels: PanelInfo[] = [
      { title: 'A', type: 'a', module: moduleA },
      { title: 'B', type: 'b', module: moduleB },
      { title: 'C', type: 'c', module: moduleC },
    ]

    const panelCatalog = new MockPanelCatalog(panels)

    const onChange = () => {
      throw new Error('unexpected call to onChange')
    }
    const { getByText, queryByTitle, rerender, unmount } = render(
      <UnconnectedPanelLayout
        layout={{ first: 'a', second: 'b', direction: 'row', splitPercentage: 50 }}
        onChange={onChange}
      />,
      {
        wrapper: function Wrapper({ children }: React.PropsWithChildren) {
          const [config] = useState(() => makeMockAppConfiguration())

          return (
            <DndProvider backend={HTML5Backend}>
              <WorkspaceContextProvider>
                <AppConfigurationContext.Provider value={config}>
                  <MockCurrentLayoutProvider>
                    <PanelStateContextProvider>
                      <PanelCatalogContext.Provider value={panelCatalog}>
                        {children}
                      </PanelCatalogContext.Provider>
                    </PanelStateContextProvider>
                  </MockCurrentLayoutProvider>
                </AppConfigurationContext.Provider>
              </WorkspaceContextProvider>
            </DndProvider>
          )
        },
      },
    )

    await waitFor(() => {
      expect(renderA).toHaveBeenCalled()
    })
    // Each panel module should have only been loaded once
    expect(moduleA).toHaveBeenCalledTimes(1)
    expect(moduleB).toHaveBeenCalledTimes(1)
    expect(moduleC).toHaveBeenCalledTimes(0)
    expect(renderC).toHaveBeenCalledTimes(0)
    const panelAElement = await waitFor(() => getByText('A'))
    const panelBElement = getByText('B')
    expect(queryByTitle('Replace Window')).toBeNull()
    expect(queryByTitle('Split Window')).toBeNull()

    // Resizing the split must preserve both panel component instances.
    rerender(
      <UnconnectedPanelLayout
        layout={{ first: 'a', second: 'b', direction: 'row', splitPercentage: 40 }}
        onChange={onChange}
      />,
    )
    expect(getByText('A')).toBe(panelAElement)
    expect(getByText('B')).toBe(panelBElement)

    rerender(
      <UnconnectedPanelLayout
        layout={{ first: 'a', second: 'c', direction: 'row', splitPercentage: 40 }}
        onChange={onChange}
      />,
    )
    await waitFor(() => {
      expect(renderC).toHaveBeenCalled()
    })
    // Each panel module should only be loaded once when a tile is replaced.
    expect(moduleA).toHaveBeenCalledTimes(1)
    expect(moduleB).toHaveBeenCalledTimes(1)
    expect(moduleC).toHaveBeenCalledTimes(1)

    unmount()
  })
})
