// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

export type {
  MountedViewer,
  MountViewerOptions,
  ViewerBranding,
  ViewerErrorFallback,
  ViewerProps,
  ViewerThemeConfig,
  ViewerThemeTokens,
} from '../types-src/types.js'
export { mountViewer } from './mountViewer.js'
export { Viewer } from './Viewer.js'
export { Viewer as default } from './Viewer.js'

export function defineBranding<const Config extends import('../types-src/types.js').ViewerBranding>(
  config: Config,
): Config {
  return config
}
