// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import process from 'node:process'

const filesResult = spawnSync(
  'git',
  ['ls-files', '--cached', '--others', '--exclude-standard'],
  { encoding: 'utf8' },
)

if (filesResult.status !== 0) {
  throw new Error(filesResult.stderr || 'Unable to enumerate repository files')
}

const forbidden = [
  /@foxglove\/(?:comlink-transfer-handlers|den|eslint-plugin-studio|hooks|log|mcap-support|message-path|studio-base|studio-web|studio|theme)(?:[/'"\s:]|$)/,
  /Foxglove Studio/i,
  /Foxglove Technologies/i,
  /(?:docs|console|studio)?\.?foxglove\.dev/i,
  /github\.com\/(?:orgs\/)?foxglove\/studio/i,
  /foxglove(?:PanelTitle|ConfigVersion|StudioReportErrorFn)/,
  /FOXGLOVE_STUDIO_/,
  /foxglove(?:-recents|:session-storage-change|:\/\/open)/,
  /(?:studio|foxglove)\.app-configuration\./,
  /(?:studio|foxglove)\.layout/,
  /(?:fox\.|foxglove\.)studio-logs-settings/,
  /x-foxglove-converted-tiff/,
  /mosaic-foxglove-theme/,
  /\/foxglove\/default-layout\.json/,
]

const allowed = [
  /@(?:types\/)?foxglove(?:\/|__|_)/i,
  /Foxglove WebSocket/i,
  /FoxgloveWebSocket/,
  /FoxgloveClient/,
  /foxglove_bridge/i,
  /foxglove(?:_msgs|\.|::|__)/i,
  /foxglove-websocket/i,
  /(?:Foxglove|foxglove)[A-Z][A-Za-z]*/,
  /FOXGLOVE_[A-Z_]+/,
  /(?:from|import\() ['"].*\/foxglove['"]/,
  /foxglove (?:message )?(?:schema|datatype|docs)/i,
  /assets\.foxglove\.dev\/NuScenes/i,
  /github\.com\/foxglove\/(?:mcap|schemas)/i,
  /foxglove\/action-bump-version/i,
]

const legacyBrandMisspelling = /CatRobitcs|catrobitcs|CATROBITCS|CatRobtics|catrobtics|CATROBTICS/

const failures: string[] = []
const schemaCompatibilityPaths = [
  'packages/mcap-support/',
  'packages/studio-base/src/panels/Log/',
  'packages/studio-base/src/panels/RawMessages/',
  'packages/studio-base/src/panels/ThreeDeeRender/',
  'packages/studio-base/src/types/FoxgloveMessages.ts',
  'packages/studio-base/src/util/basicDatatypes.ts',
  'packages/studio-base/src/util/enums',
]

for (const file of filesResult.stdout.split('\n').filter(Boolean)) {
  if (
    file === 'LICENSE'
    || file === 'NOTICE'
    || file === 'pnpm-lock.yaml'
    || file === 'ci/lint-branding.mts'
  ) {
    continue
  }

  let contents: string
  try {
    contents = readFileSync(file, 'utf8')
  }
  catch {
    continue
  }
  if (contents.includes('\0')) {
    continue
  }

  for (const [index, line] of contents.split('\n').entries()) {
    if (legacyBrandMisspelling.test(line)) {
      failures.push(`${file}:${index + 1}: ${line.trim()}`)
      continue
    }
    if (!/foxglove/i.test(line)) {
      continue
    }
    if (/assets\.foxglove\.dev\/NuScenes/i.test(line)) {
      continue
    }
    if (forbidden.some(pattern => pattern.test(line))) {
      failures.push(`${file}:${index + 1}: ${line.trim()}`)
      continue
    }
    if (schemaCompatibilityPaths.some(prefix => file.startsWith(prefix))) {
      continue
    }
    if (!allowed.some(pattern => pattern.test(line))) {
      failures.push(`${file}:${index + 1}: ${line.trim()}`)
    }
  }
}

if (failures.length > 0) {
  process.stderr.write(`Unexpected branding remains:\n${failures.join('\n')}\n`)
  process.exitCode = 1
}
