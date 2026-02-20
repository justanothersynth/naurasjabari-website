# Build stage
FROM node:16.13.0-alpine AS build

WORKDIR /app

# Add build arguments
ARG BACKEND_URL
ARG NODE_ENV
ARG SERVER_ENV

# Make them available as environment variables during build
ENV BACKEND_URL=$BACKEND_URL
ENV NODE_ENV=$NODE_ENV
ENV SERVER_ENV=$SERVER_ENV

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
