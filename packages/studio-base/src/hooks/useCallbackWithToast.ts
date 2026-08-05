// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import Logger from '@catrobotics/log'
import { useSnackbar } from 'notistack'

import { useCallback } from 'react'

const log = Logger.getLogger(import.meta.url)

/**
 * A version of React.useCallback() displaying any errors thrown from the function as toast notifications.
 */
export default function useCallbackWithToast<Args extends unknown[]>(
  callback: (...args: Args) => Promise<void> | void,
  deps: unknown[],
): (...args: Args) => Promise<void> {
  const { enqueueSnackbar } = useSnackbar()
  return useCallback(
    async (...args: Args) => {
      try {
        await callback(...args)
      }
      catch (error) {
        log.error(error)
        enqueueSnackbar((error as Error).toString(), { variant: 'error' })
      }
    },
    [enqueueSnackbar, ...deps],
  )
}
