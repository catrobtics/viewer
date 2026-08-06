// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import type { Plugin, UserConfig } from 'vite'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as { version: string }

function isReactImport(id: string): boolean {
  return id === 'react-dom'
    || id.startsWith('react-dom/')
}

const reactPeerModules = new Set([
  'react',
  'react/jsx-dev-runtime',
  'react/jsx-runtime',
])
const reactPeerPrefix = '\0catrobtics-react-peer:'

/**
 * Route every React import, including CommonJS `require("react")` calls in
 * bundled dependencies, through an ESM bridge. Rolldown otherwise preserves
 * those CommonJS peer requires in the library output, which fail in browsers
 * when a consumer bundles the package. The bridge itself keeps React external
 * so the host application still supplies the single React instance.
 */
function reactPeerBridge(): Plugin {
  return {
    name: 'catrobtics-react-peer-bridge',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!reactPeerModules.has(source)) {
        return undefined
      }
      if (importer?.startsWith(reactPeerPrefix) === true) {
        return { id: source, external: true }
      }
      return `${reactPeerPrefix}${source}`
    },
    load(id) {
      if (!id.startsWith(reactPeerPrefix)) {
        return undefined
      }
      const peerId = id.slice(reactPeerPrefix.length)
      return peerId === 'react'
        ? 'export * from "react"; export { default } from "react";'
        : `export * from "${peerId}";`
    },
  }
}

export default defineConfig({
  plugins: [reactPeerBridge(), react(), svgr({ include: '**/*.svg?react' })],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  define: {
    CATROBOTICS_VERSION: JSON.stringify(packageJson.version),
  },
  build: {
    assetsInlineLimit: 8 * 1024,
    copyPublicDir: false,
    cssCodeSplit: false,
    emptyOutDir: true,
    lib: {
      entry: path.resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
      cssFileName: 'style',
    },
    outDir: 'dist',
    sourcemap: false,
    target: ['chrome120', 'edge120'],
    rolldownOptions: {
      external: isReactImport,
      output: {
        assetFileNames(assetInfo) {
          return assetInfo.name?.endsWith('.css') === true
            ? 'style.css'
            : 'assets/[name]-[hash][extname]'
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
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
} satisfies UserConfig)
