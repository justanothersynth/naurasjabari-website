import { defineNuxtConfig } from 'nuxt/config'
import tailwindcss from '@tailwindcss/vite'
import * as dotenv from 'dotenv'
import { existsSync } from 'fs'
import { resolve } from 'path'

const envPath = resolve(process.cwd(), '.env.local')
const defaultEnvPath = resolve(process.cwd(), '.env')

dotenv.config({
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
      tailwindcss()
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
      htmlAttrs: {
        lang: 'en'
      },
      title: 'Nauras Jabari',
      meta: [
        { name: 'msapplication-config', content: '/favicon/light/browserconfig.xml' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon/light/favicon-96x96.png' },
        { rel: 'manifest', href: '/favicon/light/manifest.json' }
      ]
    }
  },
  css: [
    '@/assets/css/main.css'
  ],
  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/icon',
    '@nuxt/image',
    'motion-v/nuxt'
  ],
  icon: {
    serverBundle: {
      collections: ['iconoir', 'fluent']
    }
  }
})
