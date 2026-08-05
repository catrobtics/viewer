// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { Immutable } from '@catrobotics/studio'
import type { Bounds } from '@catrobotics/studio-base/types/Bounds'

import type { Theme } from '@mui/material'
import type { ChartRenderer, Dataset, HoverElement, Scale, UpdateAction } from './ChartRenderer'
import type { Service } from './ChartRenderer.worker'

import { ComlinkWrap } from '@catrobotics/den/worker'
import * as Comlink from 'comlink'

// If the datasets builder is garbage collected we also need to cleanup the worker
// This registry ensures the worker is cleaned up when the builder is garbage collected
const registry = new FinalizationRegistry<() => void>((dispose) => {
  dispose()
})

export class OffscreenCanvasRenderer {
  #canvas: OffscreenCanvas
  #remote: Promise<Comlink.RemoteObject<ChartRenderer>>

  #theme: Theme

  public constructor(canvas: OffscreenCanvas, theme: Theme) {
    this.#theme = theme
    this.#canvas = canvas
    const worker = new Worker(
      new URL('./ChartRenderer.worker.ts', import.meta.url),
      { type: 'module' },
    )

    const { remote, dispose } = ComlinkWrap<Service<Comlink.RemoteObject<ChartRenderer>>>(worker)

    // Set the promise without await so init creates only one instance of renderer even if called
    // twice.
    this.#remote = remote.init(
      Comlink.transfer(
        {
          canvas: this.#canvas,
          devicePixelRatio: window.devicePixelRatio,
          gridColor: this.#theme.palette.divider,
          tickColor: this.#theme.palette.text.secondary,
        },
        [this.#canvas],
      ),
    )

    registry.register(this, dispose)
  }

  public async update(action: Immutable<UpdateAction>): Promise<Bounds | undefined> {
    return await (await this.#remote).update(action)
  }

  public async getElementsAtPixel(pixel: { x: number, y: number }): Promise<HoverElement[]> {
    return await (await this.#remote).getElementsAtPixel(pixel)
  }

  public async updateDatasets(datasets: Dataset[]): Promise<Scale | undefined> {
    return await (await this.#remote).updateDatasets(datasets)
  }
}
