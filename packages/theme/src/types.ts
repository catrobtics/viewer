// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { Components, Theme, ThemeOptions } from '@mui/material'

import type {} from '@mui/x-data-grid/themeAugmentation'

export type OverrideComponentReturn<T extends keyof Components> = Components<Theme>[T]

export type Language = 'en' | 'zh' | 'ja'

export type ThemePreference = 'dark' | 'light'

/** Common product-level design tokens. Advanced MUI overrides remain available per color mode. */
export interface ThemeTokens {
  accent?: string
  appBarAccent?: string
  appBarBackground?: string
  appBarForeground?: string
  background?: string
  borderRadius?: number
  divider?: string
  fontFamily?: string
  surface?: string
  textPrimary?: string
  textSecondary?: string
}

export interface ThemeConfig {
  dark?: ThemeTokens
  light?: ThemeTokens
  muiThemeOptions?: Partial<Record<ThemePreference, ThemeOptions>>
}
