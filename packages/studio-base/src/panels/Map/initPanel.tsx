// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { useCrash } from '@catrobotics/hooks'
import type { PanelExtensionContext } from '@catrobotics/studio'
import { CaptureErrorBoundary } from '@catrobotics/studio-base/components/CaptureErrorBoundary'
import { deferRootUnmount } from '@catrobotics/studio-base/util/deferRootUnmount'
import L from 'leaflet'
import LeafletRetinaIconUrl from 'leaflet/dist/images/marker-icon-2x.png'

import LeafletIconUrl from 'leaflet/dist/images/marker-icon.png'
import LeafletShadowIconUrl from 'leaflet/dist/images/marker-shadow.png'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import MapPanel from './MapPanel'

import 'leaflet/dist/leaflet.css'

// Leaflet's default icon URLs are not preserved by application bundlers, so
// provide the imported asset URLs explicitly.
L.Marker.prototype.options.icon = L.icon({
  iconUrl: LeafletIconUrl,
  iconRetinaUrl: LeafletRetinaIconUrl,
  shadowUrl: LeafletShadowIconUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
})

export function initPanel(
  crash: ReturnType<typeof useCrash>,
  context: PanelExtensionContext,
): () => void {
  const root = createRoot(context.panelElement)
  root.render(
    <StrictMode>
      <CaptureErrorBoundary onError={crash}>
        <MapPanel context={context} />
      </CaptureErrorBoundary>
    </StrictMode>,
  )
  return () => {
    deferRootUnmount(root)
  }
}
