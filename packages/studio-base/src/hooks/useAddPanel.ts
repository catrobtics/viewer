import type { PanelSelection } from '@catrobotics/studio-base/components/PanelCatalog'

import { useCurrentLayoutActions } from '@catrobotics/studio-base/context/CurrentLayoutContext'
import { getPanelIdForType } from '@catrobotics/studio-base/util/layout'
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/
import { useCallback } from 'react'

export default function useAddPanel(): (selection: PanelSelection) => void {
  const { addPanel } = useCurrentLayoutActions()
  return useCallback(
    ({ type, config }: PanelSelection) => {
      const id = getPanelIdForType(type)
      addPanel({ id, config })
    },
    [addPanel],
  )
}
