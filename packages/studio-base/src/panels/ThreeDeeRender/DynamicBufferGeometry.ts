// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import * as THREE from 'three'

type TypedArrayConstructor<T extends THREE.TypedArray> = new (length: number) => T

export class DynamicBufferGeometry extends THREE.BufferGeometry {
  public override attributes: { [name: string]: THREE.BufferAttribute } = {}

  #attributeConstructors = new Map<string, TypedArrayConstructor<THREE.TypedArray>>()
  #usage: THREE.Usage
  #itemCapacity = 0

  public constructor(usage: THREE.Usage = THREE.DynamicDrawUsage) {
    super()
    this.#usage = usage
  }

  public setUsage(usage: THREE.Usage): void {
    this.#usage = usage
    for (const attribute of Object.values(this.attributes)) {
      attribute.setUsage(usage)
    }
  }

  public createAttribute<T extends THREE.TypedArray, C extends TypedArrayConstructor<T>>(
    name: string,
    ArrayConstructor: C,
    itemSize: number,

    normalized?: boolean,
  ): THREE.BufferGeometry {
    const data = new ArrayConstructor(this.#itemCapacity * itemSize)
    const attribute = new THREE.BufferAttribute(data, itemSize, normalized)
    attribute.setUsage(this.#usage)
    this.#attributeConstructors.set(name, ArrayConstructor)
    return this.setAttribute(name, attribute)
  }

  public resize(itemCount: number): void {
    this.setDrawRange(0, itemCount)

    if (itemCount <= this.#itemCapacity) {
      return
    }

    for (const [attributeName, attribute] of Object.entries(this.attributes)) {
      const DataConstructor = this.#attributeConstructors.get(attributeName)
      if (!DataConstructor) {
        throw new Error(
          `DynamicBufferGeometry resize(${itemCount}) failed, missing data constructor for attribute "${attributeName}". Attributes must be created using createAttribute().`,
        )
      }
      const data = new DataConstructor(itemCount * attribute.itemSize)
      const newAttrib = new THREE.BufferAttribute(data, attribute.itemSize, attribute.normalized)
      newAttrib.setUsage(this.#usage)
      this.setAttribute(attributeName, newAttrib)
    }

    this.#itemCapacity = itemCount
  }
}
