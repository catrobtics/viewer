// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { CATROBOTICS_PINK, defaultBranding } from '@catrobotics/studio-base/context/BrandingContext'
import { createMuiTheme } from '@catrobotics/theme'

describe('createMuiTheme', () => {
  it('uses Bilibili pink for the default CatRobotics branding', () => {
    const theme = createMuiTheme('dark', defaultBranding.theme)

    expect(theme.palette.primary.main).toBe(CATROBOTICS_PINK)
    expect(theme.palette.appBar.main).toBe('#35363A')
    expect(theme.palette.appBar.primary).toBe(CATROBOTICS_PINK)
    expect(theme.palette.appBar.text).toBe('#FFFFFF')
  })

  it('applies configurable product tokens without replacing theme defaults', () => {
    const theme = createMuiTheme('dark', {
      dark: {
        accent: '#00aaff',
        appBarBackground: '#101820',
        background: '#080c10',
        borderRadius: 8,
        fontFamily: 'Example Sans, sans-serif',
        surface: '#182028',
      },
    })

    expect(theme.palette.primary.main).toBe('#00aaff')
    expect(theme.palette.appBar.primary).toBe('#00aaff')
    expect(theme.palette.appBar.main).toBe('#101820')
    expect(theme.palette.background.default).toBe('#080c10')
    expect(theme.palette.background.paper).toBe('#182028')
    expect(theme.shape.borderRadius).toBe(8)
    expect(theme.typography.fontFamily).toBe('Example Sans, sans-serif')
    expect(theme.palette.error.main).toBeDefined()
  })

  it('supports advanced MUI overrides per color mode', () => {
    const theme = createMuiTheme('light', {
      muiThemeOptions: {
        light: {
          spacing: 6,
        },
      },
    })

    expect(theme.spacing(1)).toBe('6px')
  })
})
