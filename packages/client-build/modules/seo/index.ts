import { defineNuxtModule, useLogger } from '@nuxt/kit'
import { writeFileSync } from 'fs'
import { join } from 'path'
import type { Nuxt } from 'nuxt/schema'

export interface ModuleOptions {
  siteUrl?: string
  defaultChangefreq?: string
  defaultPriority?: number
  robotsDisallow?: string[]
  robotsUserAgent?: string
}

const meta = {
  name: 'seo',
  configKey: 'seo'
}

const defaults = {
  defaultChangefreq: 'monthly',
  defaultPriority: 1.0,
  robotsDisallow: [],
  robotsUserAgent: '*'
}

const setup = (options: ModuleOptions, nuxt: Nuxt) => {
  const logger = useLogger('sitemap')

  // Get site URL from runtime config or options
  const getSiteUrl = (): string => {
    return options.siteUrl || nuxt.options.runtimeConfig.public.siteUrl as string
  }

  // Generate sitemap XML content
  const generateSitemap = (): string => {
    const siteUrl = getSiteUrl()
    const today = new Date().toISOString().split('T')[0]
    
    // Get all pages from the pages directory
    const routes = ['/'] // Default to homepage
    
    // TODO: extend this to scan pages directory dynamically
    // For now, we'll keep it simple with just the homepage
    
    const urlEntries = routes.map(route => {
      const url = `${siteUrl}${route === '/' ? '' : route}`
      return `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${options.defaultChangefreq}</changefreq>
    <priority>${options.defaultPriority}</priority>
  </url>`
    }).join('\n')

    return `<?xml version='1.0' encoding='UTF-8'?>
<urlset xmlns='http://www.sitemaps.org/schemas/sitemap/0.9'>
${urlEntries}
</urlset>\n`
  }

  // Generate robots.txt content
  const generateRobotsTxt = (): string => {
    const siteUrl = getSiteUrl()
    const disallowRules = options.robotsDisallow && options.robotsDisallow.length > 0
      ? options.robotsDisallow.map(path => `Disallow: ${path}`).join('\n')
      : 'Disallow:'
    
    return `User-agent: ${options.robotsUserAgent}
${disallowRules}
Sitemap: ${siteUrl}/sitemap.xml\n`
  }

  // Write sitemap to public directory
  const writeSitemap = () => {
    try {
      const sitemapContent = generateSitemap()
      const sitemapPath = join(nuxt.options.dir.public, 'sitemap.xml')
      
      writeFileSync(sitemapPath, sitemapContent, 'utf-8')
      logger.success(`Sitemap generated at ${sitemapPath}`)
    } catch (error) {
      logger.error('Failed to generate sitemap:', error)
    }
  }

  // Write robots.txt to public directory
  const writeRobotsTxt = () => {
    try {
      const robotsContent = generateRobotsTxt()
      const robotsPath = join(nuxt.options.dir.public, 'robots.txt')
      
      writeFileSync(robotsPath, robotsContent, 'utf-8')
      logger.success(`robots.txt generated at ${robotsPath}`)
    } catch (error) {
      logger.error('Failed to generate robots.txt:', error)
    }
  }

  // Generate on build
  nuxt.hook('build:done', () => {
    logger.info('Generating meta files...')
    writeSitemap()
    writeRobotsTxt()
  })
}

export default defineNuxtModule<ModuleOptions>({
  meta,
  defaults,
  setup
})
