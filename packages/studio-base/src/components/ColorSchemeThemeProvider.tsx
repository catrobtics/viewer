// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { AppSetting } from '@catrobotics/studio-base/AppSetting'
import { useBranding } from '@catrobotics/studio-base/context/BrandingContext'

import { useAppConfigurationValue } from '@catrobotics/studio-base/hooks'
import ThemeProvider from '@catrobotics/studio-base/theme/ThemeProvider'
import { useMediaQuery } from '@mui/material'

export function ColorSchemeThemeProvider({ children }: React.PropsWithChildren): React.JSX.Element {
  const branding = useBranding()
  const [colorScheme = 'system'] = useAppConfigurationValue<string>(AppSetting.COLOR_SCHEME)
  const systemSetting = useMediaQuery('(prefers-color-scheme: dark)')
  const isDark = colorScheme === 'dark' || (colorScheme === 'system' && systemSetting)
  return <ThemeProvider isDark={isDark} themeConfig={branding.theme}>{children}</ThemeProvider>
}
