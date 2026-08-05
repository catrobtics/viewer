// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

export type Operator = '=' | '<' | '<=' | '>' | '>='
export interface Rule {
  rawValue: string
  operator: Operator
  color: string
  label: string
}

export interface Config {
  path: string
  style: 'bulb' | 'background'
  rules: Rule[]
  fallbackColor: string
  fallbackLabel: string
}
