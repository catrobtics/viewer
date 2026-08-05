// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { DraggedMessagePath } from '@catrobotics/studio-base/components/PanelExtensionAdapter'
import type { FzfResultItem } from 'fzf'
import type { MessagePathSearchItem } from './getMessagePathSearchItems'
import { HighlightChars } from '@catrobotics/studio-base/components/HighlightChars'

import Stack from '@catrobotics/studio-base/components/Stack'
import { useMessagePathDrag } from '@catrobotics/studio-base/services/messagePathDragging'
import { ReOrderDotsVertical16Regular } from '@fluentui/react-icons'
import { Badge, Typography } from '@mui/material'

import { useCallback, useMemo } from 'react'
import { useTopicListStyles } from './useTopicListStyles'

export function MessagePathRow({
  messagePathResult,
  style,
  selected,
  onClick,
  onContextMenu,
}: {
  messagePathResult: FzfResultItem<MessagePathSearchItem>
  style: React.CSSProperties
  selected: boolean
  onClick: React.MouseEventHandler<HTMLDivElement>
  onContextMenu: React.MouseEventHandler<HTMLDivElement>
}): React.JSX.Element {
  const { cx, classes } = useTopicListStyles()

  const {
    fullPath,
    suffix: { pathSuffix, type, isLeaf },
    topic,
  } = messagePathResult.item

  const item: DraggedMessagePath = useMemo(
    () => ({
      path: fullPath,
      rootSchemaName: topic.schemaName,
      isTopic: false,
      isLeaf,
      topicName: topic.name,
    }),
    [fullPath, isLeaf, topic.name, topic.schemaName],
  )

  const { connectDragSource, connectDragPreview, cursor, isDragging, draggedItemCount }
    = useMessagePathDrag({
      item,
      selected,
    })

  const combinedRef: React.Ref<HTMLDivElement> = useCallback(
    (el) => {
      connectDragSource(el)
      connectDragPreview(el)
    },
    [connectDragPreview, connectDragSource],
  )

  return (
    <div
      ref={combinedRef}
      className={cx(classes.row, classes.fieldRow, {
        [classes.isDragging]: isDragging,
        [classes.selected]: selected,
      })}
      style={{ ...style, cursor }}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      {draggedItemCount > 1 && (
        <Badge color="primary" className={classes.countBadge} badgeContent={draggedItemCount} />
      )}
      <Stack flex="auto" direction="row" gap={2} overflow="hidden">
        <Typography variant="body2" noWrap>
          <HighlightChars
            str={pathSuffix}
            indices={messagePathResult.positions}
            offset={messagePathResult.item.offset}
          />
        </Typography>
        <Typography
          variant="caption"
          noWrap
          sx={{
            color: 'text.secondary',
          }}
        >
          {type}
        </Typography>
      </Stack>
      <div data-testid="TopicListDragHandle" style={{ cursor }} className={classes.dragHandle}>
        <ReOrderDotsVertical16Regular />
      </div>
    </div>
  )
}
