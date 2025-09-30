import { createConfigForNuxt } from '@nuxt/eslint-config/flat'
import withNuxt from './.nuxt/eslint.config.mjs'
import tsdoc from 'eslint-plugin-tsdoc'

export default withNuxt(
  await createConfigForNuxt(),
  {
    files: ['**/*.vue', '**/*.js', '**/*.ts'],
    plugins: {
      tsdoc
    },
    rules: {
      'no-console': process.env.NODE_ENV !== 'development' ? 'error' : 'off',
      'vue/html-closing-bracket-newline': ['error', {
        singleline: 'never',
        multiline: 'never'
      }],
      'vue/multiline-html-element-content-newline': 'off',
      'vue/singleline-html-element-content-newline': ['error', {
        ignoreWhenNoAttributes: true,
        ignores: ['th', 'td', 'span', 'label', 'pre', 'code']
      }],
      'no-trailing-spaces': ['error', {
        skipBlankLines: true
      }],
      'vue/html-self-closing': 'off',
      'vue/no-v-html': 'off',
      'no-lonely-if': 'off',
      'no-new': 'off',
      'no-prototype-builtins': 'off',
      'promise/param-names': 'off',
      'multiline-ternary': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/max-attributes-per-line': ['error', {
        singleline: {
          max: 3
        }
      }],
      'vue/no-v-for-template-key': 'off',
      'vue/no-v-for-template-key-on-child': 'error',
      // TSDoc rules
      'tsdoc/syntax': 'error'
    }
  }
)
