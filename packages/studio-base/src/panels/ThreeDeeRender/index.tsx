// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type {
  ForwardedAnalytics,
} from '@catrobotics/studio-base/components/ForwardAnalyticsContextProvider'
import type {
  BuiltinPanelExtensionContext,
} from '@catrobotics/studio-base/components/PanelExtensionAdapter'
import type { TestOptions } from '@catrobotics/studio-base/panels/ThreeDeeRender/IRenderer'

import type { SaveConfig } from '@catrobotics/studio-base/types/panels'
import type { DeepPartial } from 'ts-essentials'
import type { SceneExtensionConfig } from './SceneExtensionConfig'
import type { InterfaceMode } from './types'
import { useCrash } from '@catrobotics/hooks'
import { CaptureErrorBoundary } from '@catrobotics/studio-base/components/CaptureErrorBoundary'
import {
  ForwardAnalyticsContextProvider,
  useForwardAnalytics,
} from '@catrobotics/studio-base/components/ForwardAnalyticsContextProvider'
import Panel from '@catrobotics/studio-base/components/Panel'
import {
  PanelExtensionAdapter,
} from '@catrobotics/studio-base/components/PanelExtensionAdapter'
import { INJECTED_FEATURE_KEYS, useAppContext } from '@catrobotics/studio-base/context/AppContext'
import { deferRootUnmount } from '@catrobotics/studio-base/util/deferRootUnmount'

import { StrictMode, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { ThreeDeeRender } from './ThreeDeeRender'

interface InitPanelArgs {
  crash: ReturnType<typeof useCrash>
  forwardedAnalytics: ForwardedAnalytics
  interfaceMode: InterfaceMode
  testOptions: TestOptions
  customSceneExtensions?: DeepPartial<SceneExtensionConfig>
}

function initPanel(args: InitPanelArgs, context: BuiltinPanelExtensionContext) {
  const { crash, forwardedAnalytics, interfaceMode, testOptions, customSceneExtensions } = args
  const root = createRoot(context.panelElement)
  root.render(
    <StrictMode>
      <CaptureErrorBoundary onError={crash}>
        <ForwardAnalyticsContextProvider forwardedAnalytics={forwardedAnalytics}>
          <ThreeDeeRender
            context={context}
            interfaceMode={interfaceMode}
            testOptions={testOptions}
            customSceneExtensions={customSceneExtensions}
          />
        </ForwardAnalyticsContextProvider>
      </CaptureErrorBoundary>
    </StrictMode>,
  )
  return () => {
    deferRootUnmount(root)
  }
}

interface Props {
  config: Record<string, unknown>
  saveConfig: SaveConfig<Record<string, unknown>>
  onDownloadImage?: (blob: Blob, fileName: string) => void
  debugPicking?: boolean
}

function ThreeDeeRenderAdapter(interfaceMode: InterfaceMode, props: Props) {
  const crash = useCrash()

  const forwardedAnalytics = useForwardAnalytics()
  const { injectedFeatures } = useAppContext()
  const customSceneExtensions = useMemo(() => {
    if (injectedFeatures == undefined) {
      return undefined
    }
    const injectedSceneExtensions
      = injectedFeatures.availableFeatures[INJECTED_FEATURE_KEYS.customSceneExtensions]
        ?.customSceneExtensions
    return injectedSceneExtensions
  }, [injectedFeatures])

  const boundInitPanel = useMemo(
    () =>
      initPanel.bind(undefined, {
        crash,
        forwardedAnalytics,
        interfaceMode,
        testOptions: { onDownloadImage: props.onDownloadImage, debugPicking: props.debugPicking },
        customSceneExtensions,
      }),
    [
      crash,
      forwardedAnalytics,
      interfaceMode,
      props.onDownloadImage,
      props.debugPicking,
      customSceneExtensions,
    ],
  )

  return (
    <PanelExtensionAdapter
      config={props.config}
      highestSupportedConfigVersion={1}
      saveConfig={props.saveConfig}
      initPanel={boundInitPanel}
    />
  )
}

/**
 * The Image panel is a special case of the 3D panel with `interfaceMode` set to `"image"`.
 */
export const ImagePanel = Panel<Record<string, unknown>, Props>(
  Object.assign(ThreeDeeRenderAdapter.bind(undefined, 'image'), {
    panelType: 'Image',
    defaultConfig: {},
  }),
)

export default Panel(
  Object.assign(ThreeDeeRenderAdapter.bind(undefined, '3d'), {
    panelType: '3D',
    defaultConfig: {},
  }),
)
