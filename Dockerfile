# ── Build stage: compile the engine, API, and web bundle ─────────────
FROM node:22-alpine AS build
WORKDIR /app

# Install with only manifests first, so dependency layers cache across code changes
COPY package.json package-lock.json ./
COPY packages/standings-engine/package.json packages/standings-engine/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci

COPY tsconfig.base.json ./
COPY packages ./packages
COPY apps ./apps
RUN npm run build && npm test

# ── Runtime stage: API + static web bundle, production deps only ─────
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/standings-engine/package.json packages/standings-engine/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/packages/standings-engine/dist packages/standings-engine/dist
COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/apps/web/dist apps/web/dist

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://localhost:3000/healthz || exit 1

USER node
CMD ["node", "apps/api/dist/server.js"]
