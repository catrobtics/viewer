// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { LayoutData } from '@catrobotics/studio-base/context/CurrentLayoutContext/actions'

import { migratePanelLayoutV2 } from './migratePanelLayoutV2'

function layoutData(layout: unknown, configById: LayoutData['configById'] = {}): LayoutData {
  return {
    version: 2,
    layout,
    configById,
    globalVariables: {},
    playbackConfig: { speed: 1 },
    userNodes: {},
  } as unknown as LayoutData
}

describe('migratePanelLayoutV2', () => {
  it('converts an n-ary split into a binary Mosaic tree', () => {
    expect(
      migratePanelLayoutV2(
        layoutData({
          type: 'split',
          direction: 'row',
          children: ['A', 'B', 'C'],
          splitPercentages: [50, 30, 20],
        }),
      ),
    ).toMatchObject({
      version: 1,
      layout: {
        direction: 'row',
        first: 'A',
        splitPercentage: 50,
        second: {
          direction: 'row',
          first: 'B',
          second: 'C',
          splitPercentage: 60,
        },
      },
    })
  })

  it('converts layouts nested inside existing Tab panel configs', () => {
    const result = migratePanelLayoutV2(
      layoutData('Tab!a', {
        'Tab!a': {
          activeTabIdx: 0,
          tabs: [
            {
              title: 'One',
              layout: {
                type: 'split',
                direction: 'column',
                children: ['A', 'B'],
                splitPercentages: [25, 75],
              },
            },
          ],
        },
      }),
    )

    expect(result.version).toBe(1)
    expect(result.configById['Tab!a']).toEqual({
      activeTabIdx: 0,
      tabs: [
        {
          title: 'One',
          layout: {
            direction: 'column',
            first: 'A',
            second: 'B',
            splitPercentage: 25,
          },
        },
      ],
    })
  })

  it('preserves a v2 tabs node by creating a standard Tab panel', () => {
    const result = migratePanelLayoutV2(
      layoutData({
        type: 'tabs',
        tabs: ['A', 'B'],
        activeTabIndex: 1,
      }),
    )

    expect(result.version).toBe(1)
    expect(result.layout).toBe('Tab!migrated-v2-1')
    expect(result.configById['Tab!migrated-v2-1']).toEqual({
      activeTabIdx: 1,
      tabs: [
        { title: '1', layout: 'A' },
        { title: '2', layout: 'B' },
      ],
    })
  })

  it('does not downgrade unknown future layout versions', () => {
    const data = { ...layoutData('A'), version: 3 }
    expect(migratePanelLayoutV2(data)).toBe(data)
  })
})
