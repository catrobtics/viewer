// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type {
  NavSatFixMsg,
} from '@catrobotics/studio-base/panels/Map/types'
import type { Topic } from '@catrobotics/studio-base/players/types'
import type { Fixture } from '@catrobotics/studio-base/stories/PanelSetup'
import type { StoryContext, StoryFn, StoryObj } from '@storybook/react-vite'
import {
  NavSatFixPositionCovarianceType,
  NavSatFixService,
  NavSatFixStatus,
} from '@catrobotics/studio-base/panels/Map/types'
import PanelSetup from '@catrobotics/studio-base/stories/PanelSetup'
import * as _ from 'lodash-es'

import { useEffect, useState } from 'react'
import { userEvent } from 'storybook/test'

import MapPanel from './index'

const EMPTY_MESSAGE: NavSatFixMsg = {
  latitude: 0,
  longitude: 0,
  altitude: 0,
  status: { status: NavSatFixStatus.STATUS_FIX, service: NavSatFixService.SERVICE_GPS },
  position_covariance: [1, 0, 0, 0, 1, 0, 0, 0, 1],
  position_covariance_type: NavSatFixPositionCovarianceType.COVARIANCE_TYPE_UNKNOWN,
}
const OFFSET_MESSAGE = _.tap(_.cloneDeep(EMPTY_MESSAGE), (message) => {
  message.latitude += 0.1
  message.longitude += 0.1
})

function makeGeoJsonMessage({
  center,
  key,
  polyStyle = {},
}: {
  center: { lat: number, lon: number }
  key: string
  polyStyle?: Record<string, unknown>
}) {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [center.lon, center.lat],
            [0.1 + center.lon, center.lat],
            [0.1 + center.lon, 0.1 + center.lat],
          ],
        },
        properties: {
          name: `Named Line ${key}`,
          style: {
            color: '#ff0000',
            dashArray: '4 4',
            lineCap: 'butt',
            opacity: '1',
            weight: 4,
          },
        },
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [center.lon - 0.1, center.lat - 0.1],
              [center.lon + 0.2, center.lat - 0.1],
              [center.lon + 0.2, center.lat],
            ],
          ],
        },
        properties: {
          name: `Named Polygon ${key}`,
          style: polyStyle,
        },
      },
      {
        type: 'Feature',
        properties: {
          'name': `Named Point ${key}`,
          'marker-color': '#7f7e7e',
          'marker-size': 'medium',
          'marker-symbol': '1',
        },
        geometry: {
          type: 'Point',
          coordinates: [center.lon - 0.1, center.lat + 0.1],
        },
      },
    ],
  }
}

function Wrapper(StoryComponent: StoryFn, { parameters }: StoryContext): React.JSX.Element {
  return (
    <PanelSetup
      fixture={parameters.panelSetup?.fixture}
      includeSettings={parameters.includeSettings}
    >
      <StoryComponent />
    </PanelSetup>
  )
}

export default {
  title: 'panels/Map',
  component: MapPanel,
}

export const EmptyState: StoryObj = {
  render: function Story() {
    return <MapPanel />
  },

  decorators: [Wrapper],
}

export const SinglePoint: StoryObj = {
  render: function Story() {
    return <MapPanel />
  },

  decorators: [Wrapper],

  parameters: {
    chromatic: {
      delay: 1000,
    },
    panelSetup: {
      fixture: {
        topics: [{ name: '/gps', schemaName: 'sensor_msgs/NavSatFix' }],
        frame: {
          '/gps': [
            {
              topic: '/gps',
              schemaName: 'sensor_msgs/NavSatFix',
              sizeInBytes: 0,
              receiveTime: { sec: 123, nsec: 456 },
              message: EMPTY_MESSAGE,
            },
          ],
        },
      } as Fixture,
    },
  },
}

export const SinglePointWithMissingValues: StoryObj = {
  render: function Story() {
    return <MapPanel />
  },

  decorators: [Wrapper],

  parameters: {
    chromatic: {
      delay: 1000,
    },
    panelSetup: {
      fixture: {
        topics: [{ name: '/gps', schemaName: 'sensor_msgs/NavSatFix' }],
        frame: {
          '/gps': [
            {
              topic: '/gps',
              schemaName: 'sensor_msgs/NavSatFix',
              sizeInBytes: 0,
              receiveTime: { sec: 123, nsec: 456 },
              message: {
                ...EMPTY_MESSAGE,
                latitude: undefined,
                longitude: undefined,
              },
            },
          ],
        },
      } as Fixture,
    },
  },
}

export const SinglePointWithInvalidData: StoryObj = {
  render: function Story() {
    return <MapPanel />
  },

  decorators: [Wrapper],

  parameters: {
    chromatic: {
      delay: 1000,
    },
    panelSetup: {
      fixture: {
        topics: [{ name: '/gps', schemaName: 'sensor_msgs/NavSatFix' }],
        frame: {
          '/gps': [
            {
              topic: '/gps',
              schemaName: 'sensor_msgs/NavSatFix',
              sizeInBytes: 0,
              receiveTime: { sec: 123, nsec: 456 },
              message: {
                latitude: NaN,
                longitude: NaN,
                altitude: 0,
                status: {
                  status: NavSatFixStatus.STATUS_NO_FIX,
                  service: NavSatFixService.SERVICE_GPS,
                },
              },
            },
          ],
        },
      } as Fixture,
    },
  },
}

export const SinglePointWithNoFix: StoryObj = {
  render: function Story() {
    return <MapPanel />
  },

  decorators: [Wrapper],

  parameters: {
    chromatic: {
      delay: 1000,
    },
    panelSetup: {
      fixture: {
        topics: [{ name: '/gps', schemaName: 'sensor_msgs/NavSatFix' }],
        frame: {
          '/gps': [
            {
              topic: '/gps',
              schemaName: 'sensor_msgs/NavSatFix',
              sizeInBytes: 0,
              receiveTime: { sec: 123, nsec: 456 },
              message: {
                ...EMPTY_MESSAGE,
                status: {
                  status: NavSatFixStatus.STATUS_NO_FIX,
                  service: NavSatFixService.SERVICE_GPS,
                },
              },
            },
          ],
        },
      } as Fixture,
    },
  },
}

export const SinglePointWithSettings: StoryObj = {
  render: function Story() {
    return <MapPanel overrideConfig={{ layer: 'custom' }} />
  },

  decorators: [Wrapper],

  parameters: {
    ...SinglePoint.parameters,
    includeSettings: true,
  },
}

export const SinglePointWithSettingsOverride: StoryObj = {
  render: function Story() {
    return <MapPanel overrideConfig={{ layer: 'custom', topicColors: { '/gps': '#ffc0cb' } }} />
  },

  decorators: [Wrapper],

  parameters: {
    ...SinglePoint.parameters,
    includeSettings: true,
  },
}

export const MultipleTopics: StoryObj = {
  render: function Story() {
    return <MapPanel />
  },

  decorators: [Wrapper],

  parameters: {
    chromatic: {
      delay: 1000,
    },
    decorators: [Wrapper],
    panelSetup: {
      fixture: {
        topics: [
          { name: '/gps', schemaName: 'sensor_msgs/NavSatFix' },
          { name: '/another-gps-topic', schemaName: 'sensor_msgs/NavSatFix' },
        ],
        frame: {
          '/gps': [
            {
              topic: '/gps',
              schemaName: 'sensor_msgs/NavSatFix',
              sizeInBytes: 0,
              receiveTime: { sec: 123, nsec: 456 },
              message: EMPTY_MESSAGE,
            },
          ],
          '/another-gps-topic': [
            {
              topic: '/another-gps-topic',
              schemaName: 'sensor_msgs/NavSatFix',
              sizeInBytes: 0,
              receiveTime: { sec: 123, nsec: 456 },
              message: OFFSET_MESSAGE,
            },
          ],
        },
      } as Fixture,
    },
  },
}

export const SinglePointDiagonalCovariance: StoryObj = {
  render: function Story() {
    return (
      <MapPanel
        overrideConfig={{
          zoomLevel: 12,
        }}
      />
    )
  },

  decorators: [Wrapper],

  parameters: {
    chromatic: {
      delay: 1000,
    },
    decorators: [Wrapper],
    panelSetup: {
      fixture: {
        topics: [{ name: '/gps', schemaName: 'sensor_msgs/NavSatFix' }],
        frame: {
          '/gps': [
            {
              topic: '/gps',
              schemaName: 'sensor_msgs/NavSatFix',
              sizeInBytes: 0,
              receiveTime: { sec: 123, nsec: 456 },
              message: {
                latitude: 1,
                longitude: 2,
                altitude: 0,
                status: {
                  status: NavSatFixStatus.STATUS_FIX,
                  service: NavSatFixService.SERVICE_GPS,
                },
                position_covariance: [1, 0, 0, 0, 5000000, 0, 0, 0, 1000000000],
                position_covariance_type:
                  NavSatFixPositionCovarianceType.COVARIANCE_TYPE_DIAGONAL_KNOWN,
              },
            },
          ],
        },
      } as Fixture,
    },
  },
}

export const SinglePointFullCovariance: StoryObj = {
  render: function Story() {
    return (
      <MapPanel
        overrideConfig={{
          zoomLevel: 21,
        }}
      />
    )
  },

  decorators: [Wrapper],

  parameters: {
    chromatic: {
      delay: 1000,
    },
    decorators: [Wrapper],
    panelSetup: {
      fixture: {
        topics: [{ name: '/gps', schemaName: 'sensor_msgs/NavSatFix' }],
        frame: {
          '/gps': [
            {
              topic: '/gps',
              receiveTime: { sec: 123, nsec: 456 },
              sizeInBytes: 0,
              schemaName: 'sensor_msgs/NavSatFix',
              message: {
                latitude: 1,
                longitude: 2,
                altitude: 0,
                status: {
                  status: NavSatFixStatus.STATUS_GBAS_FIX,
                  service: NavSatFixService.SERVICE_GPS,
                },
                position_covariance: [5, -4, 0, -4, 6, 0, 0, 0, 1],
                position_covariance_type: NavSatFixPositionCovarianceType.COVARIANCE_TYPE_KNOWN,
              },
            },
          ],
        },
      } as Fixture,
    },
  },
}

const GeoCenter = { lat: 0.25, lon: 0.25 }
const GEOJSON_TOPICS: Topic[] = [
  { name: '/geojson_with_update', schemaName: 'foxglove.GeoJSON' },
  { name: '/geojson', schemaName: 'foxglove.GeoJSON' },
  { name: '/gps', schemaName: 'sensor_msgs/NavSatFix' },
]

export const GeoJSON: StoryObj = {
  render: function Story() {
    const [fixture, setFixture] = useState<Fixture>({
      topics: GEOJSON_TOPICS,
      frame: {
        '/gps': [
          {
            topic: '/gps',
            receiveTime: { sec: 123, nsec: 456 },
            schemaName: 'sensor_msgs/NavSatFix',
            message: EMPTY_MESSAGE,
            sizeInBytes: 10,
          },
        ],
        '/geojson_with_update': [
          {
            topic: '/geojson_with_update',
            receiveTime: { sec: 123, nsec: 0 },
            schemaName: 'foxglove.GeoJSON',
            message: {
              geojson: JSON.stringify(
                makeGeoJsonMessage({
                  center: { lat: GeoCenter.lat - 0.2, lon: GeoCenter.lon - 0.2 },
                  key: '/geo',
                }),
              ),
            },
            sizeInBytes: 10,
          },
        ],
        '/geojson': [
          {
            topic: '/geojson',
            receiveTime: { sec: 123, nsec: 0 },
            schemaName: 'foxglove.GeoJSON',
            message: {
              geojson: JSON.stringify(
                makeGeoJsonMessage({
                  center: { lat: GeoCenter.lat - 0.1, lon: GeoCenter.lon - 0.1 },
                  key: '/geo2',
                  polyStyle: {
                    color: '#ff00ff',
                    fillColor: '#ffff00',
                    opacity: '0.8',
                    weight: 4,
                  },
                }),
              ),
            },
            sizeInBytes: 10,
          },
        ],
      },
    })

    // Send a second messaqge on /geo topic. This should replace the previous message but not
    // the /geo2 message.
    useEffect(() => {
      const timer = setTimeout(() => {
        setFixture({
          topics: GEOJSON_TOPICS,
          frame: {
            '/geojson_with_update': [
              {
                topic: '/geojson_with_update',
                receiveTime: { sec: 130, nsec: 0 },
                schemaName: 'foxglove.GeoJSON',
                message: {
                  geojson: JSON.stringify(
                    makeGeoJsonMessage({
                      center: { lat: GeoCenter.lat + 0.2, lon: GeoCenter.lon + 0.1 },
                      key: '/geo',
                    }),
                  ),
                },
                sizeInBytes: 10,
              },
            ],
          },
        })
      }, 1000)
      return () => clearTimeout(timer)
    }, [])

    return (
      <PanelSetup fixture={fixture} includeSettings>
        <MapPanel
          overrideConfig={{
            topicColors: { '/geojson_with_update': '#00ffaa' },
            center: GeoCenter,
          }}
        />
      </PanelSetup>
    )
  },

  parameters: {
    chromatic: {
      delay: 2000,
    },
    colorScheme: 'light',
  },

  play: async () => {
    const followSelect = document.querySelectorAll('div[role=button][aria-haspopup=listbox]')[1]
    if (followSelect) {
      await userEvent.click(followSelect)
    }
  },
}
