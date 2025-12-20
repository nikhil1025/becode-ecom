# =====================================
# Backend Dockerfile - NestJS + Prisma
# Build Context: /bcode-ecom ONLY
# =====================================

# Stage 1: Base dependencies
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# =====================================
# Stage 2: Production dependencies
# =====================================
FROM base AS deps

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# =====================================
# Stage 3: Build application
# =====================================
FROM base AS builder

# Install all dependencies (including dev)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build NestJS application
RUN npm run build

# =====================================
# Stage 4: Production runtime
# =====================================
FROM node:20-alpine AS runner

# Install runtime dependencies
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy built application and Prisma files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# Create uploads directory with proper permissions
RUN mkdir -p /app/uploads/products \
    /app/uploads/avatars \
    /app/uploads/brands \
    /app/uploads/categories \
    /app/uploads/returns && \
    chown -R nestjs:nodejs /app/uploads

# Switch to non-root user
USER nestjs

# Expose backend port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start command: Generate Prisma → Run Migrations → Start App
# .env file MUST exist before this runs (created by deployment script)
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && node dist/main"]
