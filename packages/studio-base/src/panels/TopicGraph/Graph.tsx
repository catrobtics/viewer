// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type * as Cytoscape from 'cytoscape'
import type { RefObject } from 'react'
import cytoscape from 'cytoscape'
import CytoscapeDagre from 'cytoscape-dagre'
import { useEffect, useRef } from 'react'

cytoscape.use(CytoscapeDagre)
cytoscape.warnings(false)

const DAG_LAYOUT = {
  name: 'dagre',
  fit: false,
  nodeSep: 20,
  rankDir: 'TB',
  ranker: 'longest-path',
} satisfies CytoscapeDagre.DagreLayoutOptions

export interface GraphMutation {
  fit: () => void
  resetUserPanZoom: () => void
}

interface Props {
  style: Cytoscape.StylesheetStyle[]
  elements: cytoscape.ElementDefinition[]
  rankDir: 'TB' | 'LR'
  graphRef: RefObject<GraphMutation | undefined>
}

export default function Graph(props: Props): React.JSX.Element {
  const cy = useRef<Cytoscape.Core | undefined>(undefined)
  const graphRef = useRef<HTMLDivElement>(null)

  // indicates that a user has manually panned/zoomed the viewport
  // we avoid performing actions like automatic fit when this happens.
  const userPanZoom = useRef<boolean>(false)

  useEffect(() => {
    if (!graphRef.current) {
      throw new Error('Graph ref must be available on first render')
    }

    cy.current = cytoscape({
      container: graphRef.current,
      zoom: 0.7,
    })

    cy.current.on('viewport', () => {
      userPanZoom.current = true
    })

    props.graphRef.current = {
      fit: () => {
        userPanZoom.current = false
        cy.current?.fit()
      },
      resetUserPanZoom: () => {
        userPanZoom.current = false
      },
    }

    return () => {
      cy.current?.destroy()
    }
  }, [props.graphRef])

  const { elements, rankDir } = props
  useEffect(() => {
    if (!cy.current) {
      return
    }

    cy.current.batch(() => {
      cy.current?.elements().remove()
      cy.current?.add(elements)
      const layoutOptions: Cytoscape.LayoutOptions & CytoscapeDagre.DagreLayoutOptions = {
        ...DAG_LAYOUT,
        rankDir,
      }
      cy.current?.elements().makeLayout(layoutOptions).run()
    })

    if (!userPanZoom.current) {
      cy.current.fit()
    }
  }, [elements, rankDir])

  useEffect(() => {
    cy.current?.style(props.style)
  }, [props.style])

  return <div ref={graphRef} style={{ width: '100%', height: '100%' }} />
}
