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

import type { MessagePath } from '@catrobotics/message-path'
import type { SaveConfig } from '@catrobotics/studio-base/types/panels'
import { parseMessagePath } from '@catrobotics/message-path'

import EmptyState from '@catrobotics/studio-base/components/EmptyState'
import MessagePathInput from '@catrobotics/studio-base/components/MessagePathSyntax/MessagePathInput'
import { useCachedGetMessagePathDataItems } from '@catrobotics/studio-base/components/MessagePathSyntax/useCachedGetMessagePathDataItems'
import Panel from '@catrobotics/studio-base/components/Panel'
import { usePanelContext } from '@catrobotics/studio-base/components/PanelContext'
import PanelToolbar from '@catrobotics/studio-base/components/PanelToolbar'
import Stack from '@catrobotics/studio-base/components/Stack'
import { useMessagesByTopic } from '@catrobotics/studio-base/PanelAPI'
import { useCallback, useEffect, useMemo } from 'react'
import { makeStyles } from 'tss-react/mui'

import Table from './Table'

interface Config { topicPath: string }
interface Props { config: Config, saveConfig: SaveConfig<Config> }

const useStyles = makeStyles({ name: 'Table' })(theme => ({
  toolbar: {
    paddingBlock: 0,
  },
  monospace: {
    fontFamily: theme.typography.fontMonospace,
  },
}))

function TablePanel({ config, saveConfig }: Props) {
  const { topicPath } = config
  const { classes } = useStyles()
  const onTopicPathChange = useCallback(
    (newTopicPath: string) => {
      saveConfig({ topicPath: newTopicPath })
    },
    [saveConfig],
  )

  const topicRosPath: MessagePath | undefined = useMemo(
    () => parseMessagePath(topicPath),
    [topicPath],
  )
  const topicName = topicRosPath?.topicName ?? ''
  const msgs = useMessagesByTopic({ topics: [topicName], historySize: 1 })[topicName]
  const cachedGetMessagePathDataItems = useCachedGetMessagePathDataItems([topicPath])
  const msg = msgs?.[0]
  const cachedMessages = msg ? cachedGetMessagePathDataItems(topicPath, msg) ?? [] : []
  const firstCachedMessage = cachedMessages[0]

  const { setMessagePathDropConfig } = usePanelContext()

  useEffect(() => {
    setMessagePathDropConfig({
      getDropStatus(paths) {
        if (paths.length !== 1) {
          return { canDrop: false }
        }
        return { canDrop: true, effect: 'replace' }
      },
      handleDrop(paths) {
        const path = paths[0]
        if (path) {
          saveConfig({ topicPath: path.path })
        }
      },
    })
  }, [setMessagePathDropConfig, saveConfig])

  return (
    <Stack flex="auto" overflow="hidden" position="relative">
      <PanelToolbar className={classes.toolbar}>
        <MessagePathInput index={0} path={topicPath} onChange={onTopicPathChange} />
      </PanelToolbar>
      {topicPath.length === 0 && <EmptyState>No topic selected</EmptyState>}
      {topicPath.length !== 0 && cachedMessages.length === 0 && (
        <EmptyState>Waiting for next message…</EmptyState>
      )}
      {topicPath.length !== 0 && firstCachedMessage && (
        <Stack overflow="auto" className={classes.monospace}>
          <Table value={firstCachedMessage.value} accessorPath="" />
        </Stack>
      )}
    </Stack>
  )
}

TablePanel.panelType = 'Table'
TablePanel.defaultConfig = {
  topicPath: '',
}

export default Panel(TablePanel)
