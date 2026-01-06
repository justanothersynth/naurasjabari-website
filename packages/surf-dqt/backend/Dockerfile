FROM node:16.13.0-alpine

WORKDIR /app

# Install MongoDB tools for mongodump (used by archiver cron)
RUN apk add --no-cache mongodb-tools

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3458

# Healthcheck to ensure the server is responding
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "const isProd = process.env.NODE_ENV === 'production'; const url = isProd ? 'https://works.naurasjabari.com/surf-dqt/' : 'http://localhost:3458'; const proto = isProd ? require('https') : require('http'); proto.get(url, (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "app.js"]
