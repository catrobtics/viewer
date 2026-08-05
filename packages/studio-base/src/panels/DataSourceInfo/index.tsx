// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type {
  MessagePipelineContext,
} from '@catrobotics/studio-base/components/MessagePipeline'
import type { Topic } from '@catrobotics/studio-base/players/types'
import CopyButton from '@catrobotics/studio-base/components/CopyButton'

import { DirectTopicStatsUpdater } from '@catrobotics/studio-base/components/DirectTopicStatsUpdater'
import EmptyState from '@catrobotics/studio-base/components/EmptyState'
import {
  useMessagePipeline,
} from '@catrobotics/studio-base/components/MessagePipeline'
import Panel from '@catrobotics/studio-base/components/Panel'
import PanelToolbar from '@catrobotics/studio-base/components/PanelToolbar'
import Stack from '@catrobotics/studio-base/components/Stack'
import { Divider, Typography } from '@mui/material'
import { memo } from 'react'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles<void, 'copyIcon'>({ name: 'DataSourceInfo' })((theme, _params, classes) => ({
  copyIcon: {
    'visibility': 'hidden',

    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  table: {
    borderCollapse: 'collapse',
    display: 'block',
    flex: 1,

    thead: {
      position: 'sticky',
      textAlign: 'left',
      top: 0,
      zIndex: theme.zIndex.appBar - 1,
    },

    tr: {
      '&:hover': {
        backgroundColor: theme.palette.background.paper,
      },
    },

    th: {
      backgroundColor: theme.palette.background.paper,
      paddingBlock: theme.spacing(1),
      paddingInline: theme.spacing(1.5),
      whiteSpace: 'nowrap',
      width: '100%',
    },

    td: {
      paddingBlock: theme.spacing(0.25),
      paddingInline: theme.spacing(1.5),
      whiteSpace: 'nowrap',

      [`&:hover .${classes.copyIcon}`]: {
        visibility: 'visible',
      },
    },
  },
}))

function TopicRow({ topic }: { topic: Topic }): React.JSX.Element {
  const { classes } = useStyles()

  return (
    <tr>
      <td>
        {topic.name}
        <CopyButton
          className={classes.copyIcon}
          edge="end"
          size="small"
          iconSize="small"
          getText={() => topic.name}
        />
        {topic.aliasedFromName && (
          <Typography
            variant="subtitle2"
            sx={{
              fontSize: '0.5rem',
            }}
          >
            from
            {' '}
            {topic.aliasedFromName}
          </Typography>
        )}
      </td>
      <td>
        {topic.schemaName == undefined ? (
          '—'
        ) : (
          <>
            {topic.schemaName}
            <CopyButton
              className={classes.copyIcon}
              edge="end"
              size="small"
              iconSize="small"
              getText={() => topic.schemaName ?? ''}
            />
          </>
        )}
      </td>
      <td data-topic={topic.name} data-topic-stat="count">
        &mdash;
      </td>
      <td data-topic={topic.name} data-topic-stat="frequency">
        &mdash;
      </td>
    </tr>
  )
}

const selectSortedTopics = (ctx: MessagePipelineContext) => ctx.sortedTopics
const selectStartTime = (ctx: MessagePipelineContext) => ctx.playerState.activeData?.startTime
const selectEndTime = (ctx: MessagePipelineContext) => ctx.playerState.activeData?.endTime

const MemoTopicRow = memo(TopicRow)

function SourceInfo(): React.JSX.Element {
  const { classes } = useStyles()

  const topics = useMessagePipeline(selectSortedTopics)
  const startTime = useMessagePipeline(selectStartTime)
  const endTime = useMessagePipeline(selectEndTime)

  if (!startTime || !endTime) {
    return (
      <>
        <PanelToolbar />
        <EmptyState>Waiting for data…</EmptyState>
      </>
    )
  }

  return (
    <>
      <PanelToolbar />
      <Divider />
      <Stack fullHeight overflowY="auto">
        <table className={classes.table}>
          <thead>
            <tr>
              <th>Topic Name</th>
              <th>Datatype</th>
              <th>Message count</th>
              <th>Frequency</th>
            </tr>
          </thead>
          <tbody>
            {topics.map(topic => (
              <MemoTopicRow key={topic.name} topic={topic} />
            ))}
          </tbody>
        </table>
        <DirectTopicStatsUpdater interval={6} />
      </Stack>
    </>
  )
}

SourceInfo.panelType = 'SourceInfo'
SourceInfo.defaultConfig = {}

export default Panel(SourceInfo)
