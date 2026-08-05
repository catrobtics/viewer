// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type {
  NavSatFixMsg,
} from '@catrobotics/studio-base/panels/Map/types'
import {
  NavSatFixPositionCovarianceType,
} from '@catrobotics/studio-base/panels/Map/types'

import { atan2, eigs, isNumber } from 'mathjs'

function getNumericPair(value: unknown): [number, number] | undefined {
  if (!Array.isArray(value) || value.length !== 2) {
    return undefined
  }
  const [first, second] = value
  return isNumber(first) && isNumber(second) ? [first, second] : undefined
}

/**
 * Calculates the accuracy of a NavSatFix message, based on its type, and returns
 * information suitable for display as a leaflet Ellipse.
 *
 * @param msg NavSatFix
 * @returns radii and tilt (degrees from W)
 */
export function getAccuracy(
  msg: NavSatFixMsg,
): { radii: [number, number], tilt: number } | undefined {
  const covariance = msg.position_covariance
  if (!covariance) {
    return undefined
  }

  switch (msg.position_covariance_type) {
    case undefined:
      return undefined
    case NavSatFixPositionCovarianceType.COVARIANCE_TYPE_UNKNOWN:
      return undefined
    case NavSatFixPositionCovarianceType.COVARIANCE_TYPE_DIAGONAL_KNOWN: {
      // Tilt is degrees from west
      const eastVariance = covariance[0]
      const northVariance = covariance[4]
      if (!Number.isFinite(eastVariance) || !Number.isFinite(northVariance)) {
        return undefined
      }
      return { radii: [Math.sqrt(eastVariance), Math.sqrt(northVariance)], tilt: 0 }
    }
    case NavSatFixPositionCovarianceType.COVARIANCE_TYPE_APPROXIMATED:
    case NavSatFixPositionCovarianceType.COVARIANCE_TYPE_KNOWN: {
      // Discard altitude
      const K = covariance
      const Klatlon = [
        [K[0], K[1]],
        [K[3], K[4]],
      ]

      // Compute the eigenvalues & vectors of the covariance matrix. They will
      // be sorted in ascending order, so the largest value is eigenvalues[1]
      // and the corresponding vector is in the rightmost column. Ellipse radii
      // are based on the eigenvalues, and orientation on the vector.
      try {
        const eigen = eigs(Klatlon)
        const eigenvector = getNumericPair(eigen.eigenvectors[1]?.vector)
        const eigenvalues = getNumericPair(eigen.values)
        if (!eigenvector || !eigenvalues) {
          return undefined
        }

        // Ellipse `tilt` is defined as number of degrees from the negative x axis
        const theta = (atan2(eigenvector[1], eigenvector[0]) * 180) / Math.PI
        const tilt = -1 * theta

        const primaryRadius = Math.sqrt(eigenvalues[1])
        const secondaryRadius = Math.sqrt(eigenvalues[0])

        if (!Number.isFinite(tilt) || !Number.isFinite(primaryRadius) || !Number.isFinite(secondaryRadius)) {
          return undefined
        }

        return {
          radii: [primaryRadius, secondaryRadius],
          tilt,
        }
      }
      catch {
        return undefined
      }
    }
  }
}
