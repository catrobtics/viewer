// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { OverrideComponentReturn } from '../types'

import { alpha, filledInputClasses } from '@mui/material'

export const MuiFilledInput: OverrideComponentReturn<'MuiFilledInput'> = {
  defaultProps: {
    disableUnderline: true,
  },
  styleOverrides: {
    input: ({ theme }) => ({
      padding: theme.spacing(1, 1.125),
    }),
    root: ({ theme }) => ({
      'borderRadius': theme.shape.borderRadius,

      [`&.${filledInputClasses.sizeSmall} .${filledInputClasses.input}`]: {
        padding: theme.spacing(0.75, 1),
      },

      '&.Mui-focused': {
        backgroundColor: theme.palette.action.focus,

        [`&.${filledInputClasses.error}`]: {
          backgroundColor: alpha(theme.palette.error.main, theme.palette.action.focusOpacity),
        },
      },
      '&.Mui-disabled': {
        opacity: 0.5,
      },
      '&.Mui-error': {
        backgroundColor: alpha(theme.palette.error.main, theme.palette.action.hoverOpacity),
      },
    }),
  },
}
