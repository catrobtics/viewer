// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { readdir, readFile, realpath } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

/**
 * Keep this list intentionally explicit. A new license expression should be
 * reviewed when it first enters the dependency graph rather than silently
 * becoming allowed because a scanner normalized it unexpectedly.
 */
const ALLOWED_LICENSES = new Set([
  '0BSD',
  'Apache',
  'Apache 2.0',
  'Apache-2.0',
  'BSD',
  'BSD-2-clause',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'BlueOak-1.0.0',
  'CC-BY-3.0',
  'CC-BY-4.0',
  'CC0-1.0',
  'ISC',
  'MIT',
  'MIT-0',
  'MPL-2.0',
  'OFL-1.1',
  'PSF',
  'Public Domain',
  'Python-2.0',
  'Unlicense',
  'Unlicense OR MIT',
  'WTFPL',
  'Zlib',
  '(MIT AND BSD-3-Clause)',
  '(MIT AND CC-BY-3.0)',
  '(MIT AND Zlib)',
  '(MIT OR CC0-1.0)',
])

// These packages ship an Unlicense/public-domain LICENSE file but omit the
// corresponding package.json field, so manifest-only scanners report Unknown.
const LICENSE_OVERRIDES = new Map([
  ['fast-shallow-equal@1.0.0', 'Unlicense'],
  ['react-universal-interface@0.6.2', 'Unlicense'],
])

interface PackageManifest {
  name?: unknown
  version?: unknown
  license?: unknown
  licenses?: unknown
}

interface InstalledPackage {
  name: string
  version: string
  license: string
}

function normalizeLicense(manifest: PackageManifest): string {
  if (typeof manifest.license === 'string') {
    return manifest.license
  }

  if (Array.isArray(manifest.licenses)) {
    const licenses = manifest.licenses
      .map((value) => {
        if (typeof value === 'string') {
          return value
        }
        if (typeof value === 'object' && value != undefined && 'type' in value) {
          const type = value.type
          return typeof type === 'string' ? type : undefined
        }
        return undefined
      })
      .filter((value): value is string => value != undefined)
    if (licenses.length > 0) {
      return licenses.join(' OR ')
    }
  }

  return 'Unknown'
}

async function readManifest(filePath: string): Promise<InstalledPackage | undefined> {
  try {
    const manifest = JSON.parse(await readFile(filePath, 'utf8')) as PackageManifest
    if (typeof manifest.name !== 'string' || typeof manifest.version !== 'string') {
      return
    }
    return {
      name: manifest.name,
      version: manifest.version,
      license: normalizeLicense(manifest),
    }
  }
  catch {
    return undefined
  }
}

async function findInstalledPackages(): Promise<InstalledPackage[]> {
  const repositoryRoot = path.join(import.meta.dirname, '..')
  const packages = new Map<string, InstalledPackage>()
  const visitedPackageDirectories = new Set<string>()

  async function scanNodeModules(nodeModules: string): Promise<void> {
    let entries: string[]
    try {
      entries = await readdir(nodeModules)
    }
    catch {
      return
    }

    for (const entry of entries) {
      if (entry.startsWith('.')) {
        continue
      }
      const packageDirectories = entry.startsWith('@')
        ? (await readdir(path.join(nodeModules, entry))).map(child =>
            path.join(nodeModules, entry, child))
        : [path.join(nodeModules, entry)]
      for (const unresolvedPackageDirectory of packageDirectories) {
        let packageDirectory: string
        try {
          packageDirectory = await realpath(unresolvedPackageDirectory)
        }
        catch {
          continue
        }
        if (visitedPackageDirectories.has(packageDirectory)) {
          continue
        }
        visitedPackageDirectories.add(packageDirectory)

        const manifest = await readManifest(path.join(packageDirectory, 'package.json'))
        if (manifest == undefined) {
          continue
        }
        const packageKey = `${manifest.name}@${manifest.version}`
        manifest.license = LICENSE_OVERRIDES.get(packageKey) ?? manifest.license
        packages.set(packageKey, manifest)

        // pnpm links a package's dependencies beside the package itself in its
        // virtual node_modules directory, not inside the package directory.
        const packageParent = path.dirname(packageDirectory)
        const dependencyNodeModules = path.basename(packageParent).startsWith('@')
          ? path.dirname(packageParent)
          : packageParent
        await scanNodeModules(dependencyNodeModules)
      }
    }
  }

  async function findWorkspaceNodeModules(directory: string): Promise<void> {
    let entries
    try {
      entries = await readdir(directory, { withFileTypes: true })
    }
    catch {
      return
    }
    if (entries.some(entry => entry.isFile() && entry.name === 'package.json')) {
      await scanNodeModules(path.join(directory, 'node_modules'))
    }
    for (const entry of entries) {
      if (
        !entry.isDirectory()
        || entry.name.startsWith('.')
        || entry.name === 'dist'
        || entry.name === 'node_modules'
        || entry.name === 'storybook-static'
        || entry.name === 'test-results'
      ) {
        continue
      }
      await findWorkspaceNodeModules(path.join(directory, entry.name))
    }
  }

  await findWorkspaceNodeModules(repositoryRoot)

  return [...packages.values()].sort(
    (a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version),
  )
}

async function main(): Promise<void> {
  const packages = await findInstalledPackages()
  if (packages.length === 0) {
    throw new Error('No installed dependencies found; run pnpm install before checking licenses')
  }
  const unknown = packages.filter(pkg => !ALLOWED_LICENSES.has(pkg.license))

  const counts = new Map<string, number>()
  for (const pkg of packages) {
    counts.set(pkg.license, (counts.get(pkg.license) ?? 0) + 1)
  }
  for (const [license, count] of [...counts].sort(([a], [b]) => a.localeCompare(b))) {
    console.log(`${license}: ${count}`)
  }
  console.log(`Total: ${packages.length}`)

  if (unknown.length > 0) {
    console.error('\nUnsupported or missing licenses:')
    for (const pkg of unknown) {
      console.error(`- ${pkg.name}@${pkg.version}: ${pkg.license}`)
    }
    process.exitCode = 1
  }
}

void main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
