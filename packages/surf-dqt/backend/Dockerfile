FROM node:16.13.0-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3458

CMD ["node", "app.js"]
