import { defineNuxtConfig } from 'nuxt/config'
import tailwindcss from '@tailwindcss/vite'
import * as dotenv from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const envPath = resolve(process.cwd(), '.env.local')
const defaultEnvPath = resolve(process.cwd(), '.env')

dotenv.config({
  quiet: true,
  path: existsSync(envPath) ? envPath : defaultEnvPath
})

const env = process.env.SERVER_ENV

const baseUrls = {
  api: process.env.API_URL,
  client: process.env.SITE_URL
}

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  alias: {
    '@workspace/types': resolve(__dirname, '../types')
  },
  runtimeConfig: {
    public: {
      serverEnv: env,
      ls: {
        prefix: 'naurasjabari-website-v1__'
      },
      siteUrl: baseUrls.client,
      apiUrl: baseUrls.api,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY
    }
  },
  devServer: {
    port: Number(process.env.PORT),
    host: 'localhost',
    https: {
      key: '../../localhost_key.pem',
      cert: '../../localhost_cert.pem'
    }
  },
  vite: {
    plugins: [
      tailwindcss() as any
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use 'sass:math';
            @use '@/assets/scss/utilities.scss' as *;
            @use '@/assets/scss/x-browser.scss' as *;
            @use '@/assets/scss/responsive.scss' as *;
          `
        }
      }
    },
    assetsInclude: ['**/*.md']
  },
  app: {
    head: {
      title: 'Nauras Jabari',
      meta: [
        { name: 'msapplication-config', content: '/favicon/dark/browserconfig.xml?v=0' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon/dark/favicon-96x96.png?v=0' },
        { rel: 'manifest', href: '/favicon/dark/manifest.json?v=0' }
      ],
      script: [
        ...(env === 'production' ? [{
          src: 'https://analytics.naurasjabari.com/script.js', defer: true, 'data-website-id': 'b1884ce3-3c92-4693-a216-d564f7ad24b4'
        }] : [])
      ]
    }
  },
  css: [
    '@/assets/css/main.css'
  ],
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/icon',
    'motion-v/nuxt'
  ],
  icon: {
    serverBundle: {
      collections: ['iconoir', 'fluent']
    }
  }
})
