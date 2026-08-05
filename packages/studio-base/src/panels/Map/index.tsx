// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { SaveConfig } from '@catrobotics/studio-base/types/panels'

import { useCrash } from '@catrobotics/hooks'
import Panel from '@catrobotics/studio-base/components/Panel'
import { PanelExtensionAdapter } from '@catrobotics/studio-base/components/PanelExtensionAdapter'
import { useMemo } from 'react'

import { initPanel } from './initPanel'

interface Props {
  config: unknown
  saveConfig: SaveConfig<unknown>
}

function MapPanelAdapter(props: Props) {
  const crash = useCrash()
  const boundInitPanel = useMemo(() => initPanel.bind(undefined, crash), [crash])

  return (
    <PanelExtensionAdapter
      config={props.config}
      saveConfig={props.saveConfig}
      initPanel={boundInitPanel}
      highestSupportedConfigVersion={1}
    />
  )
}

MapPanelAdapter.panelType = 'map'
MapPanelAdapter.defaultConfig = {}

export default Panel(MapPanelAdapter)
