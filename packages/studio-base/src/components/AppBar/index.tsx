// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type {
  LayoutState,
} from '@catrobotics/studio-base/context/CurrentLayoutContext'
import type {
  WorkspaceContextStore,
} from '@catrobotics/studio-base/context/Workspace/WorkspaceContext'
import type { CustomWindowControlsProps } from './CustomWindowControls'
import { BrandMark } from '@catrobotics/studio-base/components/BrandMark'
import Stack from '@catrobotics/studio-base/components/Stack'
import { useAppContext } from '@catrobotics/studio-base/context/AppContext'
import { defaultBranding, useBranding } from '@catrobotics/studio-base/context/BrandingContext'
import {
  useCurrentLayoutSelector,
} from '@catrobotics/studio-base/context/CurrentLayoutContext'

import { useWorkspaceActions } from '@catrobotics/studio-base/context/Workspace/useWorkspaceActions'
import {
  useWorkspaceStore,
} from '@catrobotics/studio-base/context/Workspace/WorkspaceContext'
import {
  ChevronDown12Regular,
  PanelLeft24Filled,
  PanelLeft24Regular,
  PanelRight24Filled,
  PanelRight24Regular,
  SlideAdd24Regular,
} from '@fluentui/react-icons'
import { Avatar, IconButton, Tooltip, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import tc from 'tinycolor2'

import { makeStyles } from 'tss-react/mui'
import { AddPanelMenu } from './AddPanelMenu'
import { AppBarContainer } from './AppBarContainer'
import { AppBarIconButton } from './AppBarIconButton'
import { AppMenu } from './AppMenu'
import { CustomWindowControls } from './CustomWindowControls'
import { DataSource } from './DataSource'
import { SettingsMenu } from './SettingsMenu'

const useStyles = makeStyles<{ debugDragRegion?: boolean }, 'avatar'>({ name: 'AppBar' })((
  theme,
  { debugDragRegion = false },
  classes,
) => {
  const NOT_DRAGGABLE_STYLE: Record<string, string> = { WebkitAppRegion: 'no-drag' }
  if (debugDragRegion) {
    NOT_DRAGGABLE_STYLE.backgroundColor = 'red'
  }
  return {
    toolbar: {
      display: 'grid',
      width: '100%',
      gridTemplateAreas: `"start middle end"`,
      gridTemplateColumns: '1fr auto 1fr',
      alignItems: 'center',
    },
    logo: {
      'padding': theme.spacing(0.75, 0.5),
      'fontSize': '2rem',
      'color': theme.palette.appBar.text,
      'borderRadius': 0,

      'svg:not(.MuiSvgIcon-root)': {
        fontSize: '1em',
      },
      '&:hover': {
        backgroundColor: tc(theme.palette.common.white).setAlpha(0.08).toRgbString(),
      },
      '&.Mui-selected': {
        backgroundColor: theme.palette.appBar.primary,
        color: theme.palette.common.white,
      },
      '&.Mui-disabled': {
        color: 'currentColor',
        opacity: theme.palette.action.disabledOpacity,
      },
    },
    dropDownIcon: {
      fontSize: '12px !important',
    },
    brandMark: {
      width: '1em',
      height: '1em',
      flex: '0 0 auto',
    },
    brandName: {
      maxWidth: 180,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      marginLeft: theme.spacing(0.5),
      fontWeight: 700,
    },
    start: {
      gridArea: 'start',
      display: 'flex',
      flex: 1,
      alignItems: 'center',
    },
    startInner: {
      display: 'flex',
      alignItems: 'center',
      ...NOT_DRAGGABLE_STYLE, // make buttons clickable for desktop app
    },
    middle: {
      gridArea: 'middle',
      justifySelf: 'center',
      overflow: 'hidden',
      maxWidth: '100%',
      ...NOT_DRAGGABLE_STYLE, // make buttons clickable for desktop app
    },
    end: {
      gridArea: 'end',
      flex: 1,
      display: 'flex',
      justifyContent: 'flex-end',
    },
    endInner: {
      display: 'flex',
      alignItems: 'center',
      ...NOT_DRAGGABLE_STYLE, // make buttons clickable for desktop app
    },
    keyEquivalent: {
      fontFamily: theme.typography.fontMonospace,
      background: tc(theme.palette.common.white).darken(45).toString(),
      padding: theme.spacing(0, 0.5),
      aspectRatio: 1,
      borderRadius: theme.shape.borderRadius,
      marginLeft: theme.spacing(1),
    },
    tooltip: {
      marginTop: `${theme.spacing(0.5)} !important`,
    },
    avatar: {
      color: theme.palette.common.white,
      backgroundColor: tc(theme.palette.appBar.main).lighten().toString(),
      height: theme.spacing(3.5),
      width: theme.spacing(3.5),
    },
    iconButton: {
      'padding': theme.spacing(1),
      'borderRadius': 0,

      '&:hover': {
        backgroundColor: tc(theme.palette.common.white).setAlpha(0.08).toString(),

        [`.${classes.avatar}`]: {
          backgroundColor: tc(theme.palette.appBar.main).lighten(20).toString(),
        },
      },
      '&.Mui-selected': {
        backgroundColor: theme.palette.appBar.primary,

        [`.${classes.avatar}`]: {
          backgroundColor: tc(theme.palette.appBar.main).setAlpha(0.3).toString(),
        },
      },
    },
  }
})

export type AppBarProps = CustomWindowControlsProps & {
  leftInset?: number
  onDoubleClick?: () => void
  debugDragRegion?: boolean
}

const selectHasCurrentLayout = (state: LayoutState) => state.selectedLayout != undefined
const selectLeftSidebarOpen = (store: WorkspaceContextStore) => store.sidebars.left.open
const selectRightSidebarOpen = (store: WorkspaceContextStore) => store.sidebars.right.open

export function AppBar(props: AppBarProps): React.JSX.Element {
  const {
    debugDragRegion,
    isMaximized,
    leftInset,
    onCloseWindow,
    onDoubleClick,
    onMaximizeWindow,
    onMinimizeWindow,
    onUnmaximizeWindow,
    showCustomWindowControls = false,
  } = props
  const { classes, cx, theme } = useStyles({ debugDragRegion })
  const { t } = useTranslation('appBar')
  const branding = useBranding()
  const productName = branding.productName ?? defaultBranding.productName

  const { appBarLayoutButton } = useAppContext()

  const hasCurrentLayout = useCurrentLayoutSelector(selectHasCurrentLayout)

  const leftSidebarOpen = useWorkspaceStore(selectLeftSidebarOpen)
  const rightSidebarOpen = useWorkspaceStore(selectRightSidebarOpen)

  const { sidebarActions } = useWorkspaceActions()

  const [appMenuEl, setAppMenuEl] = useState<undefined | HTMLElement>(undefined)
  const [userAnchorEl, setUserAnchorEl] = useState<undefined | HTMLElement>(undefined)
  const [panelAnchorEl, setPanelAnchorEl] = useState<undefined | HTMLElement>(undefined)

  const appMenuOpen = Boolean(appMenuEl)
  const userMenuOpen = Boolean(userAnchorEl)
  const panelMenuOpen = Boolean(panelAnchorEl)

  return (
    <>
      <AppBarContainer onDoubleClick={onDoubleClick} leftInset={leftInset}>
        <div className={classes.toolbar}>
          <div className={classes.start}>
            <div className={classes.startInner}>
              <IconButton
                className={cx(classes.logo, { 'Mui-selected': appMenuOpen })}
                color="inherit"
                id="app-menu-button"
                title={`${productName} menu`}
                aria-label={`${productName} menu`}
                aria-controls={appMenuOpen ? 'app-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={appMenuOpen ? 'true' : undefined}
                data-tourid="app-menu-button"
                onClick={(event) => {
                  setAppMenuEl(event.currentTarget)
                }}
              >
                <BrandMark variant="appBar" className={classes.brandMark} />
                {branding.appBar?.showProductName === true && (
                  <Typography className={classes.brandName} variant="body2" component="span">
                    {productName}
                  </Typography>
                )}
                {branding.appBar?.showMenuChevron !== false && (
                  <ChevronDown12Regular
                    className={classes.dropDownIcon}
                    primaryFill={theme.palette.appBar.text}
                  />
                )}
              </IconButton>
              <AppMenu
                open={appMenuOpen}
                anchorEl={appMenuEl}
                handleClose={() => {
                  setAppMenuEl(undefined)
                }}
              />
              {branding.appBar?.afterMenu}
              <AppBarIconButton
                className={cx({ 'Mui-selected': panelMenuOpen })}
                color="inherit"
                disabled={!hasCurrentLayout}
                id="add-panel-button"
                data-tourid="add-panel-button"
                title={t('addPanel')}
                aria-label="Add panel button"
                aria-controls={panelMenuOpen ? 'add-panel-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={panelMenuOpen ? 'true' : undefined}
                onClick={(event) => {
                  setPanelAnchorEl(event.currentTarget)
                }}
              >
                <SlideAdd24Regular />
              </AppBarIconButton>
            </div>
          </div>

          <div className={classes.middle}>
            {branding.appBar?.centerContent ?? <DataSource />}
          </div>

          <div className={classes.end}>
            <div className={classes.endInner}>
              {branding.appBar?.beforeActions}
              {appBarLayoutButton}
              <Stack direction="row" alignItems="center" data-tourid="sidebar-button-group">
                <AppBarIconButton
                  title={(
                    <>
                      {leftSidebarOpen ? t('hideLeftSidebar') : t('showLeftSidebar')}
                      {' '}
                      <kbd className={classes.keyEquivalent}>[</kbd>
                    </>
                  )}
                  aria-label={leftSidebarOpen ? t('hideLeftSidebar') : t('showLeftSidebar')}
                  onClick={() => {
                    sidebarActions.left.setOpen(!leftSidebarOpen)
                  }}
                  data-tourid="left-sidebar-button"
                >
                  {leftSidebarOpen ? <PanelLeft24Filled /> : <PanelLeft24Regular />}
                </AppBarIconButton>
                <AppBarIconButton
                  title={(
                    <>
                      {rightSidebarOpen ? t('hideRightSidebar') : t('showRightSidebar')}
                      {' '}
                      <kbd className={classes.keyEquivalent}>]</kbd>
                    </>
                  )}
                  aria-label={rightSidebarOpen ? t('hideRightSidebar') : t('showRightSidebar')}
                  onClick={() => {
                    sidebarActions.right.setOpen(!rightSidebarOpen)
                  }}
                  data-tourid="right-sidebar-button"
                >
                  {rightSidebarOpen ? <PanelRight24Filled /> : <PanelRight24Regular />}
                </AppBarIconButton>
              </Stack>
              <Tooltip classes={{ tooltip: classes.tooltip }} title="Profile" arrow={false}>
                <IconButton
                  className={cx(classes.iconButton, { 'Mui-selected': userMenuOpen })}
                  aria-label="User profile menu button"
                  color="inherit"
                  id="user-button"
                  data-tourid="user-button"
                  aria-controls={userMenuOpen ? 'user-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen ? 'true' : undefined}
                  onClick={(event) => {
                    setUserAnchorEl(event.currentTarget)
                  }}
                  data-testid="user-button"
                >
                  <Avatar className={classes.avatar} variant="rounded" />
                </IconButton>
              </Tooltip>
              {showCustomWindowControls && (
                <CustomWindowControls
                  onMinimizeWindow={onMinimizeWindow}
                  isMaximized={isMaximized}
                  onUnmaximizeWindow={onUnmaximizeWindow}
                  onMaximizeWindow={onMaximizeWindow}
                  onCloseWindow={onCloseWindow}
                />
              )}
            </div>
          </div>
        </div>
      </AppBarContainer>
      <AddPanelMenu
        anchorEl={panelAnchorEl}
        open={panelMenuOpen}
        handleClose={() => {
          setPanelAnchorEl(undefined)
        }}
      />
      <SettingsMenu
        anchorEl={userAnchorEl}
        open={userMenuOpen}
        handleClose={() => {
          setUserAnchorEl(undefined)
        }}
      />
    </>
  )
}
