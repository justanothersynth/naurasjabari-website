# Build stage
FROM node:16.13.0-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build Nuxt 2 for SPA mode
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built Nuxt app to nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3457

CMD ["nginx", "-g", "daemon off;"]
