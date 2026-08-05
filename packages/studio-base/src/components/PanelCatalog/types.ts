// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { PanelConfig } from '@catrobotics/studio-base/types/panels'

export interface PanelSelection {
  type: string
  config?: PanelConfig
}
