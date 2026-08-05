// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { useRef } from 'react'

export function useLatest<T>(value: T): React.RefObject<T> {
  const ref = useRef(value)
  ref.current = value
  return ref
}
