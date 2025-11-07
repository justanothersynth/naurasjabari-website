import { createConfigForNuxt } from '@nuxt/eslint-config/flat'
import tsdoc from 'eslint-plugin-tsdoc'

export default createConfigForNuxt({
  features: {
    tooling: true
  }
}).append(
  {
    files: ['**/*.vue', '**/*.js', '**/*.ts'],
    plugins: {
      tsdoc
    },
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        project: './tsconfig.json'
      }
    },
    rules: {
      semi: ['error', 'never'],
      quotes: ['error', 'single'],
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
      'tsdoc/syntax': 'error',
      // Disable JSDoc nested param check (conflicts with TSDoc)
      'jsdoc/check-param-names': 'off'
    }
  },
  {
    files: ['nuxt.config.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }
)
