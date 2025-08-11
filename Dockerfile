# BorderlessBits.com - Development Optimized Dockerfile
# Multi-stage build for development with hot reloading support

# ==========================================
# Base Stage - Node.js setup
# ==========================================
FROM node:18-alpine AS base

# Install security updates and necessary tools
RUN apk update && apk upgrade && apk add --no-cache \
    git \
    curl \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy package files
COPY package*.json ./

# ==========================================
# Dependencies Stage
# ==========================================
FROM base AS deps

# Install all dependencies (including dev dependencies for development)
RUN npm ci --only=production && npm cache clean --force
RUN npm ci && npm cache clean --force

# ==========================================
# Development Stage - Hot reloading enabled
# ==========================================
FROM base AS development

# Copy dependencies from deps stage
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy source code
COPY --chown=nextjs:nodejs . .

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Development command with hot reloading
CMD ["npm", "run", "dev"]

# ==========================================
# Build Stage - Production build
# ==========================================
FROM base AS builder

# Copy dependencies and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# ==========================================
# Production Stage - Minimal runtime
# ==========================================
FROM nginx:alpine AS production

# Install security updates
RUN apk update && apk upgrade && \
    rm -rf /var/cache/apk/*

# Copy built static files
COPY --from=builder /app/out /usr/share/nginx/html

# Copy custom nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Create non-root user for nginx
RUN adduser -D -s /bin/sh nginx-user

# Set proper permissions
RUN chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Switch to non-root user
USER nginx-user

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# ==========================================
# CI Stage - Optimized for CI/CD
# ==========================================
FROM base AS ci

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set CI environment
ENV CI=true
ENV NODE_ENV=test

# Switch to non-root user
USER nextjs

# Default command for CI (can be overridden)
CMD ["npm", "run", "validate-build"]