// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import type { CSSProperties, ReactElement, ReactNode } from 'react'

export interface ViewerThemeTokens {
  accent?: string
  appBarAccent?: string
  appBarBackground?: string
  appBarForeground?: string
  background?: string
  borderRadius?: number
  divider?: string
  fontFamily?: string
  surface?: string
  textPrimary?: string
  textSecondary?: string
}

export interface ViewerThemeConfig {
  dark?: ViewerThemeTokens
  light?: ViewerThemeTokens
}

export interface ViewerBranding {
  logoAlt?: string
  logo?: ReactNode
  productName?: string
  websiteUrl?: string
  wordmark?: ReactNode
  appBar?: {
    afterMenu?: ReactNode
    beforeActions?: ReactNode
    centerContent?: ReactNode
    logo?: ReactNode
    showMenuChevron?: boolean
    showProductName?: boolean
  }
  theme?: ViewerThemeConfig
}

export type ViewerErrorFallback = ReactNode | ((error: Error) => ReactNode)

export interface ViewerProps {
  /** Product name, logos, links, and theme tokens displayed by the Viewer. */
  branding?: ViewerBranding
  /** Class name applied to the outer Viewer container. */
  className?: string
  /** Initial deep links to inspect. Embedded viewers default to no host-page deep link. */
  deepLinks?: readonly string[]
  /** Enables the first-run web/desktop launch preference screen. Defaults to false. */
  enableLaunchPreferenceScreen?: boolean
  /** Injects styles for html, body, and #root. Defaults to false for safe embedding. */
  enableGlobalCss?: boolean
  /** Content rendered if initialization fails, or a function receiving the error. */
  errorFallback?: ViewerErrorFallback
  /** Extra React providers mounted inside the Viewer provider tree. */
  extraProviders?: readonly ReactElement[]
  /** Installs CatRobotics Chrome DevTools formatters. Defaults to false. */
  installDevtoolsFormatters?: boolean
  /** Content rendered while i18n and font initialization completes. */
  loadingFallback?: ReactNode
  /** Allows the Viewer to intercept the document context menu. Defaults to false. */
  manageContextMenu?: boolean
  /** Allows the Viewer to update document.title. Defaults to false. */
  manageDocumentTitle?: boolean
  /** Called after initialization and the full Viewer tree have rendered. */
  onReady?: () => void
  /** Improves generic fetch errors by wrapping globalThis.fetch. Defaults to false. */
  patchFetchErrors?: boolean
  /** Persists the active layout in localStorage. Defaults to true. */
  persistLayout?: boolean
  /** Shows the built-in browser compatibility warning. Defaults to true. */
  showCompatibilityBanner?: boolean
  /** Synchronizes data source and playback state to the host URL. Defaults to false. */
  syncUrl?: boolean
  /** Inline styles applied to the outer Viewer container. */
  style?: CSSProperties
}

export interface MountViewerOptions {
  /** Wraps the mounted component in React.StrictMode. Defaults to true. */
  strictMode?: boolean
}

export interface MountedViewer {
  /** Re-renders the mounted Viewer with a complete new props object. */
  render: (props: ViewerProps) => void
  /** Unmounts the React root and releases Viewer listeners. */
  unmount: () => void
}
