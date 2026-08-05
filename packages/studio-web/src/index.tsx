// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { BrandingConfig, IDataSourceFactory } from '@catrobotics/studio-base'
import Logger from '@catrobotics/log'

import CssBaseline from '@catrobotics/studio-base/components/CssBaseline'
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'

import { canRenderApp } from './canRenderApp'
import { CompatibilityBanner } from './CompatibilityBanner'

const log = Logger.getLogger(import.meta.url)

export { defineBranding } from './defineBranding'

function LogAfterRender(props: React.PropsWithChildren): React.JSX.Element {
  useEffect(() => {
    // Integration tests look for this console log to indicate the app has rendered once
    // We use console.debug to bypass our logging library which hides some log levels in prod builds
    console.debug('App rendered')
  }, [])
  return <>{props.children}</>
}

export interface MainParams {
  branding?: BrandingConfig
  dataSources?: IDataSourceFactory[]
  extraProviders?: React.JSX.Element[]
  rootElement?: React.JSX.Element
}

export async function main(getParams: () => Promise<MainParams> = async () => ({})): Promise<void> {
  log.debug('initializing')

  window.onerror = (...args) => {
    console.error(...args)
  }

  const rootEl = document.getElementById('root')
  if (!rootEl) {
    throw new Error('missing #root element')
  }
  const root = createRoot(rootEl)

  const chromeMatch = navigator.userAgent.match(/Chrome\/(\d+)\./)
  const chromeVersion = chromeMatch ? parseInt(chromeMatch[1] ?? '', 10) : 0
  const isChrome = chromeVersion !== 0

  const canRender = canRenderApp()
  const banner = (
    <CompatibilityBanner
      isChrome={isChrome}
      currentVersion={chromeVersion}
      isDismissable={canRender}
    />
  )

  if (!canRender) {
    root.render(
      <StrictMode>
        <LogAfterRender>
          <CssBaseline>{banner}</CssBaseline>
        </LogAfterRender>
      </StrictMode>,
    )
    return
  }

  // Use an async import to delay loading the majority of studio-base code until the CompatibilityBanner
  // can be displayed.
  const {
    defaultBranding,
    installDevtoolsFormatters,
    overwriteFetch,
    waitForFonts,
    initI18n,
    StudioApp,
  }
    = await import('@catrobotics/studio-base')
  installDevtoolsFormatters()
  overwriteFetch()
  // consider moving waitForFonts into App to display an app loading screen
  await waitForFonts()
  await initI18n()

  const { WebRoot } = await import('./WebRoot')
  const params = await getParams()
  document.title = params.branding?.productName ?? defaultBranding.productName
  const rootElement = params.rootElement ?? (
    <WebRoot
      extraProviders={params.extraProviders}
      dataSources={params.dataSources}
      branding={params.branding}
    >
      <StudioApp />
    </WebRoot>
  )

  root.render(
    <StrictMode>
      <LogAfterRender>
        {banner}
        {rootElement}
      </LogAfterRender>
    </StrictMode>,
  )
}
