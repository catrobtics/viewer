// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { LayoutData } from '@catrobotics/studio-base/context/CurrentLayoutContext/actions'
import type { PanelConfig } from '@catrobotics/studio-base/types/panels'
import type { MosaicNode } from 'react-mosaic-component'

const HANDWRITTEN_PANEL_LAYOUT_VERSION = 2
const MOSAIC_PANEL_LAYOUT_VERSION = 1

interface V2SplitNode {
  type: 'split'
  children: unknown[]
  direction: 'row' | 'column'
  splitPercentages?: number[]
}

interface V2TabsNode {
  type: 'tabs'
  tabs: unknown[]
  activeTab?: number | string
  activeTabIdx?: number
  activeTabIndex?: number
}

interface ConversionResult {
  layout: MosaicNode<string> | undefined
  ok: boolean
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value != undefined && !Array.isArray(value)
}

function isV2SplitNode(value: unknown): value is V2SplitNode {
  return isRecord(value)
    && value.type === 'split'
    && Array.isArray(value.children)
    && (value.direction === 'row' || value.direction === 'column')
}

function isV2TabsNode(value: unknown): value is V2TabsNode {
  return isRecord(value) && value.type === 'tabs' && Array.isArray(value.tabs)
}

function normalizedWeights(count: number, percentages: number[] | undefined): number[] {
  if (
    percentages?.length === count
    && percentages.every(value => Number.isFinite(value) && value > 0)
  ) {
    return percentages
  }
  const weights: number[] = []
  for (let index = 0; index < count; index++) {
    weights.push(1)
  }
  return weights
}

function activeTabIndex(node: V2TabsNode): number {
  const candidate = node.activeTabIdx ?? node.activeTabIndex ?? node.activeTab
  if (typeof candidate === 'number' && Number.isInteger(candidate)) {
    return Math.max(0, Math.min(candidate, node.tabs.length - 1))
  }
  if (typeof candidate === 'string') {
    const index = node.tabs.indexOf(candidate)
    return index >= 0 ? index : 0
  }
  return 0
}

/**
 * Converts layouts written by the removed handwritten renderer back to the
 * binary tree consumed by react-mosaic-component.
 */
export function migratePanelLayoutV2(data: LayoutData): LayoutData {
  if (data.version !== HANDWRITTEN_PANEL_LAYOUT_VERSION) {
    return data
  }

  const configById: Record<string, PanelConfig> = { ...data.configById }
  let migratedTabCounter = 0

  const convert = (value: unknown): ConversionResult => {
    if (value == undefined) {
      return { layout: undefined, ok: true }
    }
    if (typeof value === 'string') {
      return { layout: value, ok: true }
    }

    // Accept an already-binary Mosaic node in case only the version was updated.
    if (
      isRecord(value)
      && (value.direction === 'row' || value.direction === 'column')
      && 'first' in value
      && 'second' in value
    ) {
      const first = convert(value.first)
      const second = convert(value.second)
      if (!first.ok || !second.ok || first.layout == undefined || second.layout == undefined) {
        return { layout: undefined, ok: false }
      }
      return {
        layout: {
          direction: value.direction,
          first: first.layout,
          second: second.layout,
          splitPercentage:
            typeof value.splitPercentage === 'number' ? value.splitPercentage : undefined,
        },
        ok: true,
      }
    }

    if (isV2SplitNode(value)) {
      const children = value.children.map(convert)
      if (children.some(child => !child.ok || child.layout == undefined)) {
        return { layout: undefined, ok: false }
      }
      if (children.length === 0) {
        return { layout: undefined, ok: true }
      }
      if (children.length === 1) {
        return children[0]!
      }

      const weights = normalizedWeights(children.length, value.splitPercentages)
      const build = (index: number): MosaicNode<string> => {
        const child = children[index]!.layout!
        if (index === children.length - 1) {
          return child
        }
        const remainingWeight = weights.slice(index).reduce((sum, weight) => sum + weight, 0)
        return {
          direction: value.direction,
          first: child,
          second: build(index + 1),
          splitPercentage: (weights[index]! / remainingWeight) * 100,
        }
      }
      return { layout: build(0), ok: true }
    }

    if (isV2TabsNode(value) && value.tabs.length > 0) {
      const tabs = value.tabs.map(convert)
      if (tabs.some(tab => !tab.ok)) {
        return { layout: undefined, ok: false }
      }
      let tabPanelId: string
      do {
        tabPanelId = `Tab!migrated-v2-${++migratedTabCounter}`
      } while (tabPanelId in configById)

      configById[tabPanelId] = {
        activeTabIdx: activeTabIndex(value),
        tabs: tabs.map((tab, index) => ({
          title: String(index + 1),
          layout: tab.layout,
        })),
      }
      return { layout: tabPanelId, ok: true }
    }

    return { layout: undefined, ok: false }
  }

  const rootLayout = convert(data.layout)
  if (!rootLayout.ok) {
    return data
  }

  for (const [panelId, config] of Object.entries(configById)) {
    if (!isRecord(config) || !Array.isArray(config.tabs)) {
      continue
    }
    const tabs = config.tabs.map((tab) => {
      if (!isRecord(tab)) {
        return undefined
      }
      const converted = convert(tab.layout)
      if (!converted.ok) {
        return undefined
      }
      return { ...tab, layout: converted.layout }
    })
    if (tabs.some(tab => tab == undefined)) {
      return data
    }
    configById[panelId] = { ...config, tabs }
  }

  return {
    ...data,
    version: MOSAIC_PANEL_LAYOUT_VERSION,
    layout: rootLayout.layout,
    configById,
  }
}
