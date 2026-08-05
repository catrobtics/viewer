// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

/// <reference types="vite/client" />

import type {
  AppBarProps,
  BrandingConfig,
  IDataSourceFactory,
} from '@catrobotics/studio-base'
import {
  AppSetting,
  FoxgloveWebSocketDataSourceFactory,
  McapLocalDataSourceFactory,
  RemoteDataSourceFactory,
  Ros1LocalBagDataSourceFactory,
  Ros2LocalBagDataSourceFactory,
  RosbridgeDataSourceFactory,
  SampleNuscenesDataSourceFactory,
  SharedRoot,
  UlogLocalDataSourceFactory,
} from '@catrobotics/studio-base'

import { useMemo } from 'react'

import LocalStorageAppConfiguration from './services/LocalStorageAppConfiguration'

const isDevelopment = import.meta.env.DEV

export function WebRoot(props: {
  extraProviders: React.JSX.Element[] | undefined
  dataSources: IDataSourceFactory[] | undefined
  AppBarComponent?: (props: AppBarProps) => React.JSX.Element
  branding?: BrandingConfig
  children: React.JSX.Element
}): React.JSX.Element {
  const appConfiguration = useMemo(
    () =>
      new LocalStorageAppConfiguration({
        defaults: {
          [AppSetting.SHOW_DEBUG_PANELS]: isDevelopment,
        },
      }),
    [],
  )

  const dataSources = useMemo(() => {
    const sources = [
      new Ros1LocalBagDataSourceFactory(),
      new Ros2LocalBagDataSourceFactory(),
      new FoxgloveWebSocketDataSourceFactory(),
      new RosbridgeDataSourceFactory(),
      new UlogLocalDataSourceFactory(),
      new SampleNuscenesDataSourceFactory(),
      new McapLocalDataSourceFactory(),
      new RemoteDataSourceFactory(),
    ]

    return props.dataSources ?? sources
  }, [props.dataSources])

  return (
    <SharedRoot
      enableLaunchPreferenceScreen
      deepLinks={[window.location.href]}
      dataSources={dataSources}
      appConfiguration={appConfiguration}
      enableGlobalCss
      extraProviders={props.extraProviders}
      AppBarComponent={props.AppBarComponent}
      branding={props.branding}
    >
      {props.children}
    </SharedRoot>
  )
}
