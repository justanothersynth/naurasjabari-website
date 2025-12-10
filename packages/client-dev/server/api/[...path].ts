/**
 * Proxy route that forwards all /api/* requests to the backend API.
 * This resolves HTTP/HTTPS mixed content issues in development.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const path = event.path.replace(/^\/api/, '')
  const targetUrl = `${config.public.apiUrl}${path}`

  return proxyRequest(event, targetUrl)
})
