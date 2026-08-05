// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type {
  MessagePipelineContext,
} from '@catrobotics/studio-base/components/MessagePipeline'
import type { Time } from '@foxglove/rostime'
import type { RefObject } from 'react'
import {
  useMessagePipeline,
} from '@catrobotics/studio-base/components/MessagePipeline'
import Stack from '@catrobotics/studio-base/components/Stack'
import Timestamp from '@catrobotics/studio-base/components/Timestamp'

import { useAppTimeFormat } from '@catrobotics/studio-base/hooks'
import { PlayerPresence } from '@catrobotics/studio-base/players/types'
import { formatDuration } from '@catrobotics/studio-base/util/formatTime'
import { formatTimeRaw, isAbsoluteTime } from '@catrobotics/studio-base/util/time'
import { subtract as subtractTimes } from '@foxglove/rostime'
import { Skeleton, Typography } from '@mui/material'
import { memo, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'

import { MultilineMiddleTruncate } from './MultilineMiddleTruncate'

const useStyles = makeStyles({ name: 'DataSourceInfoView' })(theme => ({
  overline: {
    opacity: 0.6,
  },
  numericValue: {
    fontFeatureSettings: `${theme.typography.fontFeatureSettings}, "zero"`,
  },
}))

const selectStartTime = (ctx: MessagePipelineContext) => ctx.playerState.activeData?.startTime
const selectEndTime = (ctx: MessagePipelineContext) => ctx.playerState.activeData?.endTime
const selectPlayerName = (ctx: MessagePipelineContext) => ctx.playerState.name
const selectPlayerPresence = ({ playerState }: MessagePipelineContext) => playerState.presence
const selectSeek = (ctx: MessagePipelineContext) => ctx.seekPlayback

function DataSourceInfoContent(props: {
  disableSource?: boolean
  durationRef: RefObject<null | HTMLDivElement>
  endTimeRef: RefObject<null | HTMLDivElement>
  playerName?: string
  playerPresence: PlayerPresence
  startTime?: Time
  isLiveConnection: boolean
}): React.JSX.Element {
  const {
    disableSource = false,
    durationRef,
    endTimeRef,
    playerName,
    playerPresence,
    startTime,
  } = props
  const { classes } = useStyles()
  const { t } = useTranslation('dataSourceInfo')

  const isLiveConnection = props.isLiveConnection

  return (
    <Stack gap={1.5}>
      {!disableSource && (
        <Stack>
          <Typography
            className={classes.overline}
            variant="overline"
            sx={{
              display: 'block',
            }}
          >
            {t('currentSource')}
          </Typography>
          {playerPresence === PlayerPresence.INITIALIZING ? (
            <Typography variant="inherit">
              <Skeleton animation="wave" width="40%" />
            </Typography>
          ) : playerPresence === PlayerPresence.RECONNECTING ? (
            <Typography variant="inherit">{t('waitingForConnection')}</Typography>
          ) : playerName ? (
            <Typography variant="inherit" component="span">
              <MultilineMiddleTruncate text={playerName} />
            </Typography>
          ) : (
            <Typography className={classes.numericValue} variant="inherit">
              &mdash;
            </Typography>
          )}
        </Stack>
      )}
      <Stack>
        <Typography className={classes.overline} variant="overline">
          {t('startTime')}
        </Typography>
        {playerPresence === PlayerPresence.INITIALIZING ? (
          <Skeleton animation="wave" width="50%" />
        ) : startTime ? (
          <Timestamp horizontal time={startTime} />
        ) : (
          <Typography className={classes.numericValue} variant="inherit">
            &mdash;
          </Typography>
        )}
      </Stack>
      {!isLiveConnection && (
        <Stack>
          <Typography className={classes.overline} variant="overline">
            {t('endTime')}
          </Typography>
          {playerPresence === PlayerPresence.INITIALIZING ? (
            <Skeleton animation="wave" width="50%" />
          ) : (
            <Typography className={classes.numericValue} variant="inherit" ref={endTimeRef}>
              &mdash;
            </Typography>
          )}
        </Stack>
      )}
      <Stack>
        <Typography className={classes.overline} variant="overline">
          {t('duration')}
        </Typography>
        {playerPresence === PlayerPresence.INITIALIZING ? (
          <Skeleton animation="wave" width={100} />
        ) : (
          <Typography className={classes.numericValue} variant="inherit" ref={durationRef}>
            &mdash;
          </Typography>
        )}
      </Stack>
    </Stack>
  )
}

const MemoDataSourceInfoContent = memo(DataSourceInfoContent)

const EmDash = '\u2014'

export function DataSourceInfoView({
  disableSource,
}: {
  disableSource?: boolean
}): React.JSX.Element {
  const startTime = useMessagePipeline(selectStartTime)
  const endTime = useMessagePipeline(selectEndTime)
  const playerName = useMessagePipeline(selectPlayerName)
  const playerPresence = useMessagePipeline(selectPlayerPresence)
  const seek = useMessagePipeline(selectSeek)

  const durationRef = useRef<HTMLDivElement>(null)
  const endTimeRef = useRef<HTMLDivElement>(null)
  const { formatDate, formatTime } = useAppTimeFormat()

  // We bypass react and update the DOM elements directly for better performance here.
  useEffect(() => {
    if (durationRef.current) {
      const duration = endTime && startTime ? subtractTimes(endTime, startTime) : undefined
      if (duration) {
        const durationStr = formatDuration(duration)
        durationRef.current.textContent = durationStr
      }
      else {
        durationRef.current.textContent = EmDash
      }
    }
    if (endTimeRef.current) {
      if (endTime) {
        const date = formatDate(endTime)
        endTimeRef.current.textContent = !isAbsoluteTime(endTime)
          ? formatTimeRaw(endTime)
          : `${date} ${formatTime(endTime)}`
      }
      else {
        endTimeRef.current.innerHTML = EmDash
      }
    }
  }, [endTime, formatTime, startTime, playerPresence, formatDate])

  return (
    <MemoDataSourceInfoContent
      disableSource={disableSource}
      durationRef={durationRef}
      endTimeRef={endTimeRef}
      playerName={playerName}
      playerPresence={playerPresence}
      startTime={startTime}
      isLiveConnection={seek == undefined}
    />
  )
}
