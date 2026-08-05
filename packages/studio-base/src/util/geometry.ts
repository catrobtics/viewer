// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

export interface Point { x: number, y: number, z: number }

export interface Quaternion { x: number, y: number, z: number, w: number }

export interface Vector3 { x: number, y: number, z: number }

export function eulerToQuaternion(rpy: Vector3): Quaternion {
  const roll = rpy.x
  const pitch = rpy.y
  const yaw = rpy.z

  const cy = Math.cos(yaw * 0.5)
  const sy = Math.sin(yaw * 0.5)
  const cr = Math.cos(roll * 0.5)
  const sr = Math.sin(roll * 0.5)
  const cp = Math.cos(pitch * 0.5)
  const sp = Math.sin(pitch * 0.5)

  const w = cy * cr * cp + sy * sr * sp
  const x = cy * sr * cp - sy * cr * sp
  const y = cy * cr * sp + sy * sr * cp
  const z = sy * cr * cp - cy * sr * sp

  return { x, y, z, w }
}

export function makeCovarianceArray(xDev: number, yDev: number, thetaDev: number): number[] {
  const covariance = Array.from({ length: 36 }).fill(0) as number[]
  covariance[6 * 0 + 0] = xDev ** 2
  covariance[6 * 1 + 1] = yDev ** 2
  covariance[6 * 5 + 5] = thetaDev ** 2
  return covariance
}
