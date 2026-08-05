// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { StorybookConfig } from '@storybook/react-vite'
import { mergeConfig } from 'vite'

import { studioViteConfig } from '../vite.config.mjs'

const storybookConfig: StorybookConfig = {
  stories: [
    '../packages/studio-base/src/**/*.stories.tsx',
    '../packages/studio-web/src/**/*.stories.tsx',
    '../packages/theme/src/**/*.stories.tsx',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal(config) {
    return mergeConfig(config, studioViteConfig('0.0.0-storybook'))
  },
}

export default storybookConfig
