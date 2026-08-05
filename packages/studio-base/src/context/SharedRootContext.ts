// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { AppBarProps } from '@catrobotics/studio-base/components/AppBar'
import type { CustomWindowControlsProps } from '@catrobotics/studio-base/components/AppBar/CustomWindowControls'

import type { IAppConfiguration } from '@catrobotics/studio-base/context/AppConfigurationContext'
import type { BrandingConfig } from '@catrobotics/studio-base/context/BrandingContext'
import type { IDataSourceFactory } from '@catrobotics/studio-base/context/PlayerSelectionContext'
import { createContext, useContext } from 'react'

interface ISharedRootContext {
  deepLinks: readonly string[]
  appConfiguration?: IAppConfiguration
  dataSources: readonly IDataSourceFactory[]
  enableLaunchPreferenceScreen?: boolean
  enableGlobalCss?: boolean
  appBarLeftInset?: number
  extraProviders?: readonly React.JSX.Element[]
  customWindowControlProps?: CustomWindowControlsProps
  onAppBarDoubleClick?: () => void
  AppBarComponent?: (props: AppBarProps) => React.JSX.Element
  branding?: BrandingConfig
}

const SharedRootContext = createContext<ISharedRootContext>({
  deepLinks: [],
  dataSources: [],
})
SharedRootContext.displayName = 'SharedRootContext'

export function useSharedRootContext(): ISharedRootContext {
  return useContext(SharedRootContext)
}

export { SharedRootContext }
export type { ISharedRootContext }
