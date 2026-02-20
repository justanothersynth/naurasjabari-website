# API Gateway with oRPC

A modern Express.js API Gateway built with TypeScript, oRPC, and Zod validation.

## Quick Start

### Installation

```bash
bun install
```

### Development

```bash
bun run dev
```

### Production

```bash
bun run build
bun run start
```

## Testing

Run the test suite:

```bash
bun run test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## API Endpoints

### Health Check
```bash
curl http://localhost:20040/health
```


### OpenAPI

When running the `api` server, a [Scalar](https://scalar.com/) OpenAPI playground will be rendered at the root of the `/oapi` route. Load it in a browser to explore available routes. 

Note: You'll need an API key in order to make requests. To do this, you need to execute the following, with the proper environment variables in your env file.

```bash
bun utils/generate-internal-jwt.ts
```


Place the resulting key in your header, as in the example `curl` below:
```bash
curl --request POST \
  --url http://localhost:20040/oapi/<path> \
  --header 'Authorization: Bearer key' \
  --header 'Content-Type: application/json' \
  --data '{
"status": "hello"
}'
```
