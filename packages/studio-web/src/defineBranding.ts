// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { BrandingConfig } from '@catrobotics/studio-base'

/**
 * Provides type checking and autocomplete for a Studio branding configuration.
 *
 * @example
 * const branding = defineBranding({
 *   productName: 'Acme Studio',
 *   logo: <AcmeLogo />,
 *   appBar: { showProductName: true },
 *   theme: {
 *     dark: { accent: '#28c7fa', appBarBackground: '#0b1720' },
 *     light: { accent: '#0079a8', appBarBackground: '#102b3a' },
 *   },
 * })
 */
export function defineBranding<const Config extends BrandingConfig>(config: Config): Config {
  return config
}
