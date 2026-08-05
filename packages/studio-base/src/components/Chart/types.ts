// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { ChartData as ChartJsChartData, ScatterDataPoint } from 'chart.js'

// Chartjs typings use _null_ to indicate _gaps_ in the dataset

type Datum = Omit<ScatterDataPoint, 'x' | 'y'> & {
  x: number
  y: number
  // chart.js supported properties to show a label above the datapoint
  // used by the state transition panel to show a label above the transition datum
  label?: string
  labelColor?: string

  // Our additional properties
  // value is the original value (rather than the plot x/y value) for the datum (used by state transitions)
  value?: string | number | bigint | boolean
  // Constant name for the datum (used by state transitions)
  constantName?: string | undefined

  // Contains all of the distinct states present in this line segment. Only for
  // state transition data.
  states?: string[]
}
export type ObjectData = (Datum | null)[]
export type ChartData = ChartJsChartData<'scatter', ObjectData>

export interface TypedData {
  x: Float32Array
  y: Float32Array
  value: (string | number | bigint | boolean | undefined)[]
  constantName?: string[]
}
export type TypedChartData = ChartJsChartData<'scatter', TypedData[]>

export interface RpcScale {
  // min scale value
  min: number
  // max scale value
  max: number
  // pixel coordinate within the component that corresponds to min
  pixelMin: number
  // pixel coordinate within the component that corresponds to max
  pixelMax: number
}

export interface RpcScales {
  x?: RpcScale
  y?: RpcScale
}

export interface RpcElement {
  data?: Datum
  datasetIndex: number
  index: number
  view: {
    x: number
    y: number
  }
}
