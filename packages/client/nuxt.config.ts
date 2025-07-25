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
      supabaseKey: process.env.SUPABASE_KEY,
      clerk: {
        publishableKey: process.env.NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY
      }
    },
    clerk: {
      secretKey: process.env.NUXT_CLERK_SECRET_KEY
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
          api: 'modern',
          additionalData: `
            @use 'sass:math';
            @use '@/assets/scss/utilities.scss' as *;
            @use '@/assets/scss/x-browser.scss' as *;
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
        { name: 'msapplication-config', content: '/favicon/light/browserconfig.xml?v=0' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon/light/favicon-96x96.png?v=0' },
        { rel: 'manifest', href: '/favicon/light/manifest.json?v=0' }
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
    'motion-v/nuxt',
    '@clerk/nuxt'
  ],
  icon: {
    serverBundle: {
      collections: ['iconoir', 'fluent']
    }
  },
  // @ts-expect-error - Looks like some Clerk types (proxyUrl) are not compatible with @clerk/nuxt module
  clerk: {
    publishableKey: process.env.NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    skipServerMiddleware: true,
    ...(env !== 'development' ? {
      domain: process.env.CLERK_DOMAIN,
      proxyUrl: process.env.CLERK_PROXY_URL
    } : {})
  }
})
