export const runtime = 'edge'

/**
 * Forces the function to run in the IAD1 (Washington DC) region because the
 * government of Canada's website blocks requests from the EU
 * @link https://vercel.com/docs/concepts/functions/edge-functions/regions
 */
export const preferredRegion = ['iad1']

export async function GET(request) {
  const response = await fetch('https://www.spaceweather.gc.ca/forecast-prevision/short-court/zone-en.php')
  const data = await response.text()
  return new Response(data, {
    status: 200,
    headers: { 'content-type': 'text/html' }
  })
}
