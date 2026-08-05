// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import linkTarget from './link-target.js'
import lodashRamdaImports from './lodash-ramda-imports.js'
import noMapTypeArgument from './no-map-type-argument.js'
import ramdaUsage from './ramda-usage.js'

export default {
  rules: {
    'link-target': linkTarget,
    'lodash-ramda-imports': lodashRamdaImports,
    'ramda-usage': ramdaUsage,
    'no-map-type-argument': noMapTypeArgument,
  },

  configs: {
    all: {
      plugins: ['@catrobotics/studio'],
      rules: {
        '@catrobotics/studio/link-target': 'error',
        '@catrobotics/studio/lodash-ramda-imports': 'error',
        '@catrobotics/studio/ramda-usage': 'error',
        '@catrobotics/studio/no-map-type-argument': 'error',
      },
    },
  },
}
