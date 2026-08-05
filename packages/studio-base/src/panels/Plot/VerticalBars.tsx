// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { Scale } from './ChartRenderer'
import type { PlotCoordinator } from './PlotCoordinator'
import { useLatest } from '@catrobotics/hooks'

import { useMessagePipelineSubscribe } from '@catrobotics/studio-base/components/MessagePipeline'
import { useHoverValue } from '@catrobotics/studio-base/context/TimelineInteractionStateContext'
import { toSec } from '@foxglove/rostime'

import { memo, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { makeStyles } from 'tss-react/mui'

interface Props {
  coordinator?: PlotCoordinator
  hoverComponentId: string
  xAxisIsPlaybackTime: boolean
}

const useStyles = makeStyles({ name: 'VerticalBars' })(() => ({
  verticalBar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 1,
    marginLeft: -1,
    display: 'block',
    pointerEvents: 'none',
  },
  playbackBar: {
    backgroundColor: '#aaa',
  },
}))

/** Get the canvas pixel x location for the plot x value */
function getPixelForXValue(
  scale: Scale | undefined,
  xValue: number | undefined,
): number | undefined {
  if (!scale || xValue == undefined) {
    return undefined
  }

  const pixelRange = scale.right - scale.left
  if (pixelRange <= 0) {
    return undefined
  }

  if (xValue < scale.min || xValue > scale.max) {
    return undefined
  }

  // Linear interpolation to place the xValue within min/max
  return scale.left + ((xValue - scale.min) / (scale.max - scale.min)) * pixelRange
}

/**
 * Display vertical bars at the currentTime & the hovered time.
 *
 * This is a separate component in order to limit the scope of what needs to re-render when time and scale change.
 */
export const VerticalBars = memo(({
  coordinator,
  hoverComponentId,
  xAxisIsPlaybackTime,
}: Props): React.JSX.Element => {
  const { classes, cx, theme } = useStyles()

  const messagePipelineSubscribe = useMessagePipelineSubscribe()

  const hoverValue = useHoverValue({
    componentId: hoverComponentId,
    isPlaybackSeconds: xAxisIsPlaybackTime,
  })
  const latestHoverValue = useLatest(hoverValue)
  const latestCurrentTimeSinceStart = useRef<number | undefined>(undefined)
  const latestXScale = useRef<Scale | undefined>(undefined)

  const currentTimeBarRef = useRef<HTMLDivElement>(null)
  const hoverBarRef = useRef<HTMLDivElement>(null)

  const updateBars = useCallback(() => {
    if (!currentTimeBarRef.current || !hoverBarRef.current) {
      return
    }
    const currentTimePixel = getPixelForXValue(
      latestXScale.current ?? undefined,
      latestCurrentTimeSinceStart.current,
    )
    const hoverValuePixel = getPixelForXValue(
      latestXScale.current ?? undefined,
      latestHoverValue.current?.value,
    )

    if (currentTimePixel != undefined) {
      currentTimeBarRef.current.style.display = 'block'
      currentTimeBarRef.current.style.transform = `translateX(${currentTimePixel}px)`
    }
    else {
      currentTimeBarRef.current.style.display = 'none'
    }

    if (hoverValuePixel != undefined) {
      hoverBarRef.current.style.display = 'block'
      hoverBarRef.current.style.transform = `translateX(${hoverValuePixel}px)`
    }
    else {
      hoverBarRef.current.style.display = 'none'
    }
  }, [latestHoverValue])

  useLayoutEffect(() => {
    updateBars()
  }, [hoverValue, updateBars])

  useEffect(() => {
    latestXScale.current = undefined
    if (!coordinator) {
      return
    }
    const handler = (scale: Scale | undefined) => {
      latestXScale.current = scale
      updateBars()
    }
    coordinator.on('xScaleChanged', handler)
    return () => {
      coordinator.off('xScaleChanged', handler)
    }
  }, [coordinator, updateBars])

  useEffect(() => {
    latestCurrentTimeSinceStart.current = undefined

    // Only subscribe to currentTime for timeseries plots
    if (!xAxisIsPlaybackTime) {
      return
    }
    const unsubscribe = messagePipelineSubscribe(({ playerState: { activeData } }) => {
      if (!activeData) {
        latestCurrentTimeSinceStart.current = undefined
        return
      }
      latestCurrentTimeSinceStart.current
        = toSec(activeData.currentTime) - toSec(activeData.startTime)
      updateBars()
    })
    return unsubscribe
  }, [xAxisIsPlaybackTime, messagePipelineSubscribe, updateBars])

  if (!coordinator) {
    return <></>
  }

  return (
    <>
      <div ref={currentTimeBarRef} className={cx(classes.verticalBar, classes.playbackBar)} />
      <div
        ref={hoverBarRef}
        className={cx(classes.verticalBar)}
        style={{
          backgroundColor: xAxisIsPlaybackTime
            ? theme.palette.warning.main
            : theme.palette.info.main,
        }}
      />
    </>
  )
})
