// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import Logger from '@catrobotics/log'

import { useEffect, useState } from 'react'

const log = Logger.getLogger(import.meta.url)

interface UseMemoryInfoOptions {
  refreshIntervalMs: number
}

interface MemoryInfo {
  jsHeapSizeLimit: number
  totalJSHeapSize: number
  usedJSHeapSize: number
}

function getMemoryInfo(): MemoryInfo | undefined {
  return (window.performance as Performance & { memory?: MemoryInfo }).memory
}

export function useMemoryInfo(opt: UseMemoryInfoOptions): MemoryInfo | undefined {
  const { refreshIntervalMs } = opt
  const [memoryInfo, setMemoryInfo] = useState<MemoryInfo | undefined>(getMemoryInfo())

  useEffect(() => {
    if (!getMemoryInfo()) {
      log.info('No memory information available')
      return
    }

    const interval = setInterval(() => {
      setMemoryInfo(getMemoryInfo())
    }, refreshIntervalMs)
    return () => {
      clearInterval(interval)
    }
  }, [refreshIntervalMs])

  return memoryInfo
}
