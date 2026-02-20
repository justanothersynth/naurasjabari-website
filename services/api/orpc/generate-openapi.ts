import { OpenAPIGenerator } from '@orpc/openapi'
import { ZodToJsonSchemaConverter } from '@orpc/zod'
import { router } from './router'

const generator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()]
})

const spec = await generator.generate(router, {
  info: {
    title: 'API',
    version: '1.0.0'
  }
})

// TODO: Output to a file, or remove the other logging so it can easily be piped
/* eslint-disable-next-line */
console.log(JSON.stringify(spec, null, 2))
