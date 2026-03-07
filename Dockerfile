# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY src/package.json src/package-lock.json* ./
RUN npm install

COPY src/ .
RUN npm run build

# ---- Production stage ----
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

COPY --from=builder /app/package.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

USER appuser

EXPOSE 3000

CMD ["node", "dist/server/index.js"]
