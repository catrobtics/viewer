// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type {
  ProblemsContextStore,
  SessionProblem,
} from '@catrobotics/studio-base/context/ProblemsContext'
import type { Immutable } from 'immer'
import type { ReactNode } from 'react'
import type { StoreApi } from 'zustand'
import {
  ProblemsContext,
} from '@catrobotics/studio-base/context/ProblemsContext'

import { useState } from 'react'
import { create } from 'zustand'

function createProblemsStore(): StoreApi<ProblemsContextStore> {
  return create<ProblemsContextStore>((set, get) => {
    return {
      problems: [],
      actions: {
        clearProblem: (tag: string) => {
          set({
            problems: get().problems.filter(prob => prob.tag !== tag),
          })
        },
        setProblem: (tag: string, problem: Immutable<SessionProblem>) => {
          const newProblems = get().problems.filter(prob => prob.tag !== tag)

          set({
            problems: [{ tag, ...problem }, ...newProblems],
          })
        },
      },
    }
  })
}

export default function ProblemsContextProvider({
  children,
}: {
  children?: ReactNode
}): React.JSX.Element {
  const [store] = useState(createProblemsStore)
  return <ProblemsContext.Provider value={store}>{children}</ProblemsContext.Provider>
}
