// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { UserConfig } from 'vite'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, mergeConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

const repositoryRoot = import.meta.dirname
const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as { version: string }
const crossOriginIsolationHeaders = {
  'Cross-Origin-Embedder-Policy': 'credentialless',
  'Cross-Origin-Opener-Policy': 'same-origin',
}
export function studioViteConfig(
  version: string,
): UserConfig {
  return {
    base: './',
    plugins: [
      react(),
      svgr({ include: '**/*.svg?react' }),
    ],
    define: {
      CATROBOTICS_VERSION: JSON.stringify(version),
    },
    build: {
      assetsInlineLimit: 8 * 1024,
      sourcemap: 'hidden',
      target: ['chrome120', 'edge120'],
      rolldownOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('/node_modules/three/')) {
              return 'three'
            }
            if (id.includes('/node_modules/monaco-editor/')) {
              return 'editor'
            }
            if (id.includes('/node_modules/chart.js/')) {
              return 'charts'
            }
            if (
              id.includes('/node_modules/@mcap/')
              || id.includes('/node_modules/@hpcc-js/wasm-zstd/')
              || id.includes('/node_modules/lz4-lite/')
              || id.includes('/node_modules/seek-bzip/')
            ) {
              return 'data-codecs'
            }
            return undefined
          },
        },
      },
    },
    worker: { format: 'es' },
  }
}

export default defineConfig(({ mode }) => {
  const benchmark = mode === 'benchmark'
  const root = path.resolve(repositoryRoot, benchmark ? 'benchmark' : 'web')

  return mergeConfig(studioViteConfig(benchmark ? '0.0.0-benchmark' : packageJson.version), {
    root,
    publicDir: benchmark ? false : path.resolve(repositoryRoot, 'packages/studio-web/public'),
    build: {
      emptyOutDir: true,
      outDir: 'dist',
    },
    server: {
      headers: crossOriginIsolationHeaders,
    },
    preview: {
      headers: crossOriginIsolationHeaders,
    },
  })
})
