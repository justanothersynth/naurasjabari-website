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
      apiUrl: baseUrls.api
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
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        { name: 'msapplication-config', content: '/favicon/dark/browserconfig.xml' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon/dark/favicon-96x96.png' },
        { rel: 'manifest', href: '/favicon/dark/manifest.json' }
      ],
      script: [
        ...(env === 'production' ? [{
          src: 'https://analytics.naurasjabari.com/script.js', defer: true, 'data-website-id': 'cab27dd2-0288-4086-bf95-848b177149b8'
        }] : [])
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
    'motion-v/nuxt',
    ['@@/modules/seo', {
      siteUrl: baseUrls.client,
      defaultChangefreq: 'monthly',
      defaultPriority: 1.0,
      robotsUserAgent: '*',
      robotsDisallow: []
    }]
  ],
  icon: {
    serverBundle: {
      collections: ['iconoir', 'fluent']
    }
  }
})
