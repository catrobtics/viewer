// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

// Bring in global modules and overrides required by studio source files
// This adds type declarations for bag, etc imports
// This adds type declarations for global react
// See typings/index.d.ts for additional included references
/// <reference types="./typings" />

export { AppSetting } from './AppSetting'
export type { AppBarProps } from './components/AppBar'
export { BrandMark } from './components/BrandMark'
export type {
  AppConfigurationValue,
  ChangeHandler,
  IAppConfiguration,
} from './context/AppConfigurationContext'
export { AppContext } from './context/AppContext'
export type { IAppContext } from './context/AppContext'
export type { BrandingConfig } from './context/BrandingContext'
export {
  BrandingProvider,
  CATROBOTICS_PINK,
  defaultBranding,
  useBranding,
} from './context/BrandingContext'
export type { IDataSourceFactory } from './context/PlayerSelectionContext'
export { default as FoxgloveWebSocketDataSourceFactory } from './dataSources/FoxgloveWebSocketDataSourceFactory'
export { default as McapLocalDataSourceFactory } from './dataSources/McapLocalDataSourceFactory'
export { default as RemoteDataSourceFactory } from './dataSources/RemoteDataSourceFactory'
export { default as Ros1LocalBagDataSourceFactory } from './dataSources/Ros1LocalBagDataSourceFactory'
export { default as Ros2LocalBagDataSourceFactory } from './dataSources/Ros2LocalBagDataSourceFactory'
export { default as RosbridgeDataSourceFactory } from './dataSources/RosbridgeDataSourceFactory'
export { default as SampleNuscenesDataSourceFactory } from './dataSources/SampleNuscenesDataSourceFactory'
export { default as UlogLocalDataSourceFactory } from './dataSources/UlogLocalDataSourceFactory'
export { initI18n } from './i18n'
export type { NetworkInterface, OsContext } from './OsContext'
export { makeWorkspaceContextInitialState } from './providers/WorkspaceContextProvider'
export { reportError, setReportErrorHandler } from './reportError'
export type { ExtensionLoader } from './services/ExtensionLoader'
export { migratePanelsState } from './services/migrateLayout'
export { SharedRoot } from './SharedRoot'
export { StudioApp } from './StudioApp'
export type { StudioAppProps } from './StudioApp'
export type { ExtensionInfo, ExtensionNamespace } from './types/Extensions'
export { default as installDevtoolsFormatters } from './util/installDevtoolsFormatters'
export { default as overwriteFetch } from './util/overwriteFetch'
export { default as waitForFonts } from './util/waitForFonts'
export { LaunchPreferenceValue } from '@catrobotics/studio-base/types/LaunchPreferenceValue'
