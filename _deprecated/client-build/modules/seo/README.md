# SEO Module

A custom Nuxt module that automatically generates `sitemap.xml` and `robots.txt` for your website.

## Features
- ✅ Outputs to public directory for easy access

**sitemap.xml**
- ✅ Generates sitemap.xml automatically when dev server starts
- ✅ Generates sitemap.xml during build process
- ✅ Generates robots.txt automatically when dev server starts
- ✅ Generates robots.txt during build process
- ✅ Configurable site URL, change frequency, and priority

**robots.txt**
- ✅ Configurable robots.txt rules (user-agent, disallow paths)

## Configuration

The module is configured in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: [
    ['~/modules/seo', {
      siteUrl: 'https://example.com',
      defaultChangefreq: 'monthly',
      defaultPriority: 1.0,
      robotsUserAgent: '*',
      robotsDisallow: [] // e.g., ['/admin', '/api/*']
    }]
  ]
})
```

## Options

### Sitemap Options
- `siteUrl` (string): The base URL of your website. Falls back to `runtimeConfig.public.siteUrl`
- `defaultChangefreq` (string): How frequently the page changes. Default: `'monthly'`
- `defaultPriority` (number): Priority of the URL. Default: `1.0`

### Robots.txt Options
- `robotsUserAgent` (string): The user-agent to target. Default: `'*'` (all bots)
- `robotsDisallow` (string[]): Array of paths to disallow. Default: `[]` (allow all)

## How it Works

The module hooks into Nuxt's lifecycle at three points:

1. **On module setup** - Generates initial sitemap and robots.txt
2. **On dev server start** (`listen` hook) - Regenerates when dev server is ready
3. **On build completion** (`build:done` hook) - Generates final files for production

The generated files are always placed in the `public` directory:
- `public/sitemap.xml` → accessible at `https://yourdomain.com/sitemap.xml`
- `public/robots.txt` → accessible at `https://yourdomain.com/robots.txt`

## Generated Output

### sitemap.xml

The module creates a standard XML sitemap format:

```xml
<?xml version='1.0' encoding='UTF-8'?>
<urlset xmlns='http://www.sitemaps.org/schemas/sitemap/0.9'></urlset>
  <url>
    <loc>https://example.com</loc>
    <lastmod>2025-10-08</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

### robots.txt

The module generates a robots.txt file with sitemap reference:

```
User-agent: *
Disallow:
Sitemap: https://example.com/sitemap.xml
```

If you specify disallowed paths:

```typescript
robotsDisallow: ['/admin', '/api/*']
```

The output will be:

```
User-agent: *
Disallow: /admin
Disallow: /api/*
Sitemap: https://example.com/sitemap.xml
```

## Examples

### Block specific paths from crawlers

```typescript
['~/modules/seo', {
  siteUrl: 'https://example.com',
  robotsDisallow: ['/admin', '/private', '/api/*']
}]
```

### Allow everything (default)

```typescript
['~/modules/seo', {
  siteUrl: 'https://example.com',
  robotsDisallow: []
}]
```

### Block all crawlers

```typescript
['~/modules/seo', {
  siteUrl: 'https://example.com',
  robotsDisallow: ['/']
}]
```

## Future Enhancements

Potential improvements:

- Auto-discover routes from the `pages` directory
- Support for dynamic routes
- Custom route configuration
- Multi-language sitemap support
- Sitemap index for large sites
- Multiple user-agent rules in robots.txt
- Crawl-delay configuration
