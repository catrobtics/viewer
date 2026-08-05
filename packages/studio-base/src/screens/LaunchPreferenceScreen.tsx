// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { ReactElement } from 'react'
import { useSessionStorageValue } from '@catrobotics/hooks'
import { AppSetting } from '@catrobotics/studio-base/AppSetting'

import Stack from '@catrobotics/studio-base/components/Stack'
import { defaultBranding, useBranding } from '@catrobotics/studio-base/context/BrandingContext'
import { useAppConfigurationValue } from '@catrobotics/studio-base/hooks'
import { LaunchPreferenceValue } from '@catrobotics/studio-base/types/LaunchPreferenceValue'
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles({ name: 'LaunchPreferenceScreen' })(theme => ({
  button: {
    textAlign: 'left',
    justifyContent: 'flex-start',
    padding: theme.spacing(2),
    gap: theme.spacing(1.5),
    borderColor: theme.palette.divider,
    height: '100%',
  },
  paper: {
    maxWidth: 480,
  },
  dialogTitle: {
    textAlign: 'center',
    fontSize: theme.typography.h2.fontSize,
    paddingBlock: theme.spacing(3),
  },
}))

export function LaunchPreferenceScreen(): ReactElement {
  const { classes } = useStyles()
  const { productName = defaultBranding.productName } = useBranding()
  const [globalPreference, setGlobalPreference] = useAppConfigurationValue<string | undefined>(
    AppSetting.LAUNCH_PREFERENCE,
  )
  const [, setSessionPreference] = useSessionStorageValue(AppSetting.LAUNCH_PREFERENCE)
  const [rememberPreference, setRememberPreference] = useState(globalPreference != undefined)

  async function launchInWeb() {
    setSessionPreference(LaunchPreferenceValue.WEB) // always set session preference to allow overriding the URL param
    await setGlobalPreference(rememberPreference ? LaunchPreferenceValue.WEB : undefined)
  }

  async function launchInDesktop() {
    setSessionPreference(LaunchPreferenceValue.DESKTOP) // always set session preference to allow overriding the URL param
    await setGlobalPreference(rememberPreference ? LaunchPreferenceValue.DESKTOP : undefined)
  }

  function toggleRememberPreference() {
    setRememberPreference(!rememberPreference)
  }

  const actions = [
    {
      key: LaunchPreferenceValue.WEB,
      primary: 'Web',
      secondary: 'Requires Chrome or Edge v120+',
      onClick: () => void launchInWeb(),
    },
    {
      key: LaunchPreferenceValue.DESKTOP,
      primary: 'Desktop App',
      secondary: 'For Linux, Windows, and macOS',
      onClick: () => void launchInDesktop(),
    },
  ]

  return (
    <Dialog open classes={{ paper: classes.paper }}>
      <DialogTitle className={classes.dialogTitle}>
        Launch
        {' '}
        {productName}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={1}>
          {actions.map(action => (
            <Grid key={action.key} size={{ xs: 12, sm: 6 }}>
              <Button
                className={classes.button}
                fullWidth
                color="inherit"
                variant="outlined"
                onClick={action.onClick}
              >
                <Stack flex="auto" zeroMinWidth>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: 'text.primary',
                    }}
                  >
                    {action.primary}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                    }}
                  >
                    {action.secondary}
                  </Typography>
                </Stack>
              </Button>
            </Grid>
          ))}
          <Grid size={12}>
            <FormControlLabel
              label="Remember my preference"
              control={(
                <Checkbox
                  color="primary"
                  checked={rememberPreference}
                  onChange={toggleRememberPreference}
                />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  )
}
