// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

// This script will update "version" in package.json to something like "0.3.0-nightly.20210403.7b01783"
// Any existing version string extras like "-dev" are removed.

import assert from 'node:assert'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import { execOutput } from './exec'

const currentDir = import.meta.dirname
const PACKAGE_JSON_PATH = path.join(currentDir, '..', 'package.json')

async function main(): Promise<void> {
  // Parse package.json
  const pkg = JSON.parse(await fs.readFile(PACKAGE_JSON_PATH, 'utf8'))

  // Generate new package version
  const ver = (pkg.version as string).replace(/-.*$/, '')
  const sha = (
    await execOutput('git', ['rev-parse', '--short', 'HEAD'])
  ).stdout.trim()
  const date = new Date().toISOString().replace(/T.*$/, '').replace(/-/g, '')

  assert.ok(ver, 'Missing package.json version')
  assert.ok(sha, 'Missing git HEAD shortref')

  pkg.version = `${ver}-nightly.${date}.${sha}`

  // Write package.json
  await fs.writeFile(
    PACKAGE_JSON_PATH,
    `${JSON.stringify(pkg, undefined, 2)}\n`,
    'utf8',
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
