// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { SettingsTree } from '@catrobotics/studio'
import type {
  LayoutState,
} from '@catrobotics/studio-base/context/CurrentLayoutContext'
import type {
  PanelStateStore,
} from '@catrobotics/studio-base/context/PanelStateContext'
import type { PanelConfig } from '@catrobotics/studio-base/types/panels'

import { useUnmount } from '@catrobotics/hooks'
import EmptyState from '@catrobotics/studio-base/components/EmptyState'
import { ActionMenu } from '@catrobotics/studio-base/components/PanelSettings/ActionMenu'
import SettingsTreeEditor from '@catrobotics/studio-base/components/SettingsTreeEditor'
import { ShareJsonModal } from '@catrobotics/studio-base/components/ShareJsonModal'
import Stack from '@catrobotics/studio-base/components/Stack'
import {
  useCurrentLayoutActions,
  useCurrentLayoutSelector,
  useSelectedPanels,
} from '@catrobotics/studio-base/context/CurrentLayoutContext'
import { usePanelCatalog } from '@catrobotics/studio-base/context/PanelCatalogContext'
import {
  usePanelStateStore,
} from '@catrobotics/studio-base/context/PanelStateContext'
import { useConfigById } from '@catrobotics/studio-base/PanelAPI'
import { TAB_PANEL_TYPE } from '@catrobotics/studio-base/util/globalConstants'
import { getPanelTypeFromId } from '@catrobotics/studio-base/util/layout'
import { Divider, Typography } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

function singlePanelIdSelector(state: LayoutState) {
  return typeof state.selectedLayout?.data?.layout === 'string'
    ? state.selectedLayout.data.layout
    : undefined
}

const selectIncrementSequenceNumber = (store: PanelStateStore) => store.incrementSequenceNumber

const EMPTY_SETTINGS_TREE: SettingsTree = Object.freeze({
  actionHandler: () => undefined,
  nodes: {},
})

export default function PanelSettings({
  selectedPanelIdsForTests,
}: React.PropsWithChildren<{
  selectedPanelIdsForTests?: readonly string[]
}>): React.JSX.Element {
  const { t } = useTranslation('panelSettings')
  const singlePanelId = useCurrentLayoutSelector(singlePanelIdSelector)
  const {
    selectedPanelIds: originalSelectedPanelIds,
    setSelectedPanelIds,
    selectAllPanels,
  } = useSelectedPanels()
  const selectedPanelIds = selectedPanelIdsForTests ?? originalSelectedPanelIds

  // If no panel is selected and there is only one panel in the layout, select it
  useEffect(() => {
    if (selectedPanelIds.length === 0 && singlePanelId != undefined) {
      selectAllPanels()
    }
  }, [selectAllPanels, selectedPanelIds, singlePanelId])

  const selectedPanelId = useMemo(
    () => (selectedPanelIds.length === 1 ? selectedPanelIds[0] : undefined),
    [selectedPanelIds],
  )

  // Automatically deselect the panel we were editing when the settings sidebar closes
  useUnmount(() => {
    if (selectedPanelId != undefined) {
      setSelectedPanelIds([])
    }
  })

  const panelCatalog = usePanelCatalog()
  const { getCurrentLayoutState: getCurrentLayout, savePanelConfigs } = useCurrentLayoutActions()
  const panelType = useMemo(
    () => (selectedPanelId != undefined ? getPanelTypeFromId(selectedPanelId) : undefined),
    [selectedPanelId],
  )
  const panelInfo = useMemo(
    () => (panelType != undefined ? panelCatalog.getPanelByType(panelType) : undefined),
    [panelCatalog, panelType],
  )

  const incrementSequenceNumber = usePanelStateStore(selectIncrementSequenceNumber)

  const [showShareModal, setShowShareModal] = useState(false)
  const shareModal = useMemo(() => {
    const panelConfigById = getCurrentLayout().selectedLayout?.data?.configById
    if (selectedPanelId == undefined || !showShareModal || !panelConfigById) {
      return null
    }
    return (
      <ShareJsonModal
        onRequestClose={() => {
          setShowShareModal(false)
        }}
        initialValue={panelConfigById[selectedPanelId] ?? {}}
        onChange={(config) => {
          savePanelConfigs({
            configs: [{ id: selectedPanelId, config: config as PanelConfig, override: true }],
          })
          incrementSequenceNumber(selectedPanelId)
        }}
        title={t('importOrExportSettings')}
      />
    )
  }, [
    getCurrentLayout,
    selectedPanelId,
    showShareModal,
    savePanelConfigs,
    incrementSequenceNumber,
    t,
  ])

  const [config] = useConfigById(selectedPanelId)

  const settingsTree = usePanelStateStore(state =>
    selectedPanelId ? state.settingsTrees[selectedPanelId] : undefined,
  )

  const resetToDefaults = useCallback(() => {
    if (selectedPanelId) {
      savePanelConfigs({
        configs: [{ id: selectedPanelId, config: {}, override: true }],
      })
      incrementSequenceNumber(selectedPanelId)
    }
  }, [incrementSequenceNumber, savePanelConfigs, selectedPanelId])

  if (selectedPanelId == undefined) {
    return <EmptyState>{t('selectAPanelToEditItsSettings')}</EmptyState>
  }

  if (!config) {
    return <EmptyState>{t('loadingPanelSettings')}</EmptyState>
  }

  const showTitleField = panelInfo != undefined && panelInfo.hasCustomToolbar !== true
  const title = panelInfo?.title ?? t('unknown')

  return (
    <Stack fullHeight flex="auto" gap={1}>
      {shareModal}
      <Stack gap={2} justifyContent="flex-start" flex="auto">
        <Stack flex="auto">
          {settingsTree && (
            <>
              <Stack
                paddingLeft={0.75}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="subtitle2">{t('panelName', { title })}</Typography>
                <ActionMenu
                  key={1}
                  fontSize="small"
                  allowShare={panelType !== TAB_PANEL_TYPE}
                  onReset={resetToDefaults}
                  onShare={() => {
                    setShowShareModal(true)
                  }}
                />
              </Stack>
              <Divider />
            </>
          )}
          {settingsTree != undefined || showTitleField ? (
            <SettingsTreeEditor
              variant="panel"
              key={selectedPanelId}
              settings={settingsTree ?? EMPTY_SETTINGS_TREE}
            />
          ) : (
            <Stack flex="auto" alignItems="center" justifyContent="center" paddingX={1}>
              <Typography
                variant="body2"
                align="center"
                sx={{
                  color: 'text.secondary',
                }}
              >
                {t('panelDoesNotHaveSettings')}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Stack>
  )
}
