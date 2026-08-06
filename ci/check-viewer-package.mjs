// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { execFileSync } from 'node:child_process'
import {
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const packageDirectory = fileURLToPath(new URL('../packages/viewer/', import.meta.url))
const distDirectory = join(packageDirectory, 'dist')
const cacheDirectory = mkdtempSync(join(tmpdir(), 'catrobtics-viewer-npm-cache-'))

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? listFiles(path) : [path]
  })
}

let output
try {
  output = execFileSync(
    'npm',
    ['pack', '--dry-run', '--json', '--ignore-scripts'],
    {
      cwd: packageDirectory,
      encoding: 'utf8',
      env: { ...process.env, npm_config_cache: cacheDirectory },
    },
  )
}
finally {
  rmSync(cacheDirectory, { force: true, recursive: true })
}

const packResults = JSON.parse(output)
assert.equal(packResults.length, 1, 'npm pack must produce exactly one package manifest')

const [packResult] = packResults
assert.equal(packResult.name, '@catrobtics/viewer')

const files = packResult.files.map(file => file.path).sort()
const requiredFiles = [
  'LICENSE',
  'NOTICE',
  'README.md',
  'dist/index.d.ts',
  'dist/index.js',
  'dist/style.css',
  'dist/types.d.ts',
  'package.json',
]

for (const requiredFile of requiredFiles) {
  assert.ok(files.includes(requiredFile), `Package is missing ${requiredFile}`)
}

const allowedFile = /^(?:LICENSE|NOTICE|README\.md|package\.json|dist\/.+)$/u
const unexpectedFiles = files.filter(file => !allowedFile.test(file))
assert.deepEqual(
  unexpectedFiles,
  [],
  `Package contains unexpected files: ${unexpectedFiles.join(', ')}`,
)

const forbiddenPath = /(?:^|\/)(?:node_modules|src|types-src|test|tests|__tests__|coverage|\.cache)(?:\/|$)/u
const privateFiles = files.filter(file => forbiddenPath.test(file))
assert.deepEqual(privateFiles, [], `Package contains private files: ${privateFiles.join(', ')}`)

const lfsPointer = Buffer.from('version https://git-lfs.github.com/spec/v1')
const encodedLfsPointer = Buffer.from('dmVyc2lvbiBodHRwczovL2dpdC1sZnMuZ2l0aHViLmNvbS9zcGVjL3Yx')
for (const path of listFiles(distDirectory)) {
  const contents = readFileSync(path)
  const displayPath = relative(packageDirectory, path)
  assert.ok(contents.length > 0, `${displayPath} is empty`)
  assert.equal(
    contents.includes(lfsPointer) || contents.includes(encodedLfsPointer),
    false,
    `${displayPath} contains an unresolved Git LFS pointer; run git lfs pull before building`,
  )
}

for (const declaration of ['dist/index.d.ts', 'dist/types.d.ts']) {
  const contents = readFileSync(join(packageDirectory, declaration), 'utf8')
  assert.equal(
    contents.includes('@catrobotics/'),
    false,
    `${declaration} exposes a private monorepo package`,
  )
}

const browserIncompatibleReactRequire
  = /(?:__require|require)\(["']react(?:\/(?:jsx-dev-runtime|jsx-runtime))?["']\)/u
for (const path of listFiles(distDirectory).filter(path => path.endsWith('.js'))) {
  const contents = readFileSync(path, 'utf8')
  assert.equal(
    browserIncompatibleReactRequire.test(contents),
    false,
    `${relative(packageDirectory, path)} contains a browser-incompatible React require`,
  )
}

assert.ok(statSync(join(packageDirectory, 'dist/index.js')).size > 100_000, 'Runtime bundle is incomplete')
assert.ok(
  files.some(file => /\.worker-[^/]+\.js$/u.test(file)),
  'Package is missing Web Worker assets',
)

console.log(
  `Verified @catrobtics/viewer package contents (${files.length} files, ${packResult.size} packed bytes).`,
)
