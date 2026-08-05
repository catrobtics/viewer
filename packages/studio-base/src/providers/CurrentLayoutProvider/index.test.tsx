/** @vitest-environment jsdom */
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type {
  CurrentLayoutActions,
  LayoutState,
} from '@catrobotics/studio-base/context/CurrentLayoutContext'
import {
  useCurrentLayoutActions,
  useCurrentLayoutSelector,
} from '@catrobotics/studio-base/context/CurrentLayoutContext'
import CurrentLayoutProvider, {
  MAX_SUPPORTED_LAYOUT_VERSION,
} from '@catrobotics/studio-base/providers/CurrentLayoutProvider'
import { act, render, renderHook } from '@testing-library/react'

import { SnackbarProvider } from 'notistack'
import { useEffect } from 'react'

describe('currentLayoutProvider', () => {
  it('refuses to load an incompatible layout', async () => {
    const all = new Array<LayoutState>()

    function SetUnsupportedLayout() {
      const layoutState = useCurrentLayoutSelector(state => state)
      const actions = useCurrentLayoutActions()

      useEffect(() => {
        all.push(layoutState)
      }, [layoutState])

      useEffect(() => {
        actions.setCurrentLayout({
          data: {
            configById: { 'Foo!bar': { setting: 1 } },
            globalVariables: { var: 'hello' },
            layout: 'Foo!bar',
            playbackConfig: { speed: 0.1 },
            userNodes: { node1: { name: 'node', sourceCode: 'node()' } },
            version: MAX_SUPPORTED_LAYOUT_VERSION + 2,
          },
        })
      }, [actions])

      return <></>
    }

    const { getByText } = render(<SetUnsupportedLayout />, {
      wrapper: (props) => {
        return (
          <SnackbarProvider>
            <CurrentLayoutProvider>{props.children}</CurrentLayoutProvider>
          </SnackbarProvider>
        )
      },
    })

    expect(getByText('Incompatible layout version')).toBeDefined()

    expect(all.length).toBe(1)
    expect(all).toEqual([{ selectedLayout: undefined }])

    vi.mocked(console.warn).mockClear()
  })

  it('keeps identity of action functions when modifying layout', async () => {
    const all: Array<CurrentLayoutActions> = []
    const { result } = renderHook(
      () => {
        const actions = useCurrentLayoutActions()
        all.push(actions)
        return actions
      },
      {
        wrapper: function Wrapper({ children }) {
          return (
            <SnackbarProvider>
              <CurrentLayoutProvider>{children}</CurrentLayoutProvider>
            </SnackbarProvider>
          )
        },
      },
    )

    const actions = result.current
    expect(result.current).toBe(actions)
    act(() => {
      result.current.savePanelConfigs({
        configs: [{ id: 'ExamplePanel!1', config: { foo: 'bar' } }],
      })
    })
    expect(result.current.savePanelConfigs).toBe(actions.savePanelConfigs)
    vi.mocked(console.warn).mockClear()
  })
})
