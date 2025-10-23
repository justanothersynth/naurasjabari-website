import { defineNuxtPlugin, useHead } from '#imports'
import type { SeoData, SeoEntry } from '@@/modules/seo/types'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

/**
 * Get SEO data from the /data/seo.json file and handle if file is not found
 */
const getSeoData = async (): Promise<SeoData | null> => {
  const seoDataFiles = import.meta.glob('/data/seo.json', { eager: false })
  if (!seoDataFiles['/data/seo.json']) {
    if (import.meta.server) {
      // eslint-disable-next-line no-console
      console.warn('SEO data file not found, skipping SEO setup. Add a /data/seo.json file to enable SEO. Refer to the README.md for more information.')
    }
    return null
  }
  const seoDataModule = await seoDataFiles['/data/seo.json']() as { default?: SeoData } | SeoData
  return (seoDataModule as { default?: SeoData }).default || seoDataModule as SeoData
}

/**
 * Get the default SEO entry from the SEO data. This is the entry that will be used if no key is provided.
 * @param seoData - The SEO data
 * @returns The default SEO entry
 */
const getDefaultSeoEntry = (seoData: SeoData): SeoEntry | null => {
  const defaultSeoEntry = seoData._
  if (!defaultSeoEntry) {
    if (import.meta.server) {
      // eslint-disable-next-line no-console
      console.warn('Default SEO entry not found, skipping SEO setup. Add a _ key to the /data/seo.json file to enable SEO. Refer to the README.md for more information.')
    }
    return null
  }
  return defaultSeoEntry
}

/**
 * Apply an override to the SEO data
 * @param entry - This is the entry that will be overridden by the override object.
 * @param override - The override object that will override values in the entry object.
 * @returns The SEO data with the override applied
 */
const applyOverride = (entry: SeoEntry, override?: Partial<SeoEntry>): SeoEntry => {
  if (entry && override) {
    for (const key in entry) {
      if (override.hasOwnProperty(key)) {
        const entryValue = entry[key]
        const overrideValue = override[key]
        if (typeof entryValue === 'string' && entryValue.includes(`|${key}|`)) {
          entry[key] = entryValue.replaceAll(`|${key}|`, String(overrideValue))
        } else {
          entry[key] = overrideValue
        }
      }
    }
  }
  return entry
}

const compileData = (entry: SeoEntry, config: ReturnType<typeof useRuntimeConfig>, route: RouteLocationNormalizedLoaded) => {
  const siteUrl = config.public.siteUrl
  const url = siteUrl + route.path
  const ogImage = entry.ogImage ? siteUrl + entry.ogImage : undefined
  const description = entry.description
  const title = entry.title
  const siteName = entry.siteName
  const schemaType = entry.schemaOrgData?.['@type'] || 'WebSite'
  const schemaOrgData = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: title,
    abstract: description,
    mainEntity: {
      '@type': schemaType,
      name: title,
      url
    },
    image: ogImage,
    url
  }
  return {
    title,
    meta: [
      { name: 'description', content: description },
      { hid: 'og:title', property: 'og:title', content: title },
      { hid: 'og:description', property: 'og:description', content: description },
      { hid: 'og:site_name', property: 'og:site_name', content: siteName },
      { hid: 'og:url', property: 'og:url', content: url },
      { hid: 'og:type', property: 'og:type', content: entry.ogType },
      { hid: 'og:image', property: 'og:image', content: ogImage },
      { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
      { hid: 'twitter:title', name: 'twitter:title', content: title },
      { hid: 'twitter:description', name: 'twitter:description', content: description },
      { hid: 'twitter:image', name: 'twitter:image', content: ogImage }
    ],
    link: [
      { rel: 'canonical', href: url },
      { rel: 'alternate', hreflang: 'en', href: url },
      { rel: 'alternate', hreflang: 'x-default', href: url }
    ],
    script: [{ innerHTML: JSON.stringify(schemaOrgData), type: 'application/ld+json' }]
  }
}

/**
 * Entrypoint for SEO plugin
 * @param seoData - Preloaded SEO data
 * @param config - The runtime config object
 * @param route - The current route object
 * @param key - The key of the SEO data to use, must match the key in the /data/seo.json file. If no key is provided, the default SEO data will be used.
 * @param override - An optional override object to merge with the SEO data that will override the data in the /data/seo.json file
 */
const seo = (seoData: SeoData | null, config: ReturnType<typeof useRuntimeConfig>, route: RouteLocationNormalizedLoaded, key?: string, override?: Partial<SeoEntry>): void => {
  if (!seoData) return
  // Get the default SEO entry
  const defaultSeoEntry = getDefaultSeoEntry(seoData)
  if (!defaultSeoEntry) return
  // Get the entry and apply any overrides and defaults
  let entry = (key ? seoData[key] : undefined) || defaultSeoEntry
  entry = applyOverride(entry, override)
  // Add schema.org data to the entry
  entry = Object.assign({ schemaOrgData: {} }, defaultSeoEntry, entry)
  // Compile head
  const data = compileData(entry, config, route)
  useHead(data)
}

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  const route = useRoute()
  // Preload SEO data once at plugin initialization
  const seoData = await getSeoData()
  seo(seoData, config, route)
  return {
    provide: {
      seo: (key?: string, override?: Partial<SeoEntry>) => seo(seoData, config, route, key, override)
    }
  }
})
