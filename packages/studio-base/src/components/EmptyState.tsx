// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { ReactNode } from 'react'
import Stack from '@catrobotics/studio-base/components/Stack'
import { Typography } from '@mui/material'

import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles({ name: 'EmptyState' })(theme => ({
  root: {
    whiteSpace: 'pre-line',

    code: {
      color: theme.palette.primary.main,
      background: 'transparent',
      padding: 0,
    },
  },
}))

export default function EmptyState({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}): React.JSX.Element {
  const { classes, cx } = useStyles()

  return (
    <Stack
      className={cx(classes.root, className)}
      flex="auto"
      alignItems="center"
      justifyContent="center"
      fullHeight
      paddingX={1}
    >
      <Typography
        variant="body2"
        align="center"
        sx={{
          color: 'text.secondary',
          lineHeight: 1.4,
        }}
      >
        {children}
      </Typography>
    </Stack>
  )
}
