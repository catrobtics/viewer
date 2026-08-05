// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/
//
// This file incorporates work covered by the following copyright and
// permission notice:
//
//   Copyright 2020-2021 Cruise LLC
//
//   This source code is licensed under the Apache License, Version 2.0,
//   found at http://www.apache.org/licenses/LICENSE-2.0
//   You may not use this file except in compliance with the License.

import type { VariableValue } from '@catrobotics/studio'

import type { GlobalVariables } from '@catrobotics/studio-base/hooks/useGlobalVariables'
import type { TabLocation } from '@catrobotics/studio-base/types/layouts'
import type {
  MosaicDropTargetPosition,
  PanelConfig,
  PlaybackConfig,
  SavedProps,
  UserScripts,
} from '@catrobotics/studio-base/types/panels'
import type { MosaicNode, MosaicPath } from 'react-mosaic-component'

export interface LayoutData {
  // We store config for each panel in an object keyed by the panel id.
  configById: SavedProps
  layout?: MosaicNode<string>
  globalVariables: GlobalVariables
  playbackConfig: PlaybackConfig
  userNodes: UserScripts
  /** @deprecated renamed to configById */
  savedProps?: SavedProps
  /**
   * Optional version number. Set this to prevent older incompatible versions of
   * studio trying to load and possibly corrupt the layout.
   */
  version?: number
}

export interface ConfigsPayload {
  id: string
  // if you set override to true, existing config will be completely overriden by new passed in config
  override?: boolean
  config: PanelConfig
  defaultConfig?: PanelConfig
}
export interface ChangePanelLayoutPayload {
  layout?: MosaicNode<string>
  trimConfigById?: boolean
}
export interface SaveConfigsPayload {
  configs: ConfigsPayload[]
}

type PerPanelFunc<Config> = (arg0: Config) => Config
export interface SaveFullConfigPayload {
  panelType: string
  perPanelFunc: PerPanelFunc<PanelConfig>
}

export interface CreateTabPanelPayload {
  idToReplace?: string
  layout: MosaicNode<string>
  idsToRemove: readonly string[]
  singleTab: boolean
}

export interface SAVE_PANEL_CONFIGS { type: 'SAVE_PANEL_CONFIGS', payload: SaveConfigsPayload }
export interface SAVE_FULL_PANEL_CONFIG {
  type: 'SAVE_FULL_PANEL_CONFIG'
  payload: SaveFullConfigPayload
}
export interface CREATE_TAB_PANEL { type: 'CREATE_TAB_PANEL', payload: CreateTabPanelPayload }
export interface CHANGE_PANEL_LAYOUT {
  type: 'CHANGE_PANEL_LAYOUT'
  payload: ChangePanelLayoutPayload
}

export interface OVERWRITE_GLOBAL_DATA {
  type: 'OVERWRITE_GLOBAL_DATA'
  payload: Record<string, VariableValue>
}

export interface SET_GLOBAL_DATA {
  type: 'SET_GLOBAL_DATA'
  payload: Record<string, VariableValue>
}

export interface SET_STUDIO_NODES { type: 'SET_USER_NODES', payload: Partial<UserScripts> }

export interface SET_PLAYBACK_CONFIG { type: 'SET_PLAYBACK_CONFIG', payload: Partial<PlaybackConfig> }

export interface ClosePanelPayload {
  tabId?: string
  root: MosaicNode<string>
  path: MosaicPath
}
export interface CLOSE_PANEL { type: 'CLOSE_PANEL', payload: ClosePanelPayload }

export interface SplitPanelPayload {
  tabId?: string
  id: string
  direction: 'row' | 'column'
  root: MosaicNode<string>
  path: MosaicPath
  config: PanelConfig
}
export interface SPLIT_PANEL { type: 'SPLIT_PANEL', payload: SplitPanelPayload }

export interface SwapPanelPayload {
  tabId?: string
  originalId: string
  type: string
  root: MosaicNode<string>
  path: MosaicPath
  config: PanelConfig
}
export interface SWAP_PANEL { type: 'SWAP_PANEL', payload: SwapPanelPayload }

export interface MoveTabPayload { source: TabLocation, target: TabLocation }
export interface MOVE_TAB { type: 'MOVE_TAB', payload: MoveTabPayload }

export interface AddPanelPayload {
  /**
   * id must be formatted as returned by `getPanelIdForType`. This is required as an argument
   * rather than automatically generated because the caller may want to use the new id for
   * something, such as selecting the newly added panel.
   */
  id: string
  tabId?: string
  config?: PanelConfig
}
export interface ADD_PANEL { type: 'ADD_PANEL', payload: AddPanelPayload }

export interface DropPanelPayload {
  newPanelType: string
  destinationPath?: MosaicPath
  position?: 'top' | 'bottom' | 'left' | 'right'
  tabId?: string
  config?: PanelConfig
}
export interface DROP_PANEL { type: 'DROP_PANEL', payload: DropPanelPayload }

export interface StartDragPayload {
  path: MosaicPath
  sourceTabId?: string
}
export interface START_DRAG { type: 'START_DRAG', payload: StartDragPayload }

export interface EndDragPayload {
  originalLayout: MosaicNode<string>
  originalSavedProps: SavedProps
  panelId: string
  sourceTabId?: string
  targetTabId?: string
  position?: MosaicDropTargetPosition
  destinationPath?: MosaicPath
  ownPath: MosaicPath
}
export interface END_DRAG { type: 'END_DRAG', payload: EndDragPayload }

export type PanelsActions
  = | CHANGE_PANEL_LAYOUT
    | SAVE_PANEL_CONFIGS
    | SAVE_FULL_PANEL_CONFIG
    | CREATE_TAB_PANEL
    | OVERWRITE_GLOBAL_DATA
    | SET_GLOBAL_DATA
    | SET_STUDIO_NODES
    | SET_PLAYBACK_CONFIG
    | CLOSE_PANEL
    | SPLIT_PANEL
    | SWAP_PANEL
    | MOVE_TAB
    | ADD_PANEL
    | DROP_PANEL
    | START_DRAG
    | END_DRAG
