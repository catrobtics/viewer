// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { TypographyStyle, TypographyVariantsOptions } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface TypographyVariants {
    fontMonospace: string
    fontSansSerif: string
    fontFeatureSettings: string
  }
  interface TypographyVariantsOptions {
    fontMonospace: string
    fontSansSerif: string
    fontFeatureSettings: string
  }
}

// Keep the bundled fonts as the preferred face, but do not let a missing or
// unavailable font asset make the entire application fall back to the browser's
// default serif font. This also makes development builds usable before Git LFS
// assets have been materialized.
export const fontSansSerif = '\'Inter\', Arial, sans-serif'
export const fontMonospace = '\'IBM Plex Mono\', \'SFMono-Regular\', Consolas, monospace'

export const fontFeatureSettings = [
  '\'tnum\'', // enable tabular-numerals
  '\'calt\' 0', // disable contextual-alternates
].join(',')

const headingFontStyles: TypographyStyle = {
  fontFeatureSettings,
  letterSpacing: '-0.025em',
  fontWeight: 800,
}

const subtitleFontStyles: TypographyStyle = {
  fontFeatureSettings,
  fontWeight: 500,
}

export const typography: TypographyVariantsOptions = {
  fontMonospace,
  fontSansSerif,
  fontFamily: fontSansSerif,
  fontSize: 12,
  fontFeatureSettings,
  body1: { fontFeatureSettings },
  body2: { fontFeatureSettings },
  button: {
    fontFeatureSettings,
    textTransform: 'none',
    fontWeight: 700,
    letterSpacing: '-0.0125em',
  },
  overline: {
    fontFeatureSettings,
    letterSpacing: '0.05em',
    lineHeight: '1.5',
  },
  h1: { ...headingFontStyles, fontSize: '2rem' },
  h2: { ...headingFontStyles, fontSize: '1.8rem' },
  h3: { ...headingFontStyles, fontSize: '1.6rem' },
  h4: { ...headingFontStyles, fontSize: '1.2rem' },
  h5: { ...headingFontStyles, fontSize: '1.1rem' },
  h6: { ...headingFontStyles, fontSize: '1rem' },
  subtitle1: { ...subtitleFontStyles },
  subtitle2: { ...subtitleFontStyles },
}
