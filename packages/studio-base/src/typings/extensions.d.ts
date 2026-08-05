// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

// Type declarations for assets handled by Vite and its shared plugins.

declare module '*.svg?react' {
  import type { FunctionComponent, SVGProps } from 'react'

  const IconComponent: FunctionComponent<SVGProps<SVGSVGElement>>
  export default IconComponent
}

declare module '*.bag' {
  const content: string
  export default content
}

declare module '*.bin' {
  const content: string
  export default content
}

declare module '*.md' {
  const content: string
  export default content
}

declare module '*.png' {
  const Path: string
  export default Path
}

declare module '*.glb' {
  const content: string
  export default content
}

declare module '*.template' {
  const content: string
  export default content
}

declare module '*?raw' {
  const content: string
  export default content
}

declare module '*.wasm' {
  const url: string
  export default url
}

declare module '*.wasm?url' {
  const url: string
  export default url
}

declare module '*.woff2' {
  const url: string
  export default url
}
