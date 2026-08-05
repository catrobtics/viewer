// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type {
  ISharedRootContext,
} from '@catrobotics/studio-base/context/SharedRootContext'
import GlobalCss from '@catrobotics/studio-base/components/GlobalCss'
import { BrandingProvider } from '@catrobotics/studio-base/context/BrandingContext'
import {
  SharedRootContext,
} from '@catrobotics/studio-base/context/SharedRootContext'

import { ColorSchemeThemeProvider } from './components/ColorSchemeThemeProvider'
import CssBaseline from './components/CssBaseline'
import ErrorBoundary from './components/ErrorBoundary'
import AppConfigurationContext from './context/AppConfigurationContext'

export function SharedRoot(
  props: ISharedRootContext & { children: React.JSX.Element },
): React.JSX.Element {
  const {
    appBarLeftInset,
    appConfiguration,
    onAppBarDoubleClick,
    AppBarComponent,
    branding,
    children,
    customWindowControlProps,
    dataSources,
    deepLinks,
    enableGlobalCss = false,
    enableLaunchPreferenceScreen,
    extraProviders,
  } = props

  return (
    <AppConfigurationContext.Provider value={appConfiguration}>
      <BrandingProvider branding={branding}>
        <ColorSchemeThemeProvider>
          {enableGlobalCss && <GlobalCss />}
          <CssBaseline>
            <ErrorBoundary>
              <SharedRootContext.Provider
                value={{
                  appBarLeftInset,
                  AppBarComponent,
                  branding,
                  appConfiguration,
                  customWindowControlProps,
                  dataSources,
                  deepLinks,
                  enableLaunchPreferenceScreen,
                  extraProviders,
                  onAppBarDoubleClick,
                }}
              >
                {children}
              </SharedRootContext.Provider>
            </ErrorBoundary>
          </CssBaseline>
        </ColorSchemeThemeProvider>
      </BrandingProvider>
    </AppConfigurationContext.Provider>
  )
}
