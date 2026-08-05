// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { LayoutData } from '@catrobotics/studio-base/context/CurrentLayoutContext/actions'

import type { PanelConfig } from '@catrobotics/studio-base/types/panels'
import type { MosaicNode } from 'react-mosaic-component'
import { isTabPanel, isTabPanelConfig } from '@catrobotics/studio-base/util/layout'

function replacePanelInLayout(
  layout: MosaicNode<string>,
  oldId: string,
  newId: string,
): MosaicNode<string> {
  if (typeof layout === 'string') {
    return layout === oldId ? newId : layout
  }
  else {
    return {
      ...layout,
      first: replacePanelInLayout(layout.first, oldId, newId),
      second: replacePanelInLayout(layout.second, oldId, newId),
    }
  }
}

export function replacePanel(
  panelsState: LayoutData,
  oldId: string,
  newId: string,
  newConfig: PanelConfig,
): LayoutData {
  const newPanelsState = {
    ...panelsState,
    configById: { ...panelsState.configById, [newId]: newConfig },
  }
  delete newPanelsState.configById[oldId]
  if (newPanelsState.layout != undefined) {
    newPanelsState.layout = replacePanelInLayout(newPanelsState.layout, oldId, newId)
    const tabPanelIds = Object.keys(newPanelsState.configById).filter(isTabPanel)
    for (const tabId of tabPanelIds) {
      const tabConfig = newPanelsState.configById[tabId]
      if (isTabPanelConfig(tabConfig)) {
        newPanelsState.configById[tabId] = {
          ...tabConfig,
          tabs: tabConfig.tabs.map(tab => ({
            ...tab,
            layout:
              tab.layout != undefined ? replacePanelInLayout(tab.layout, oldId, newId) : undefined,
          })),
        }
      }
    }
  }
  return newPanelsState
}
