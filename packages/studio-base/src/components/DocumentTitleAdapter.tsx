// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type {
  MessagePipelineContext,
} from '@catrobotics/studio-base/components/MessagePipeline'
import {
  useMessagePipeline,
} from '@catrobotics/studio-base/components/MessagePipeline'
import { defaultBranding, useBranding } from '@catrobotics/studio-base/context/BrandingContext'

import { useEffect } from 'react'

const selectPlayerName = (ctx: MessagePipelineContext) => ctx.playerState.name

/**
 * DocumentTitleAdapter sets the document title based on the currently selected player
 */
export default function DocumentTitleAdapter(): React.JSX.Element {
  const playerName = useMessagePipeline(selectPlayerName)
  const { productName = defaultBranding.productName } = useBranding()

  useEffect(() => {
    if (!playerName) {
      window.document.title = productName
      return
    }
    window.document.title = navigator.userAgent.includes('Mac')
      ? playerName
      : `${playerName} – ${productName}`
  }, [playerName, productName])

  return <></>
}
