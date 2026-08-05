// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { createRequire } from 'node:module'
import path from 'node:path'
import { defineConfig, mergeConfig } from 'vitest/config'

import { studioViteConfig } from './vite.config.mjs'

const repositoryRoot = import.meta.dirname
const studioRequire = createRequire(
  path.resolve(repositoryRoot, 'packages/studio-base/package.json'),
)
const vitestCanvasMock = path.resolve(
  path.dirname(studioRequire.resolve('vitest-canvas-mock/package.json')),
  'dist/index.js',
)

const studioJsdomTests = [
  'packages/studio-base/src/PanelAPI/useBlocksSubscriptions.test.tsx',
  'packages/studio-base/src/PanelAPI/useDataSourceInfo.test.tsx',
  'packages/studio-base/src/PanelAPI/useMessageReducer.test.tsx',
  'packages/studio-base/src/PanelAPI/useMessagesByTopic.test.tsx',
  'packages/studio-base/src/components/AppBar/index.test.tsx',
  'packages/studio-base/src/components/AutoSizer.test.tsx',
  'packages/studio-base/src/components/DocumentDropListener.test.tsx',
  'packages/studio-base/src/components/MessagePathSyntax/MessagePathInput.test.ts',
  'packages/studio-base/src/components/MessagePathSyntax/useCachedGetMessagePathDataItems.test.tsx',
  'packages/studio-base/src/components/MessagePathSyntax/useMessageDataItem.test.tsx',
  'packages/studio-base/src/components/MessagePathSyntax/useMessagesByPath.test.tsx',
  'packages/studio-base/src/components/MessagePipeline/index.test.tsx',
  'packages/studio-base/src/components/Panel.test.tsx',
  'packages/studio-base/src/components/PanelExtensionAdapter/PanelExtensionAdapter.test.tsx',
  'packages/studio-base/src/components/PanelLayout.test.tsx',
  'packages/studio-base/src/components/RemountOnValueChange.test.tsx',
  'packages/studio-base/src/components/SettingsTreeEditor/inputs/ColorPickerControl.test.ts',
  'packages/studio-base/src/components/TopicList/useTopicListSearch.test.ts',
  'packages/studio-base/src/context/CurrentLayoutContext/useCurrentLayoutSelector.test.tsx',
  'packages/studio-base/src/hooks/useAppConfigurationValue.test.tsx',
  'packages/studio-base/src/hooks/useIndexedDbRecents.test.ts',
  'packages/studio-base/src/hooks/useShouldNotChangeOften.test.ts',
  'packages/studio-base/src/hooks/useStateToURLSynchronization.test.tsx',
  'packages/studio-base/src/hooks/useTopicPublishFrequences.test.tsx',
  'packages/studio-base/src/panels/ThreeDeeRender/Renderer.test.ts',
  'packages/studio-base/src/panels/diagnostics/useDiagnostics.test.ts',
  'packages/studio-base/src/players/IterablePlayer/IterablePlayer.test.ts',
  'packages/studio-base/src/providers/CurrentLayoutProvider/index.test.tsx',
  'packages/studio-base/src/util/Rpc.test.ts',
  'packages/studio-base/src/util/RpcUtils.test.ts',
  'packages/studio-base/src/util/formatKeyboardShortcut.test.ts',
  'packages/studio-base/src/util/layout.test.ts',
  'packages/studio-web/src/services/LocalStorageAppConfiguration.test.ts',
]

const common = {
  test: {
    globals: true,
    restoreMocks: true,
    passWithNoTests: false,
    setupFiles: [path.resolve(repositoryRoot, 'vitest.setup.ts')],
  },
}

export default defineConfig({
  test: {
    projects: [
      mergeConfig(studioViteConfig('TEST'), {
        ...common,
        test: {
          ...common.test,
          name: 'node',
          environment: 'node',
          include: [
            'ci/**/*.test.{ts,tsx}',
            'packages/den/**/*.test.{ts,tsx}',
            'packages/eslint-plugin-studio/**/*.test.{ts,tsx}',
            'packages/mcap-support/**/*.test.{ts,tsx}',
            'packages/message-path/**/*.test.{ts,tsx}',
            'benchmark/**/*.test.{ts,tsx}',
          ],
          exclude: ['**/node_modules/**', 'packages/den/urdf/parser.test.ts'],
        },
      }),
      mergeConfig(studioViteConfig('TEST'), {
        ...common,
        test: {
          ...common.test,
          name: 'hooks',
          environment: 'jsdom',
          include: ['packages/hooks/**/*.test.{ts,tsx}'],
          exclude: ['**/node_modules/**'],
          setupFiles: [path.resolve(repositoryRoot, 'vitest.setup.ts')],
        },
      }),
      mergeConfig(studioViteConfig('TEST'), {
        ...common,
        test: {
          ...common.test,
          name: 'studio-base',
          environment: 'node',
          include: ['packages/studio-base/src/**/*.test.{ts,tsx}'],
          exclude: ['**/node_modules/**', ...studioJsdomTests],
          setupFiles: [
            path.resolve(repositoryRoot, 'vitest.setup.ts'),
            path.resolve(
              repositoryRoot,
              'packages/studio-base/src/test/setup.ts',
            ),
            path.resolve(
              repositoryRoot,
              'packages/studio-base/src/test/setupTestFramework.ts',
            ),
          ],
        },
      }),
      mergeConfig(studioViteConfig('TEST'), {
        ...common,
        test: {
          ...common.test,
          name: 'studio-base-jsdom',
          environment: 'jsdom',
          environmentOptions: { jsdom: { url: 'http://localhost/' } },
          include: studioJsdomTests,
          exclude: ['**/node_modules/**'],
          setupFiles: [
            path.resolve(repositoryRoot, 'vitest.setup.ts'),
            vitestCanvasMock,
            studioRequire.resolve('fake-indexeddb/auto'),
            path.resolve(
              repositoryRoot,
              'packages/studio-base/src/test/setup.ts',
            ),
            path.resolve(
              repositoryRoot,
              'packages/studio-base/src/test/setupTestFramework.ts',
            ),
          ],
        },
      }),
      mergeConfig(studioViteConfig('TEST'), {
        ...common,
        test: {
          ...common.test,
          name: 'den-jsdom',
          environment: 'jsdom',
          include: ['packages/den/urdf/parser.test.ts'],
          exclude: ['**/node_modules/**'],
        },
      }),
    ],
  },
})
