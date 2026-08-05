// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { PanelExtensionContext } from '@catrobotics/studio'
import type { SaveConfig } from '@catrobotics/studio-base/types/panels'

import { useCrash } from '@catrobotics/hooks'
import { CaptureErrorBoundary } from '@catrobotics/studio-base/components/CaptureErrorBoundary'
import Panel from '@catrobotics/studio-base/components/Panel'
import { PanelExtensionAdapter } from '@catrobotics/studio-base/components/PanelExtensionAdapter'
import { deferRootUnmount } from '@catrobotics/studio-base/util/deferRootUnmount'
import { StrictMode, useMemo } from 'react'
import { createRoot } from 'react-dom/client'

import TeleopPanel from './TeleopPanel'

function initPanel(crash: ReturnType<typeof useCrash>, context: PanelExtensionContext) {
  const root = createRoot(context.panelElement)
  root.render(
    <StrictMode>
      <CaptureErrorBoundary onError={crash}>
        <TeleopPanel context={context} />
      </CaptureErrorBoundary>
    </StrictMode>,
  )
  return () => {
    deferRootUnmount(root)
  }
}

interface Props {
  config: unknown
  saveConfig: SaveConfig<unknown>
}

function TeleopPanelAdapter(props: Props) {
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

TeleopPanelAdapter.panelType = 'Teleop'
TeleopPanelAdapter.defaultConfig = {}

export default Panel(TeleopPanelAdapter)
