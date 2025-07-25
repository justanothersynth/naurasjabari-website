// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['dist/**/*', 'eslint.config.mjs', 'jest.config.js']
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  {
    rules: {
      semi: ['error', 'never'],
      quotes: ['error', 'single'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' }
      ],
      'no-console': process.env.NODE_ENV !== 'development' ? 'error' : 'off',
      'no-trailing-spaces': ['error', {
        skipBlankLines: true
      }],
      'no-lonely-if': 'off',
      'no-new': 'off',
      'no-prototype-builtins': 'off',
      'promise/param-names': 'off',
      'multiline-ternary': 'off'
    }
  }
) 
