// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { defaultBranding, useBranding } from '@catrobotics/studio-base/context/BrandingContext'
import isDesktopApp from '@catrobotics/studio-base/util/isDesktopApp'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link,
} from '@mui/material'

import { useTranslation } from 'react-i18next'

interface Props {
  isDesktop?: boolean
  onClose: () => void
}

export function IncompatibleLayoutVersionAlert(props: Props): React.JSX.Element {
  const { isDesktop, onClose } = props
  const { t } = useTranslation('incompatibleLayoutVersion')
  const { productName = defaultBranding.productName } = useBranding()

  const showDesktopText = isDesktop ?? isDesktopApp()

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>{t('title')}</DialogTitle>
      <DialogContent>
        {showDesktopText && (
          <DialogContentText>
            {t('desktopText', { productName })}
            <Link target="_blank" href="https://catrotics.com">
              https://catrotics.com
            </Link>
            .
          </DialogContentText>
        )}
        {!showDesktopText && (
          <DialogContentText>{t('webText', { productName })}</DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  )
}
