// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { defaultBranding, useBranding } from '@catrobotics/studio-base/context/BrandingContext'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles({ name: 'BrandMark' })(() => ({
  root: {
    'display': 'inline-flex',
    'alignItems': 'center',
    'justifyContent': 'center',
    'maxWidth': '100%',

    '& > img, & > svg': {
      display: 'block',
      width: '100%',
      height: '100%',
      objectFit: 'contain',
    },
    '& .BrandMark-logo > img, & .BrandMark-logo > svg': {
      display: 'block',
      width: '100%',
      height: '100%',
      objectFit: 'contain',
    },
  },
  generatedWordmark: {
    gap: '0.35em',
    justifyContent: 'flex-start',
    whiteSpace: 'nowrap',
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: '-0.035em',
  },
  generatedWordmarkLogo: {
    width: '1.25em',
    height: '1.25em',
    flex: '0 0 auto',
  },
  generatedWordmarkText: {
    display: 'block',
  },
}))

export function BrandMark({
  className,
  variant = 'logo',
}: {
  className?: string
  variant?: 'appBar' | 'logo' | 'wordmark'
}): React.JSX.Element {
  const branding = useBranding()
  const { classes, cx } = useStyles()
  const customNode = variant === 'appBar'
    ? branding.appBar?.logo
    : variant === 'logo'
      ? branding.logo
      : branding.wordmark
  const alt = branding.logoAlt ?? branding.productName ?? defaultBranding.logoAlt
  const productName = branding.productName ?? defaultBranding.productName
  const logo = branding.logo
    ?? defaultBranding.logo
    ?? <span>{productName.slice(0, 1)}</span>

  let content: React.ReactNode
  if (
    variant === 'wordmark'
    && customNode == undefined
  ) {
    content = (
      <>
        <span className={cx('BrandMark-logo', classes.generatedWordmarkLogo)}>
          {logo}
        </span>
        <span className={classes.generatedWordmarkText}>{productName}</span>
      </>
    )
  }
  else if (customNode != undefined) {
    content = customNode
  }
  else {
    content = logo
  }

  return (
    <span
      role="img"
      aria-label={alt}
      className={cx(
        classes.root,
        variant === 'wordmark' && classes.generatedWordmark,
        className,
      )}
    >
      {content}
    </span>
  )
}
