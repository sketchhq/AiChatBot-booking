FROM docker.io/node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Safe for 1GB server
ENV NODE_OPTIONS=--max-old-space-size=768

RUN npm run build


FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

ENV NODE_ENV=production
ENV PORT=8080

# Also apply for runtime
ENV NODE_OPTIONS=--max-old-space-size=768

EXPOSE 8080

CMD ["node", "dist/src/main.js"]