// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

const path = 'M68 28C59 28 52 35 52 44V157C52 166 61 171 68 166C98 146 130 135 164 133C176 133 181 119 172 110L81 32C77 29 73 28 68 28ZM444 28C453 28 461 35 461 44V157C461 166 452 171 444 166C414 146 382 135 348 133C336 133 331 119 340 110L431 32C435 29 439 28 444 28ZM160 159H359C421 159 466 202 466 258C466 298 445 329 411 346L479 430C485 438 479 447 470 447H417C414 447 411 445 409 442L309 317C303 310 308 300 317 300H360C387 300 406 282 406 258C406 234 387 215 359 215H162C122 215 90 247 90 288V317C90 358 122 391 162 391H251C256 391 259 395 259 400V439C259 444 255 448 250 448H157C87 448 31 391 31 320V286C31 216 88 159 160 159Z'

export function CatRoboticsLogo(props: React.SVGProps<SVGSVGElement>): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 512 512"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d={path} />
    </svg>
  )
}
