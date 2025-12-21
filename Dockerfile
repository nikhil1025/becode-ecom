# =====================================
# Backend Dockerfile - NestJS + Prisma
# Build Context: /bcode-ecom ONLY
# =====================================

# Stage 1: Base dependencies
FROM node:20-alpine AS base

# Install all system dependencies needed for native modules
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    openssl-dev \
    python3 \
    make \
    g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# =====================================
# Stage 2: Production dependencies
# =====================================
FROM base AS deps

# Install production dependencies (INCLUDE prisma - needed for migrations)
RUN npm ci --only=production && \
    npm cache clean --force

# Rebuild native modules for alpine (only if they exist)
RUN npm rebuild bcrypt --build-from-source 2>/dev/null || true
RUN npm rebuild sharp --build-from-source 2>/dev/null || true

# =====================================
# Stage 3: Build application
# =====================================
FROM base AS builder

# Accept DATABASE_URL as build argument
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Install ALL dependencies (including dev)
RUN npm ci && npm cache clean --force

# Copy prisma schema BEFORE generating
COPY prisma ./prisma/

# Generate Prisma Client with binary targets for alpine
RUN npx prisma generate

# Copy source code
COPY . .

# Build NestJS application
RUN npm run build

# Verify build output exists
    RUN ls -la dist/ && test -f dist/main.js
# =====================================
# Stage 4: Production runtime
# =====================================
FROM node:20-alpine AS runner

# Install ONLY runtime dependencies
RUN apk add --no-cache \
    openssl \
    libc6-compat \
    libgcc \
    libstdc++

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3001

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy package.json for reference
COPY --from=builder /app/package*.json ./

# Copy production dependencies (includes prisma and native modules)
COPY --from=deps /app/node_modules ./node_modules

# Copy Prisma schema and migrations
COPY --from=builder /app/prisma/ ./prisma/

# Copy generated Prisma Client (CRITICAL!)
COPY --from=builder /app/node_modules/.prisma/ ./node_modules/.prisma/
COPY --from=builder /app/node_modules/@prisma/ ./node_modules/@prisma/

# Copy built application
COPY --from=builder /app/dist/ ./dist/

# Create uploads directories with proper permissions
RUN mkdir -p \
    /app/uploads/products \
    /app/uploads/avatars \
    /app/uploads/brands \
    /app/uploads/categories \
    /app/uploads/returns && \
    chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose backend port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node -e "require('http').get('http://65.2.146.90:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start command with inline Prisma setup
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && node dist/main"]
