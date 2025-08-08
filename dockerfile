FROM node:18-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Ensure SQLite directory exists if using sqlite
RUN mkdir -p /app/data

ENV NODE_ENV=production

CMD ["node", "src/index.js"]