// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { SaveConfig } from '@catrobotics/studio-base/types/panels'
import EmptyState from '@catrobotics/studio-base/components/EmptyState'
import withPanel from '@catrobotics/studio-base/components/Panel'
import PanelToolbar from '@catrobotics/studio-base/components/PanelToolbar'
import Stack from '@catrobotics/studio-base/components/Stack'

// Since the unknown panel never saves its config, the config fields here are used with `overrideConfig`
// to the connected Panel component (returned from withPanel).
//
// The _type_ config option should be the type of the missing panel.
interface Props {
  config: { type: string, id: string }
  saveConfig: SaveConfig<unknown>
}

function UnconnectedUnknownPanel(props: Props) {
  const { config, saveConfig: _saveConfig } = props

  return (
    <Stack flex="auto" alignItems="center" justifyContent="center" data-testid={config.id}>
      <PanelToolbar isUnknownPanel />
      <EmptyState>
        Unknown panel type:
        {config.type}
        .
      </EmptyState>
    </Stack>
  )
}
UnconnectedUnknownPanel.panelType = 'unknown'
UnconnectedUnknownPanel.defaultConfig = {}

/**
 * An UnknownPanel stands in for missing panels. When a panel referenced in a layout is not
 * available (maybe the extension was un-installed), this panel is shown instead.
 */
export const UnknownPanel = withPanel(UnconnectedUnknownPanel)
