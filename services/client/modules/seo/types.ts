export interface SeoSchemaOrgData {
  '@type'?: string
  [key: string]: unknown
}

export interface SeoEntry {
  title: string
  description?: string
  siteName?: string
  ogImage?: string
  ogType?: string
  schemaOrgData?: SeoSchemaOrgData
  [key: string]: unknown
}

export interface SeoData {
  _: SeoEntry
  [key: string]: SeoEntry | undefined
}
