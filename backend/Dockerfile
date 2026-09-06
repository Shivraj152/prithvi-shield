FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/src/db/schema.sql ./dist/db/schema.sql
COPY --from=builder /usr/src/app/src/db/seed.sql ./dist/db/seed.sql

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
