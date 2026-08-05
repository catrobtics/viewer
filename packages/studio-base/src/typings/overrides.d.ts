// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

// We extend the type definition of JSON.stringify because in some cases
// it can return undefined. This isn't strictly correct but it at least
// forces callers to handle the undefined case and prevent crashes.
// See issue https://github.com/microsoft/TypeScript/issues/18879
declare global {
  interface JSON {
    stringify(
      value: unknown,
      replacer?: (this: unknown, key: string, value: unknown) => unknown,
      space?: string | number,
    ): undefined | string

    stringify(
      value: unknown,
      replacer?: (number | string)[] | null,
      space?: string | number,
    ): undefined | string
  }

  // https://github.com/microsoft/TypeScript/issues/46907#issuecomment-1001080601
  namespace Intl {
    type ListType = 'conjunction' | 'disjunction'

    interface ListFormatOptions {
      localeMatcher?: 'lookup' | 'best fit'
      type?: ListType
      style?: 'long' | 'short' | 'narrow'
    }

    interface ListFormatPart {
      type: 'element' | 'literal'
      value: string
    }

    class ListFormat {
      public constructor(locales?: string | string[], options?: ListFormatOptions)
      public format(values: string[]): string
      public formatToParts(values: string[]): ListFormatPart[]
      public supportedLocalesOf(locales: string | string[], options?: ListFormatOptions): string[]
    }
  }

  interface String {
    toUpperCase<T extends string>(this: T): Uppercase<T>
    toLowerCase<T extends string>(this: T): Lowercase<T>
  }
}

export {}
