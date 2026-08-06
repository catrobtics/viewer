// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import type { BrandingConfig, IAppContext } from '@catrobotics/studio-base'
import type { ViewerProps } from '../types-src/types.js'
import {
  AppContext,
  initI18n,
  installDevtoolsFormatters as installFormatters,
  overwriteFetch,
  StudioApp,
  waitForFonts,
} from '@catrobotics/studio-base'
import CssBaseline from '@catrobotics/studio-base/components/CssBaseline'
import { CurrentLayoutLocalStorageSyncAdapter } from '@catrobotics/studio-base/components/CurrentLayoutLocalStorageSyncAdapter'
import { URLStateSyncAdapter } from '@catrobotics/studio-base/components/URLStateSyncAdapter'
import { CompatibilityBanner, WebRoot } from '@catrobotics/studio-web'
import { useEffect, useMemo, useRef, useState } from 'react'

interface BrowserCompatibility {
  canRender: boolean
  chromeVersion: number
  isBrowser: boolean
  isChrome: boolean
}

type InitializationState
  = | { status: 'loading' }
    | { status: 'ready' }
    | { status: 'error', error: Error }

let initializationPromise: Promise<void> | undefined
let didInstallFormatters = false
let didPatchFetch = false

function getBrowserCompatibility(): BrowserCompatibility {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { canRender: false, chromeVersion: 0, isBrowser: false, isChrome: false }
  }

  const chromeMatch = navigator.userAgent.match(/Chrome\/(\d+)\./)
  const chromeVersion = chromeMatch ? Number.parseInt(chromeMatch[1] ?? '', 10) : 0
  const canvasConstructor = globalThis.HTMLCanvasElement
  const supportsOffscreenCanvas = canvasConstructor != undefined
    && typeof canvasConstructor.prototype.transferControlToOffscreen === 'function'

  return {
    canRender: (
      typeof BigInt64Array === 'function'
      && typeof BigUint64Array === 'function'
      && supportsOffscreenCanvas
    ),
    chromeVersion,
    isBrowser: true,
    isChrome: chromeVersion !== 0,
  }
}

function initializeViewer(): Promise<void> {
  initializationPromise ??= (async () => {
    await initI18n()
    if (document.fonts != undefined) {
      await waitForFonts()
    }
  })()
  return initializationPromise
}

function renderErrorFallback(props: ViewerProps, error: Error): React.ReactNode {
  if (typeof props.errorFallback === 'function') {
    return props.errorFallback(error)
  }
  if (props.errorFallback != undefined) {
    return props.errorFallback
  }
  return (
    <div role="alert">
      Unable to initialize CatRobotics Viewer:
      {error.message}
    </div>
  )
}

export function Viewer(props: ViewerProps): React.JSX.Element {
  const {
    enableGlobalCss = false,
    enableLaunchPreferenceScreen = false,
    installDevtoolsFormatters = false,
    manageContextMenu = false,
    manageDocumentTitle = false,
    patchFetchErrors = false,
    persistLayout = true,
    showCompatibilityBanner = true,
    syncUrl = false,
  } = props
  const compatibility = getBrowserCompatibility()
  const [initialization, setInitialization] = useState<InitializationState>({ status: 'loading' })
  const didNotifyReady = useRef(false)
  const onReady = useRef(props.onReady)
  onReady.current = props.onReady

  const syncAdapters = useMemo(() => {
    const adapters: React.JSX.Element[] = []
    if (syncUrl) {
      adapters.push(<URLStateSyncAdapter key="url-state" />)
    }
    if (persistLayout) {
      adapters.push(<CurrentLayoutLocalStorageSyncAdapter key="layout-storage" />)
    }
    return adapters
  }, [persistLayout, syncUrl])

  const appContext = useMemo<IAppContext>(() => ({
    syncAdapters,
    wrapPlayer: player => player,
  }), [syncAdapters])

  useEffect(() => {
    if (!compatibility.isBrowser || (showCompatibilityBanner && !compatibility.canRender)) {
      return
    }

    if (installDevtoolsFormatters && !didInstallFormatters) {
      installFormatters()
      didInstallFormatters = true
    }
    if (patchFetchErrors && !didPatchFetch) {
      overwriteFetch()
      didPatchFetch = true
    }

    let active = true
    void initializeViewer().then(
      () => {
        if (active) {
          setInitialization({ status: 'ready' })
        }
      },
      (reason: unknown) => {
        if (active) {
          const error = reason instanceof Error ? reason : new Error(String(reason))
          setInitialization({ status: 'error', error })
        }
      },
    )
    return () => {
      active = false
    }
  }, [
    compatibility.canRender,
    compatibility.isBrowser,
    installDevtoolsFormatters,
    patchFetchErrors,
    showCompatibilityBanner,
  ])

  useEffect(() => {
    if (initialization.status === 'ready' && !didNotifyReady.current) {
      didNotifyReady.current = true
      onReady.current?.()
    }
  }, [initialization.status])

  const containerStyle = {
    width: '100%',
    height: '100%',
    minHeight: 0,
    ...props.style,
  }

  if (!compatibility.isBrowser) {
    return <div className={props.className} style={containerStyle}>{props.loadingFallback}</div>
  }

  if (showCompatibilityBanner && !compatibility.canRender) {
    return (
      <div className={props.className} style={containerStyle}>
        <CssBaseline>
          <CompatibilityBanner
            isChrome={compatibility.isChrome}
            currentVersion={compatibility.chromeVersion}
            isDismissable={false}
          />
        </CssBaseline>
      </div>
    )
  }

  if (initialization.status === 'error') {
    return (
      <div className={props.className} style={containerStyle}>
        {renderErrorFallback(props, initialization.error)}
      </div>
    )
  }

  if (initialization.status === 'loading') {
    return <div className={props.className} style={containerStyle}>{props.loadingFallback}</div>
  }

  const compatibilityBanner = showCompatibilityBanner
    ? (
        <CompatibilityBanner
          isChrome={compatibility.isChrome}
          currentVersion={compatibility.chromeVersion}
          isDismissable
        />
      )
    : undefined

  return (
    <div className={props.className} style={containerStyle}>
      <AppContext.Provider value={appContext}>
        {compatibilityBanner}
        <WebRoot
          extraProviders={props.extraProviders == undefined ? undefined : [...props.extraProviders]}
          dataSources={undefined}
          branding={props.branding as BrandingConfig | undefined}
          deepLinks={props.deepLinks == undefined ? [] : [...props.deepLinks]}
          enableGlobalCss={enableGlobalCss}
          enableLaunchPreferenceScreen={enableLaunchPreferenceScreen}
        >
          <StudioApp
            manageContextMenu={manageContextMenu}
            manageDocumentTitle={manageDocumentTitle}
          />
        </WebRoot>
      </AppContext.Provider>
    </div>
  )
}
