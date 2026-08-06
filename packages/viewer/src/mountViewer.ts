// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import type { MountedViewer, MountViewerOptions, ViewerProps } from '../types-src/types.js'
import { createElement, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { Viewer } from './Viewer.js'

export function mountViewer(
  target: Element | DocumentFragment,
  props: ViewerProps = {},
  options: MountViewerOptions = {},
): MountedViewer {
  const root = createRoot(target)
  const strictMode = options.strictMode ?? true

  const render = (nextProps: ViewerProps): void => {
    const viewer = createElement(Viewer, nextProps)
    root.render(strictMode ? createElement(StrictMode, undefined, viewer) : viewer)
  }

  render(props)

  return {
    render,
    unmount() {
      root.unmount()
    },
  }
}
