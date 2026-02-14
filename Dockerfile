FROM node:22-slim AS base

# --- Build stage ---
FROM base AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Production stage ---
FROM base

WORKDIR /app

COPY --from=build /app/.output .output
COPY --from=build /app/node_modules/.package-lock.json .package-lock.json

# better-sqlite3 native addon is bundled in .output by Nitro,
# but we need the shared lib at runtime
COPY --from=build /app/node_modules/better-sqlite3 node_modules/better-sqlite3

# Persistent data directory for SQLite + uploads
VOLUME /app/.data

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
