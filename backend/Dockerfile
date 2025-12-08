# ===========================================
# NestJS Backend (OPTIMIZED for small VPS)
# 1 vCPU, 4GB RAM compatible
# ===========================================

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Limit memory for build
ENV NODE_OPTIONS="--max-old-space-size=1024"

# Copy package files first (better layer caching)
COPY package*.json ./

# Install dependencies - CI mode is faster
RUN npm ci --legacy-peer-deps --prefer-offline --no-audit --no-fund --loglevel=error 2>/dev/null || \
    npm install --legacy-peer-deps --no-audit --no-fund --loglevel=error

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Prune dev dependencies to reduce size
RUN npm prune --production --legacy-peer-deps

# Stage 2: Production (minimal)
FROM node:20-alpine AS production
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy only what's needed to run
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./
COPY --chown=nestjs:nodejs scripts ./scripts

# Make entrypoint executable
RUN chmod +x /app/scripts/docker-entrypoint.sh

USER nestjs

EXPOSE 3000

# Simplified healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

ENTRYPOINT ["dumb-init", "--", "/app/scripts/docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
