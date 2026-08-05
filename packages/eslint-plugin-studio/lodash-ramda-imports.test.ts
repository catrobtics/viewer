// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import path from 'node:path'
import parser from '@typescript-eslint/parser'
import { RuleTester } from '@typescript-eslint/rule-tester'

import rule from './lodash-ramda-imports.js'

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

ruleTester.run('lodash-ramda-imports', rule, {
  valid: [
    /* ts */ `
    import * as _ from "lodash-es";
    _.isEqual(1, 1);
    import * as R from "ramda";
    R.equals(1, 1);
    `,
  ],

  invalid: [
    {
      code: /* ts */ `
        import * as _ from "lodash";
        _.isEqual(1, 1);
      `,
      errors: [
        { messageId: 'useDifferentPackage', data: { package: 'lodash-es', convertFrom: 'lodash' } },
      ],
      output: /* ts */ `
        import * as _ from "lodash-es";
        _.isEqual(1, 1);
      `,
    },

    {
      code: /* ts */ `
        import _ from "lodash-es";
        _.isEqual(1, 1);
      `,
      errors: [{ messageId: 'useNamespaceImport', data: { name: '_', package: 'lodash-es' } }],
      output: /* ts */ `
        import * as _ from "lodash-es";
        _.isEqual(1, 1);
      `,
    },

    {
      code: /* ts */ `
        import _, { isEmpty } from "lodash-es";
        _.isEqual(1, 1);
        isEmpty({});
      `,
      errors: [{ messageId: 'useNamespaceImport', data: { name: '_', package: 'lodash-es' } }],
      output: /* ts */ `
        import * as _ from "lodash-es";
        _.isEqual(1, 1);
        _.isEmpty({});
      `,
    },

    {
      code: /* ts */ `
        import lodash, { isEmpty as lodashIsEmpty } from "lodash-es";
        lodash.isEqual(1, 1);
        lodashIsEmpty({});
      `,
      errors: [{ messageId: 'useNamespaceImport', data: { name: '_', package: 'lodash-es' } }],
      output: /* ts */ `
        import * as _ from "lodash-es";
        _.isEqual(1, 1);
        _.isEmpty({});
      `,
    },

    {
      code: /* ts */ `
        import ramda, { isEmpty as ramdaIsEmpty } from "ramda";
        ramda.equals(1, 1);
        ramdaIsEmpty({});
      `,
      errors: [{ messageId: 'useNamespaceImport', data: { name: 'R', package: 'ramda' } }],
      output: /* ts */ `
        import * as R from "ramda";
        R.equals(1, 1);
        R.isEmpty({});
      `,
    },
  ],
})
