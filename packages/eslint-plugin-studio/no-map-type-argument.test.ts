// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import path from 'node:path'
import parser from '@typescript-eslint/parser'
import { RuleTester } from '@typescript-eslint/rule-tester'

import rule from './no-map-type-argument.js'

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      tsconfigRootDir: path.join(import.meta.dirname, 'fixture'),
      project: 'tsconfig.json',
    },
  },
})

ruleTester.run('no-map-type-argument', rule, {
  valid: [
    /* ts */ `
    [1, 2].map((x) => x + 1);
    [1, 2].map((x): number => x + 1);
    [1, 2].map<number>((x): number => x + 1);
    [1, 2].map<number, string>((x) => x + 1);
    ({ x: 1 }).map<number>((x) => x + 1);
    `,
  ],

  invalid: [
    {
      code: /* ts */ `
        [1, 2].map<number>(x => x + 1);
        [1, 2].map<number>((x) => x + 1);
      `,
      errors: [
        { messageId: 'preferReturnTypeAnnotation', line: 2 },
        { messageId: 'preferReturnTypeAnnotation', line: 3 },
      ],
      output: /* ts */ `
        [1, 2].map((x): number => x + 1);
        [1, 2].map((x): number => x + 1);
      `,
    },
  ],
})
