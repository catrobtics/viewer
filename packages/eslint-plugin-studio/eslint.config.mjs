import antfu from '@antfu/eslint-config'
import studioPlugin from './index.js'

export default antfu({
  ignores: [
    'node_modules',
    'dist',
    '**/*.md',
    'packages/mcap-support/src/fixtures/byte-vector.ts',
    'packages/message-path/src/grammar.generated.ts',
  ],
  rules: {
    'no-console': 'off',
    'style/multiline-ternary': 'off',
    'prefer-promise-reject-errors': 'off',
    'jsdoc/require-returns-description': 'off',
    'ts/method-signature-style': 'off',
    'ts/no-unsafe-function-type': 'off',
    'no-unreachable-loop': 'off',
    'eqeqeq': 'off',
    'no-cond-assign': 'off',
    'no-sequences': 'off',
    'default-case-last': 'off',
    'style/max-statements-per-line': 'off',
    'ts/no-non-null-asserted-optional-chain': 'off',
    'style/jsx-closing-tag-location': 'off',
    'pnpm/yaml-enforce-settings': 'off',
    'ts/no-use-before-define': 'off',
    'ts/no-explicit-any': 'error',
    'jsdoc/check-param-names': 'off',
    'jsdoc/check-alignment': 'off',
    'jsdoc/require-returns-check': 'off',
  },
}, {
  plugins: {
    '@catrobotics/studio': studioPlugin,
  },
  rules: {
    '@catrobotics/studio/link-target': 'error',
    '@catrobotics/studio/lodash-ramda-imports': 'error',
    '@catrobotics/studio/no-map-type-argument': 'error',
    '@catrobotics/studio/ramda-usage': 'error',
  },
})
