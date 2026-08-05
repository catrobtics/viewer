/** @vitest-environment jsdom */
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { beforeEach, describe, expect, it } from 'vitest'

import LocalStorageAppConfiguration from './LocalStorageAppConfiguration'

describe('local storage app configuration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('ignores legacy keys and reads CatRobotics keys', () => {
    localStorage.setItem('studio.app-configuration.colorScheme', '"dark"')
    const configuration = new LocalStorageAppConfiguration({})

    expect(configuration.get('colorScheme')).toBeUndefined()

    localStorage.setItem('catrobotics.app-configuration.colorScheme', '"light"')
    expect(configuration.get('colorScheme')).toBe('light')
  })

  it('writes and removes CatRobotics keys without touching legacy keys', async () => {
    localStorage.setItem('studio.app-configuration.colorScheme', '"dark"')
    const configuration = new LocalStorageAppConfiguration({})

    await configuration.set('colorScheme', 'light')
    expect(localStorage.getItem('catrobotics.app-configuration.colorScheme')).toBe('"light"')
    expect(localStorage.getItem('studio.app-configuration.colorScheme')).toBe('"dark"')

    await configuration.set('colorScheme', undefined)
    expect(localStorage.getItem('catrobotics.app-configuration.colorScheme')).toBeNull()
    expect(localStorage.getItem('studio.app-configuration.colorScheme')).toBe('"dark"')
  })
})
