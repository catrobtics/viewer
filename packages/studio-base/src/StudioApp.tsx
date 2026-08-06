// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { useSharedRootContext } from '@catrobotics/studio-base/context/SharedRootContext'
import EventsProvider from '@catrobotics/studio-base/providers/EventsProvider'
import ProblemsContextProvider from '@catrobotics/studio-base/providers/ProblemsContextProvider'

import { StudioLogsSettingsProvider } from '@catrobotics/studio-base/providers/StudioLogsSettingsProvider'
import TimelineInteractionStateProvider from '@catrobotics/studio-base/providers/TimelineInteractionStateProvider'
import { Fragment, Suspense, useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import DocumentTitleAdapter from './components/DocumentTitleAdapter'
import MultiProvider from './components/MultiProvider'
import PlayerManager from './components/PlayerManager'
import SendNotificationToastAdapter from './components/SendNotificationToastAdapter'
import StudioToastProvider from './components/StudioToastProvider'
import CurrentLayoutProvider from './providers/CurrentLayoutProvider'
import PanelCatalogProvider from './providers/PanelCatalogProvider'
import { LaunchPreference } from './screens/LaunchPreference'
import Workspace from './Workspace'

// Suppress context menu for the entire app except on inputs & textareas.
function contextMenuHandler(event: MouseEvent) {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
    return
  }

  event.preventDefault()
  return false
}

export interface StudioAppProps {
  manageContextMenu?: boolean
  manageDocumentTitle?: boolean
}

export function StudioApp({
  manageContextMenu = true,
  manageDocumentTitle = true,
}: StudioAppProps = {}): React.JSX.Element {
  const {
    dataSources,
    deepLinks,
    enableLaunchPreferenceScreen,
    extraProviders,
    appBarLeftInset,
    customWindowControlProps,
    onAppBarDoubleClick,
    AppBarComponent,
  } = useSharedRootContext()

  const providers = [
    <TimelineInteractionStateProvider key="timeline-interaction" />,
    <CurrentLayoutProvider key="current-layout" />,
    <PlayerManager key="player-manager" playerSources={dataSources} />,
    <EventsProvider key="events" />,
  ]

  if (extraProviders) {
    providers.unshift(...extraProviders)
  }

  // The toast and logs provider comes first so they are available to all downstream providers
  providers.unshift(<StudioToastProvider />)
  providers.unshift(<StudioLogsSettingsProvider />)

  // Problems provider also must come before other, depdendent contexts.
  providers.unshift(<ProblemsContextProvider />)

  const MaybeLaunchPreference = enableLaunchPreferenceScreen === true ? LaunchPreference : Fragment

  useEffect(() => {
    if (!manageContextMenu) {
      return
    }

    document.addEventListener('contextmenu', contextMenuHandler)
    return () => {
      document.removeEventListener('contextmenu', contextMenuHandler)
    }
  }, [manageContextMenu])

  return (
    <MaybeLaunchPreference>
      <MultiProvider providers={providers}>
        {manageDocumentTitle && <DocumentTitleAdapter />}
        <SendNotificationToastAdapter />
        <DndProvider backend={HTML5Backend}>
          <Suspense fallback={<></>}>
            <PanelCatalogProvider>
              <Workspace
                deepLinks={deepLinks}
                appBarLeftInset={appBarLeftInset}
                onAppBarDoubleClick={onAppBarDoubleClick}
                showCustomWindowControls={customWindowControlProps?.showCustomWindowControls}
                isMaximized={customWindowControlProps?.isMaximized}
                initialZoomFactor={customWindowControlProps?.initialZoomFactor}
                onMinimizeWindow={customWindowControlProps?.onMinimizeWindow}
                onMaximizeWindow={customWindowControlProps?.onMaximizeWindow}
                onUnmaximizeWindow={customWindowControlProps?.onUnmaximizeWindow}
                onCloseWindow={customWindowControlProps?.onCloseWindow}
                AppBarComponent={AppBarComponent}
              />
            </PanelCatalogProvider>
          </Suspense>
        </DndProvider>
      </MultiProvider>
    </MaybeLaunchPreference>
  )
}
