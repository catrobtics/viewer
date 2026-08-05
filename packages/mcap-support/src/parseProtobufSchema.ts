// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { MessageDefinitionMap } from './types'

import protobufjs from 'protobufjs/light'
import {
  protobufDefinitionsToDatatypes,
  stripLeadingDot,
} from './protobufDefinitionsToDatatypes'
import 'protobufjs/ext/descriptor'

/**
 * Parse a Protobuf binary schema (FileDescriptorSet) and produce datatypes and a deserializer
 * function.
 */
export function parseProtobufSchema(
  schemaName: string,
  schemaData: Uint8Array,
): {
  datatypes: MessageDefinitionMap
  deserialize: (buffer: ArrayBufferView) => unknown
} {
  const root = protobufjs.Root.fromDescriptor(schemaData)
  root.resolveAll()
  const rootType = root.lookupType(schemaName)

  // Modify the definition of google.protobuf.Timestamp and Duration so they are interpreted as
  // {sec: number, nsec: number}, compatible with the rest of Studio. The standard Protobuf types
  // use different names (`seconds` and `nanos`), and `seconds` is an `int64`, which would be
  // deserialized as a bigint by default.
  //
  // protobufDefinitionsToDatatypes also has matching logic to rename the fields.
  const fixTimeType = (type: protobufjs.ReflectionObject | null) => {
    if (!type || !(type instanceof protobufjs.Type)) {
      return
    }
    type.setup() // ensure the original optimized toObject has been created
    const prevToObject = type.toObject
    const newToObject: typeof prevToObject = (message, options) => {
      const result = prevToObject.call(type, message, options)
      const { seconds, nanos } = result as { seconds: bigint, nanos: number }
      if (typeof seconds !== 'bigint' || typeof nanos !== 'number') {
        return result
      }
      if (seconds > BigInt(Number.MAX_SAFE_INTEGER)) {
        throw new Error(
          `Timestamps with seconds greater than 2^53-1 are not supported (found seconds=${seconds}, nanos=${nanos})`,
        )
      }
      return { sec: Number(seconds), nsec: nanos }
    }
    type.toObject = newToObject
  }

  fixTimeType(root.lookup('.google.protobuf.Timestamp'))
  fixTimeType(root.lookup('.google.protobuf.Duration'))

  const mapKeyFromString = (key: string, keyType: string): unknown => {
    if (
      ['int64', 'uint64', 'sint64', 'fixed64', 'sfixed64'].includes(keyType)
    ) {
      return BigInt(key)
    }
    if (keyType === 'bool') {
      return key === 'true'
    }
    if (keyType !== 'string') {
      return Number(key)
    }
    return key
  }

  const normalizeObject = (type: protobufjs.Type, value: unknown): unknown => {
    if (value == undefined || typeof value !== 'object') {
      return value
    }
    const object = value as Record<string, unknown>
    for (const field of type.fieldsArray) {
      const fieldValue = object[field.name]
      if (fieldValue == undefined) {
        continue
      }
      const nestedType
        = field.resolvedType instanceof protobufjs.Type
          ? field.resolvedType
          : undefined
      if (
        field instanceof protobufjs.MapField
        && typeof fieldValue === 'object'
      ) {
        object[field.name] = Object.entries(
          fieldValue as Record<string, unknown>,
        ).map(([key, entryValue]) => ({
          key: mapKeyFromString(key, field.keyType),
          value: nestedType
            ? normalizeObject(nestedType, entryValue)
            : entryValue,
        }))
      }
      else if (field.repeated && Array.isArray(fieldValue) && nestedType) {
        object[field.name] = fieldValue.map(entry =>
          normalizeObject(nestedType, entry),
        )
      }
      else if (nestedType) {
        object[field.name] = normalizeObject(nestedType, fieldValue)
      }
    }
    return object
  }

  const deserialize = (data: ArrayBufferView) => {
    return normalizeObject(
      rootType,
      rootType.toObject(
        rootType.decode(
          new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
        ),
        { defaults: true, longs: BigInt },
      ),
    )
  }

  const datatypes: MessageDefinitionMap = new Map()
  protobufDefinitionsToDatatypes(datatypes, rootType)

  if (!datatypes.has(schemaName)) {
    throw new Error(
      `Protobuf schema does not contain an entry for '${schemaName}'. The schema name should be fully-qualified, e.g. '${stripLeadingDot(
        rootType.fullName,
      )}'.`,
    )
  }

  return { deserialize, datatypes }
}
