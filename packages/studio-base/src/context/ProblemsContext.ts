// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { Immutable } from '@catrobotics/studio'
import type { PlayerProblem } from '@catrobotics/studio-base/players/types'

import type { StoreApi } from 'zustand'
import { useGuaranteedContext } from '@catrobotics/hooks'
import { createContext } from 'react'
import { useStore } from 'zustand'

export type SessionProblem = PlayerProblem

type TaggedProblem = SessionProblem & { tag: string }

export type ProblemsContextStore = Immutable<{
  problems: TaggedProblem[]
  actions: {
    clearProblem: (tag: string) => void
    setProblem: (tag: string, problem: Immutable<SessionProblem>) => void
  }
}>

export const ProblemsContext = createContext<undefined | StoreApi<ProblemsContextStore>>(undefined)

ProblemsContext.displayName = 'ProblemsContext'

/**
 * Fetches values from the problems store.
 */
export function useProblemsStore<T>(selector: (store: ProblemsContextStore) => T): T {
  const context = useGuaranteedContext(ProblemsContext)
  return useStore(context, selector)
}

const selectActions = (store: ProblemsContextStore) => store.actions

/**
 * Convenience hook for accessing problems store actions.
 */
export function useProblemsActions(): ProblemsContextStore['actions'] {
  return useProblemsStore(selectActions)
}
