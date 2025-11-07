# ================================
# Stage 1: Build
# ================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production --legacy-peer-deps

# ================================
# Stage 2: Production
# ================================
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy package files
COPY package*.json ./

# Copy production node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy compiled code from builder stage
COPY --from=builder /app/dist ./dist

# Copy scripts directory (includes docker-entrypoint.sh)
COPY --chown=nestjs:nodejs scripts ./scripts

# Copy .env.example for reference (actual .env comes from Dokploy)
COPY .env.example ./

# Make entrypoint script executable
RUN chmod +x /app/scripts/docker-entrypoint.sh

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly and run entrypoint script
ENTRYPOINT ["dumb-init", "--", "/app/scripts/docker-entrypoint.sh"]

# Start application (passed to entrypoint script)
CMD ["node", "dist/main.js"]
