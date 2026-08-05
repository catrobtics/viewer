// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type {
  DetailsType,
  NotificationMessage,
  NotificationSeverity,
  NotificationType,
} from '@catrobotics/studio-base/util/sendNotification'
import type { VariantType } from 'notistack'
import NotificationModal from '@catrobotics/studio-base/components/NotificationModal'
import {
  setNotificationHandler,
  unsetNotificationHandler,
} from '@catrobotics/studio-base/util/sendNotification'

import { Link } from '@mui/material'
import { useSnackbar } from 'notistack'
import { useLayoutEffect, useState } from 'react'

function severityToToastAppearance(severity: NotificationSeverity): VariantType {
  switch (severity) {
    case 'error':
      return 'error'
    case 'warn':
      return 'warning'
    case 'info':
      return 'default'
    default:
      return 'default'
  }
}

export default function SendNotificationToastAdapter(): React.JSX.Element {
  const { enqueueSnackbar } = useSnackbar()
  const [notificationDetails, setNotificationDetails] = useState<NotificationMessage | undefined>(
    undefined,
  )

  useLayoutEffect(() => {
    setNotificationHandler(
      (
        message: string,
        details: DetailsType,
        _type: NotificationType,
        severity: NotificationSeverity,
      ): void => {
        enqueueSnackbar(
          <div>
            {message}
            {' '}
            <Link
              onClick={() => {
                setNotificationDetails({ message, details, severity })
              }}
              variant="inherit"
              color="inherit"
              underline="hover"
              sx={{
                fontStyle: 'italic',
              }}
            >
              (see details)
            </Link>
          </div>,
          {
            variant: severityToToastAppearance(severity),
            persist: severity === 'error',
          },
        )
      },
    )

    return () => {
      unsetNotificationHandler()
    }
  }, [enqueueSnackbar])

  if (notificationDetails == undefined) {
    return <></>
  }

  return (
    <NotificationModal
      notification={notificationDetails}
      onRequestClose={() => {
        setNotificationDetails(undefined)
      }}
    />
  )
}
