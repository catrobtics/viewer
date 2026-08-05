// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

// exposes React into the global scope to avoid "import React from 'react'" in every component
/// <reference types="react" />

declare global {
  namespace React {
    // @types/react uses `any` here, which silences helpful TypeScript errors
    // https://github.com/microsoft/TypeScript/issues/37595
    function useCallback<T extends (...args: never[]) => unknown>(
      callback: T,
      deps: React.DependencyList,
    ): T
  }
}

export {}
