// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { TimestampMethod } from '@catrobotics/studio-base/util/time'

export interface StateTransitionPath {
  color?: string
  value: string
  label?: string
  enabled?: boolean
  timestampMethod: TimestampMethod
}

export interface StateTransitionConfig {
  isSynced: boolean
  paths: StateTransitionPath[]
  xAxisMaxValue?: number
  xAxisMinValue?: number
  xAxisRange?: number
  showPoints?: boolean
}
