// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/
//
// This file incorporates work covered by the following copyright and
// permission notice:
//
//   Copyright 2018-2021 Cruise LLC
//
//   This source code is licensed under the Apache License, Version 2.0,
//   found at http://www.apache.org/licenses/LICENSE-2.0
//   You may not use this file except in compliance with the License.

import type {
  MessageEvent,
  ParameterValue,
  RegisterMessageConverterArgs,
  SettingsTree,
} from '@catrobotics/studio'
import type { PanelsActions } from '@catrobotics/studio-base/context/CurrentLayoutContext/actions'
import type {
  ExtensionCatalog,
} from '@catrobotics/studio-base/context/ExtensionCatalogContext'
import type {
  PanelCatalog,
} from '@catrobotics/studio-base/context/PanelCatalogContext'
import type {
  PanelStateStore,
} from '@catrobotics/studio-base/context/PanelStateContext'
import type { GlobalVariables } from '@catrobotics/studio-base/hooks/useGlobalVariables'
import type {
  AdvertiseOptions,
  PlayerStateActiveData,
  Progress,
  PublishPayload,
  Topic,
} from '@catrobotics/studio-base/players/types'
import type { SavedProps, UserScripts } from '@catrobotics/studio-base/types/panels'
import type { RosDatatypes } from '@catrobotics/studio-base/types/RosDatatypes'
import type { TFunction } from 'i18next'
import type {
  ComponentProps,
  PropsWithChildren,
  ReactNode,
} from 'react'
import type { MosaicNode } from 'react-mosaic-component'

import MockMessagePipelineProvider from '@catrobotics/studio-base/components/MessagePipeline/MockMessagePipelineProvider'
import SettingsTreeEditor from '@catrobotics/studio-base/components/SettingsTreeEditor'
import AppConfigurationContext from '@catrobotics/studio-base/context/AppConfigurationContext'
import { useCurrentLayoutActions } from '@catrobotics/studio-base/context/CurrentLayoutContext'
import {
  ExtensionCatalogContext,
} from '@catrobotics/studio-base/context/ExtensionCatalogContext'
import PanelCatalogContext from '@catrobotics/studio-base/context/PanelCatalogContext'
import {
  usePanelStateStore,
} from '@catrobotics/studio-base/context/PanelStateContext'
import * as panels from '@catrobotics/studio-base/panels'
import MockCurrentLayoutProvider from '@catrobotics/studio-base/providers/CurrentLayoutProvider/MockCurrentLayoutProvider'
import { PanelStateContextProvider } from '@catrobotics/studio-base/providers/PanelStateContextProvider'
import TimelineInteractionStateProvider from '@catrobotics/studio-base/providers/TimelineInteractionStateProvider'
import WorkspaceContextProvider from '@catrobotics/studio-base/providers/WorkspaceContextProvider'
import ThemeProvider from '@catrobotics/studio-base/theme/ThemeProvider'
import { useTheme } from '@mui/material'
import * as _ from 'lodash-es'
import {
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useTranslation } from 'react-i18next'
import { Mosaic, MosaicWindow } from 'react-mosaic-component'
import { createStore } from 'zustand'

import 'react-mosaic-component/react-mosaic-component.css'

function noop() {}

interface Frame {
  [topic: string]: MessageEvent[]
}

export interface Fixture {
  frame?: Frame
  topics?: Topic[]
  capabilities?: string[]
  profile?: string
  /**
   * Do not include `messages` in player `activeData`.
   * Use `frame` instead, as it will populate player `activeData` automatically as necessary.
   */
  activeData?: Omit<Partial<PlayerStateActiveData>, 'messages'>
  progress?: Progress
  datatypes?: RosDatatypes
  globalVariables?: GlobalVariables
  layout?: MosaicNode<string>
  userScripts?: UserScripts
  savedProps?: SavedProps
  publish?: (request: PublishPayload) => void
  setPublishers?: (publisherId: string, advertisements: AdvertiseOptions[]) => void
  setSubscriptions?: ComponentProps<typeof MockMessagePipelineProvider>['setSubscriptions']
  setParameter?: (key: string, value: ParameterValue) => void
  fetchAsset?: ComponentProps<typeof MockMessagePipelineProvider>['fetchAsset']
  callService?: (service: string, request: unknown) => Promise<unknown>
  messageConverters?: readonly RegisterMessageConverterArgs<unknown>[]
  panelState?: Partial<PanelStateStore>
}

interface UnconnectedProps {
  children: React.ReactNode
  fixture?: Fixture
  includeSettings?: boolean
  settingsWidth?: number
  panelCatalog?: PanelCatalog
  omitDragAndDrop?: boolean
  pauseFrame?: ComponentProps<typeof MockMessagePipelineProvider>['pauseFrame']
  style?: React.CSSProperties
  // Needed for functionality not in React.CSSProperties, like child selectors: "& > *"
  className?: string
}

function makeMockPanelCatalog(t: TFunction<'panels'>): PanelCatalog {
  const allPanels = [...panels.getBuiltin(t)]

  const visiblePanels = [...panels.getBuiltin(t)]

  return {
    getPanels() {
      return visiblePanels
    },
    getPanelByType(type: string) {
      return allPanels.find(panel => panel.type === type)
    },
  }
}

interface ExtensionCatalogProps {
  messageConverters: ExtensionCatalog['installedMessageConverters']
}

function MockExtensionCatalogProvider(props: PropsWithChildren<ExtensionCatalogProps>) {
  const value = useMemo(() => {
    return createStore(
      () =>
        ({
          installExtension: async () => await Promise.reject('unsupported'),
          installedExtensions: [],
          installedMessageConverters: props.messageConverters ?? [],
          installedPanels: {},
          installedTopicAliasFunctions: [],
        }) satisfies ExtensionCatalog,
    )
  }, [props.messageConverters])

  return (
    <ExtensionCatalogContext.Provider value={value}>
      {props.children}
    </ExtensionCatalogContext.Provider>
  )
}

export function triggerWheel(target: HTMLElement, deltaX: number): void {
  const event = new WheelEvent('wheel', { deltaX, bubbles: true, cancelable: true })
  target.dispatchEvent(event)
}

function MosaicWrapper({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <DndProvider backend={HTML5Backend}>
      <Mosaic
        className="mosaic-catrobotics-theme" // prevent the default mosaic theme from being applied
        initialValue="mock"
        renderTile={(_id, path) => {
          return (
            <MosaicWindow title="" path={path} renderPreview={() => <div />}>
              {children}
            </MosaicWindow>
          )
        }}
      />
    </DndProvider>
  )
}

const EmptyTree: SettingsTree = {
  actionHandler: () => undefined,
  nodes: {},
}

function PanelWrapper({
  children,
  includeSettings = false,
  settingsWidth,
}: {
  children?: ReactNode
  includeSettings?: boolean
  settingsWidth?: number
}): React.JSX.Element {
  const settings = usePanelStateStore((store) => {
    const trees = Object.values(store.settingsTrees)
    if (trees.length > 1) {
      throw new Error(
        `includeSettings requires there to be at most 1 panel, found ${trees.length}`,
      )
    }
    return trees[0] ?? EmptyTree
  })

  return (
    <>
      {includeSettings && (
        <div style={{ overflow: 'auto', width: settingsWidth }}>
          <SettingsTreeEditor variant="panel" settings={settings} />
        </div>
      )}
      {children}
    </>
  )
}

const defaultFetchAsset: ComponentProps<typeof MockMessagePipelineProvider>['fetchAsset'] = async (
  uri,
  options,
) => {
  const response = await fetch(uri, options)
  return {
    uri,
    data: new Uint8Array(await response.arrayBuffer()),
    mediaType: response.headers.get('content-type') ?? undefined,
  }
}

function UnconnectedPanelSetup(props: UnconnectedProps): React.JSX.Element | null {
  const { t } = useTranslation('panels')
  const mockPanelCatalog = useMemo(
    () => props.panelCatalog ?? makeMockPanelCatalog(t),
    [props.panelCatalog, t],
  )
  const [mockAppConfiguration] = useState(() => ({
    get() {
      return undefined
    },
    async set() {},
    addChangeListener() {},
    removeChangeListener() {},
  }))

  const actions = useCurrentLayoutActions()
  const [initialized, setInitialized] = useState(false)
  useLayoutEffect(() => {
    if (initialized) {
      return
    }
    const { globalVariables, userScripts, layout, savedProps } = props.fixture ?? {}
    if (globalVariables) {
      actions.overwriteGlobalVariables(globalVariables)
    }
    if (userScripts) {
      actions.setUserScripts(userScripts)
    }
    if (layout != undefined) {
      actions.changePanelLayout({ layout })
    }
    if (savedProps) {
      actions.savePanelConfigs({
        configs: Object.entries(savedProps).map(([id, config]) => ({ id, config })),
      })
    }
    setInitialized(true)
  }, [initialized, props.fixture, actions])

  const {
    frame = {},
    topics = [],
    datatypes,
    capabilities,
    profile,
    activeData,
    progress,
    publish,
    setPublishers,
    setSubscriptions,
    setParameter,
    fetchAsset,
    callService,
  } = props.fixture ?? {}
  let dTypes = datatypes
  if (!dTypes) {
    const dummyDatatypes: RosDatatypes = new Map()
    for (const { schemaName } of topics) {
      if (schemaName != undefined) {
        dummyDatatypes.set(schemaName, { definitions: [] })
      }
    }
    dTypes = dummyDatatypes
  }
  const allData = _.flatten(Object.values(frame))

  const inner = (
    <div
      style={{ width: '100%', height: '100%', display: 'flex', ...props.style }}
      className={props.className}
    >
      <MockMessagePipelineProvider
        capabilities={capabilities}
        topics={topics}
        datatypes={dTypes}
        messages={allData}
        pauseFrame={props.pauseFrame}
        profile={profile}
        activeData={activeData}
        progress={progress}
        publish={publish}
        startPlayback={noop}
        pausePlayback={noop}
        seekPlayback={noop}
        setPublishers={setPublishers}
        setSubscriptions={setSubscriptions}
        setParameter={setParameter}
        fetchAsset={fetchAsset ?? defaultFetchAsset}
        callService={callService}
      >
        <PanelCatalogContext.Provider value={mockPanelCatalog}>
          <AppConfigurationContext.Provider value={mockAppConfiguration}>
            <PanelWrapper
              includeSettings={props.includeSettings}
              settingsWidth={props.settingsWidth}
            >
              {props.children}
            </PanelWrapper>
          </AppConfigurationContext.Provider>
        </PanelCatalogContext.Provider>
      </MockMessagePipelineProvider>
    </div>
  )

  // Wait to render children until we've initialized state as requested in the fixture
  if (!initialized) {
    return null
  }

  const { omitDragAndDrop = false } = props
  return omitDragAndDrop ? inner : <MosaicWrapper>{inner}</MosaicWrapper>
}

type Props = UnconnectedProps & {
  includeSettings?: boolean
  settingsWidth?: number
  onLayoutAction?: (action: PanelsActions) => void
}

export default function PanelSetup(props: Props): React.JSX.Element {
  const theme = useTheme()
  return (
    <WorkspaceContextProvider disablePersistenceForStorybook>
      <TimelineInteractionStateProvider>
        <MockCurrentLayoutProvider onAction={props.onLayoutAction}>
          <PanelStateContextProvider initialState={props.fixture?.panelState}>
            <MockExtensionCatalogProvider messageConverters={props.fixture?.messageConverters}>
              <ThemeProvider isDark={theme.palette.mode === 'dark'}>
                <UnconnectedPanelSetup {...props} />
              </ThemeProvider>
            </MockExtensionCatalogProvider>
          </PanelStateContextProvider>
        </MockCurrentLayoutProvider>
      </TimelineInteractionStateProvider>
    </WorkspaceContextProvider>
  )
}
