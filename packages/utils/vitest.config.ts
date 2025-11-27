import { defineConfig } from 'vitest/config'

export default defineConfig({
  envDir: '../..',
  test: {
    globals: true,
    environment: 'node',
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.ts',
        '**/*.config.mjs',
        '**/*.types.ts',
        '**/*.test.ts',
        '**/index.ts'
      ]
    }
  }
})
