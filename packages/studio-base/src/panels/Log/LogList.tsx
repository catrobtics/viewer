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

import type { NormalizedLogMessage } from '@catrobotics/studio-base/panels/Log/types'
import type { UIEvent } from 'react'
import type {
  ListImperativeAPI,
  RowComponentProps,
} from 'react-window'
import { useLatest } from '@catrobotics/hooks'
import { useAppTimeFormat } from '@catrobotics/studio-base/hooks'
import DoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown'
import { Fab } from '@mui/material'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useResizeDetector } from 'react-resize-detector'

import {
  List,
  useDynamicRowHeight,
} from 'react-window'
import { makeStyles } from 'tss-react/mui'

import { AutoSizer } from '../../components/AutoSizer'
import LogMessage from './LogMessage'

const useStyles = makeStyles({ name: 'LogList' })(theme => ({
  floatingButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    margin: theme.spacing(1.5),
  },
}))

interface Props {
  items: readonly NormalizedLogMessage[]
}

interface ListItemData {
  items: readonly NormalizedLogMessage[]
}

function Row(props: RowComponentProps<ListItemData>): React.JSX.Element {
  const { timeFormat, timeZone } = useAppTimeFormat()
  const item = props.items[props.index]!

  return (
    <div style={{ ...props.style, height: 'auto' }}>
      <LogMessage value={item} timestampFormat={timeFormat} timeZone={timeZone} />
    </div>
  )
}

/**
 * List for showing large number of items, which are expected to be appended to the end regularly.
 * Automatically scrolls to the bottom unless you explicitly scroll up.
 */
function LogList({ items }: Props): React.JSX.Element {
  const { classes } = useStyles()

  // Reference to the list item itself.
  const listRef = useRef<ListImperativeAPI>(null)

  const latestItems = useLatest(items)

  // Automatically scroll to reveal new items.
  const [autoscrollToEnd, setAutoscrollToEnd] = useState(true)

  const onResetView = useCallback(() => {
    setAutoscrollToEnd(true)
    listRef.current?.scrollToRow({ index: latestItems.current.length - 1, align: 'end' })
  }, [latestItems])

  useEffect(() => {
    if (autoscrollToEnd) {
      listRef.current?.scrollToRow({ index: items.length - 1, align: 'end' })
    }
  }, [autoscrollToEnd, items.length])

  // Disable autoscroll if the user manually scrolls back.
  const onScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget
    const isAtEnd = Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 1
    setAutoscrollToEnd(isAtEnd)
  }, [])

  const { width: resizedWidth, ref: resizeRootRef } = useResizeDetector({
    refreshRate: 0,
    refreshMode: 'debounce',
  })

  // This is passed to each row to tell it what to render.
  const itemData = useMemo(
    () => ({ items }),
    // Add resized width as an extra dep here to force the list to recalculate
    // everything when the width changes.
    [items, resizedWidth],
  )
  const rowHeight = useDynamicRowHeight({ defaultRowHeight: 16, key: resizedWidth })

  return (
    <AutoSizer>
      {({ width, height }) => {
        return (
          <div style={{ position: 'relative', width, height }} ref={resizeRootRef}>
            <List
              listRef={listRef}
              style={{ outline: 'none', width, height }}
              rowProps={itemData}
              rowHeight={rowHeight}
              rowCount={items.length}
              rowComponent={Row}
              onScroll={onScroll}
            />

            {!autoscrollToEnd && (
              <Fab
                size="small"
                title="Scroll to bottom"
                onClick={onResetView}
                className={classes.floatingButton}
              >
                <DoubleArrowDownIcon />
              </Fab>
            )}
          </div>
        )
      }}
    </AutoSizer>
  )
}

export default LogList
