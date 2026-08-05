// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type {
  ExtensionPanelRegistration,
  Immutable,
  RegisterMessageConverterArgs,
} from '@catrobotics/studio'
import type { TopicAliasFunctions } from '@catrobotics/studio-base/players/TopicAliasingPlayer/TopicAliasingPlayer'

import type { ExtensionInfo, ExtensionNamespace } from '@catrobotics/studio-base/types/Extensions'
import type { StoreApi } from 'zustand'
import { createContext, useContext } from 'react'
import { createStore, useStore } from 'zustand'

export interface RegisteredPanel {
  extensionName: string
  extensionNamespace?: ExtensionNamespace
  registration: ExtensionPanelRegistration
}

export type ExtensionCatalog = Immutable<{
  installExtension?: (
    namespace: ExtensionNamespace,
    foxeFileData: Uint8Array,
  ) => Promise<ExtensionInfo>

  installedExtensions: undefined | ExtensionInfo[]
  installedPanels: undefined | Record<string, RegisteredPanel>
  installedMessageConverters: undefined | RegisterMessageConverterArgs<unknown>[]
  installedTopicAliasFunctions: undefined | TopicAliasFunctions
}>

export const ExtensionCatalogContext = createContext<StoreApi<ExtensionCatalog>>(
  createStore(() => ({
    installedExtensions: [],
    installedPanels: {},
    installedMessageConverters: [],
    installedTopicAliasFunctions: [],
  })),
)

export function useExtensionCatalog<T>(selector: (registry: ExtensionCatalog) => T): T {
  const context = useContext(ExtensionCatalogContext)
  return useStore(context, selector)
}
