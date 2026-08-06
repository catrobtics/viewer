// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import type { ReactElement } from 'react'
import type {
  MountedViewer,
  MountViewerOptions,
  ViewerBranding,
  ViewerProps,
} from './types.js'

export declare function Viewer(props: ViewerProps): ReactElement
export default Viewer

export declare function mountViewer(
  target: Element | DocumentFragment,
  props?: ViewerProps,
  options?: MountViewerOptions,
): MountedViewer

export declare function defineBranding<const Config extends ViewerBranding>(config: Config): Config

export type {
  MountedViewer,
  MountViewerOptions,
  ViewerBranding,
  ViewerErrorFallback,
  ViewerProps,
  ViewerThemeConfig,
  ViewerThemeTokens,
} from './types.js'
