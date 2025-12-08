# ===========================================
# Multi-stage build for Next.js (OPTIMIZED)
# For VPS with limited resources (1 vCPU, 4GB RAM)
# ===========================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install only production dependencies first for better caching
COPY package.json package-lock.json* ./

# Optimized install for CI/CD - faster and uses less memory
RUN npm ci --prefer-offline --no-audit --no-fund --loglevel=error 2>/dev/null || \
    npm install --legacy-peer-deps --no-audit --no-fund --loglevel=error

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Optimizations for low-resource servers
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Limit memory to prevent OOM on small VPS
ENV NODE_OPTIONS="--max-old-space-size=1536"

# Build with standalone output (CRITICAL for small images)
RUN npm run build

# Stage 3: Runner (MINIMAL - only what's needed to run)
FROM node:20-alpine AS runner
WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"
ENV PORT=3001

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy ONLY the standalone build (much smaller than full node_modules)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Expose port
EXPOSE 3001

# Use node directly instead of npm (faster startup)
CMD ["node", "server.js"]
