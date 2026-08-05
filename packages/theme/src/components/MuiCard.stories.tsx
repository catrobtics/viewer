// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { Meta, StoryObj } from '@storybook/react-vite'
import { MoreVertical24Filled } from '@fluentui/react-icons'
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Typography,
} from '@mui/material'

export default {
  title: 'Theme/Data Display/Card',
} as Meta

export const BasicCard: StoryObj = {
  render: () => (
    <Card style={{ minWidth: 275, margin: 16 }}>
      <CardHeader
        avatar={(
          <Avatar>
            <b>B</b>
          </Avatar>
        )}
        action={(
          <IconButton>
            <MoreVertical24Filled />
          </IconButton>
        )}
        title="Word of the day"
        subheader={<>be &bull; nev &bull; o &bull; lent</>}
        slotProps={{
          title: {
            variant: 'body2',
            color: 'text.secondary',
          },

          subheader: {
            variant: 'h5',
          },
        }}
      />
      <Divider />
      <CardContent>
        <Typography
          gutterBottom
          sx={{
            color: 'text.secondary',
          }}
        >
          adjective
        </Typography>
        <Typography variant="body2">
          well meaning and kindly.
          <br />
          &ldquo;a benevolent smile&rdquo;
        </Typography>
      </CardContent>
      <Divider />
      <CardActions>
        <Button size="small">Learn More</Button>
      </CardActions>
    </Card>
  ),
}
