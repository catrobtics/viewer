// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { Theme, ThemeOptions } from '@mui/material/styles'
import type { ThemeConfig, ThemePreference, ThemeTokens } from './types'

import { createTheme } from '@mui/material/styles'
import { deepmerge } from '@mui/utils'
import * as components from './components'
import * as palette from './palette'
import { typography } from './typography'

declare module '@mui/material/styles' {
  interface Theme {
    name?: ThemePreference
  }
  interface ThemeOptions {
    name?: ThemePreference
  }
}

function tokenOverrides(tokens: ThemeTokens | undefined): ThemeOptions {
  if (tokens == undefined) {
    return {}
  }

  const options = {
    palette: {
      ...(tokens.accent != undefined && { primary: { main: tokens.accent } }),
      ...(tokens.appBarBackground != undefined
        || tokens.appBarAccent != undefined
        || tokens.appBarForeground != undefined
        ? {
            appBar: {
              ...(tokens.appBarBackground != undefined && { main: tokens.appBarBackground }),
              ...(tokens.appBarAccent != undefined || tokens.accent != undefined
                ? { primary: tokens.appBarAccent ?? tokens.accent }
                : {}),
              ...(tokens.appBarForeground != undefined && { text: tokens.appBarForeground }),
            },
          }
        : {}),
      ...(tokens.background != undefined || tokens.surface != undefined
        ? {
            background: {
              ...(tokens.background != undefined && { default: tokens.background }),
              ...(tokens.surface != undefined && { paper: tokens.surface, menu: tokens.surface }),
            },
          }
        : {}),
      ...(tokens.textPrimary != undefined || tokens.textSecondary != undefined
        ? {
            text: {
              ...(tokens.textPrimary != undefined && { primary: tokens.textPrimary }),
              ...(tokens.textSecondary != undefined && { secondary: tokens.textSecondary }),
            },
          }
        : {}),
      ...(tokens.divider != undefined && { divider: tokens.divider }),
    },
    ...(tokens.borderRadius != undefined && { shape: { borderRadius: tokens.borderRadius } }),
    ...(tokens.fontFamily != undefined && { typography: { fontFamily: tokens.fontFamily } }),
  }

  return options as ThemeOptions
}

export function createMuiTheme(
  themePreference: ThemePreference,
  config?: ThemeConfig,
): Theme {
  const baseOptions: ThemeOptions = {
    name: themePreference,
    palette: palette[themePreference],
    shape: { borderRadius: 2 },
    typography,
    components,
  }

  const options = deepmerge(
    deepmerge(baseOptions, tokenOverrides(config?.[themePreference])),
    config?.muiThemeOptions?.[themePreference] ?? {},
  )

  return createTheme(options)
}
