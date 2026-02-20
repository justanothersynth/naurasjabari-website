import { defineConfig } from 'vitest/config'

export default defineConfig({
  envDir: '../..',
  test: {
    globals: true,
    environment: 'node',
    pool: 'forks',
    env: {
      TZ: 'America/Toronto'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'logs/*',
        '**/*.config.ts',
        '**/*.config.mjs',
        '**/*.types.ts',
        '**/index.ts',
        '**/*.test.ts',
        'api/**/*'
      ]
    }
  }
})
