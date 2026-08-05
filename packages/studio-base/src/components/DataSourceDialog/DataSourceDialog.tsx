// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type {
  WorkspaceContextStore,
} from '@catrobotics/studio-base/context/Workspace/WorkspaceContext'
import { useMountedState } from '@catrobotics/hooks'
import Snow from '@catrobotics/studio-base/components/DataSourceDialog/Snow'
import Stack from '@catrobotics/studio-base/components/Stack'
import { useAnalytics } from '@catrobotics/studio-base/context/AnalyticsContext'

import { usePlayerSelection } from '@catrobotics/studio-base/context/PlayerSelectionContext'
import { useWorkspaceActions } from '@catrobotics/studio-base/context/Workspace/useWorkspaceActions'
import {
  useWorkspaceStore,
} from '@catrobotics/studio-base/context/Workspace/WorkspaceContext'
import { AppEvent } from '@catrobotics/studio-base/services/IAnalytics'
import CloseIcon from '@mui/icons-material/Close'
import { Dialog, IconButton } from '@mui/material'
import { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import { makeStyles } from 'tss-react/mui'

import Connection from './Connection'
import Start from './Start'

export type DataSourceDialogItem = 'start' | 'file' | 'demo' | 'remote' | 'connection'

interface DataSourceDialogProps {
  backdropAnimation?: boolean
}

const useStyles = makeStyles({ name: 'DataSourceDialog' })(theme => ({
  paper: {
    maxWidth: `calc(min(${theme.breakpoints.values.md}px, 100% - ${theme.spacing(4)}))`,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    margin: theme.spacing(3),
  },
}))

const selectDataSourceDialog = (store: WorkspaceContextStore) => store.dialogs.dataSource

export function DataSourceDialog(props: DataSourceDialogProps): React.JSX.Element {
  const { backdropAnimation } = props
  const { classes } = useStyles()
  const { availableSources, selectSource } = usePlayerSelection()
  const { dialogActions } = useWorkspaceActions()
  const { activeDataSource, item: activeView } = useWorkspaceStore(selectDataSourceDialog)

  const isMounted = useMountedState()

  const firstSampleSource = useMemo(() => {
    return availableSources.find(source => source.type === 'sample')
  }, [availableSources])

  const analytics = useAnalytics()

  const onModalClose = useCallback(() => {
    void analytics.logEvent(AppEvent.DIALOG_CLOSE, { activeDataSource })
    dialogActions.dataSource.close()
  }, [analytics, activeDataSource, dialogActions.dataSource])

  const prevActiveViewRef = useRef<DataSourceDialogItem | undefined>(undefined)
  useLayoutEffect(() => {
    if (activeView === prevActiveViewRef.current) {
      // Only run actions below when the active view actually changed
      return
    }
    prevActiveViewRef.current = activeView
    if (activeView === 'file') {
      dialogActions.openFile
        .open()
        .catch((err) => {
          console.error(err)
        })
        .finally(() => {
          // set the view back to start so the user can click to open file again
          if (isMounted()) {
            dialogActions.dataSource.open('start')
          }
        })
    }
    else if (activeView === 'demo' && firstSampleSource) {
      selectSource(firstSampleSource.id)
    }
  }, [activeView, dialogActions, firstSampleSource, isMounted, selectSource])

  const backdrop = useMemo(() => {
    const now = new Date()
    if (backdropAnimation === false) {
      return undefined
    }
    else if (now >= new Date(now.getFullYear(), 11, 25)) {
      return <Snow effect="snow" />
    }
    else if (now < new Date(now.getFullYear(), 0, 2)) {
      return <Snow effect="confetti" />
    }
    return undefined
  }, [backdropAnimation])

  const view = useMemo(() => {
    switch (activeView) {
      case 'demo': {
        return {
          title: '',
          component: <></>,
        }
      }
      case 'connection':
        return {
          title: 'Open new connection',
          component: <Connection />,
        }
      default:
        return {
          title: 'Get started',
          component: <Start />,
        }
    }
  }, [activeView])

  return (
    <Dialog
      data-testid="DataSourceDialog"
      open
      onClose={onModalClose}
      fullWidth
      maxWidth="lg"
      slotProps={{
        backdrop: { children: backdrop },

        paper: {
          square: false,
          elevation: 4,
          className: classes.paper,
        },
      }}
    >
      <IconButton className={classes.closeButton} onClick={onModalClose} edge="end">
        <CloseIcon />
      </IconButton>
      <Stack
        flexGrow={1}
        fullHeight
        justifyContent="space-between"
        overflow={activeView === 'connection' ? 'hidden' : undefined}
      >
        {view.component}
      </Stack>
    </Dialog>
  )
}
