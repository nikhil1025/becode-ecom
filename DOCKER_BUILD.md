# Docker Build & Deployment Guide

## Quick Start

### Local Testing

```bash
# Build the image
docker build -t bcode-ecom:latest \
  --build-arg DATABASE_URL="postgresql://user:pass@localhost:5432/dbname" \
  .

# Run the container
docker run -d \
  --name bcode-backend \
  -p 3001:3001 \
  -e DATABASE_URL="postgresql://user:pass@localhost:5432/dbname" \
  -e JWT_SECRET="your-secret-key" \
  -e ADMIN_JWT_SECRET="your-admin-secret" \
  -e FRONTEND_URL="http://localhost:3000" \
  -e RAZORPAY_KEY_ID="your-key" \
  -e RAZORPAY_KEY_SECRET="your-secret" \
  -v $(pwd)/uploads:/app/uploads \
  bcode-ecom:latest

# View logs
docker logs -f bcode-backend

# Stop and remove
docker stop bcode-backend && docker rm bcode-backend
```

## Required Environment Variables

### Database

- `DATABASE_URL` - PostgreSQL connection string (required)

### Authentication

- `JWT_SECRET` - JWT token secret for user auth (required)
- `ADMIN_JWT_SECRET` - JWT token secret for admin auth (required)

### CORS & Frontend

- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:3000)
- `BASE_URL` - Backend base URL (default: http://localhost:3001)

### Payment Gateway

- `RAZORPAY_KEY_ID` - Razorpay API key
- `RAZORPAY_KEY_SECRET` - Razorpay API secret

### Google OAuth (Optional)

- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- `GOOGLE_CALLBACK_URL` - OAuth callback URL

### AWS S3 (Optional)

- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_S3_REGION` - S3 region (default: us-east-1)
- `AWS_S3_BUCKET` - S3 bucket name
- `AWS_S3_PUBLIC_BASE_URL` - Public S3 URL

### Email (Optional)

- `SENDGRID_API_KEY` - SendGrid API key for emails

## Build Arguments

- `DATABASE_URL` - Required during build for Prisma Client generation

## Volumes

Mount these directories for persistent data:

- `/app/uploads` - User uploaded files (avatars, products, etc.)

## Health Check

The container includes a health check at `/api/health` that runs every 30 seconds.

## Troubleshooting

### Issue: Prisma Client not found

**Solution**: Rebuild with `--no-cache`:

```bash
docker build --no-cache -t bcode-ecom:latest .
```

### Issue: Native module errors (bcrypt, sharp)

**Solution**: The Dockerfile now rebuilds native modules for Alpine Linux automatically.

### Issue: Permission denied on uploads

**Solution**: Ensure the uploads directory has correct permissions:

```bash
docker exec bcode-backend ls -la /app/uploads
```

### Issue: Database connection failed

**Solution**: Check DATABASE_URL format:

```bash
postgresql://username:password@host:port/database
```

### Issue: Container exits immediately

**Solution**: Check logs:

```bash
docker logs bcode-backend
```

## Production Deployment

### Using Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        DATABASE_URL: ${DATABASE_URL}
    ports:
      - '3001:3001'
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - ADMIN_JWT_SECRET=${ADMIN_JWT_SECRET}
      - FRONTEND_URL=${FRONTEND_URL}
      - RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID}
      - RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET}
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped
    healthcheck:
      test:
        [
          'CMD',
          'node',
          '-e',
          "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})",
        ]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
```

Run with:

```bash
docker-compose up -d
```

## Multi-Stage Build Explanation

1. **base**: Installs system dependencies and package files
2. **deps**: Installs production dependencies and rebuilds native modules
3. **builder**: Builds the application with all dev dependencies
4. **runner**: Final lightweight image with only runtime requirements

This approach reduces the final image size by ~60% compared to a single-stage build.

## Security Features

- ✅ Runs as non-root user (nestjs:nodejs)
- ✅ Multi-stage build to exclude dev dependencies
- ✅ No secrets in image layers
- ✅ Minimal Alpine Linux base
- ✅ Security-focused .dockerignore

## Performance Optimizations

- Layer caching for faster rebuilds
- Production dependencies separated from dev
- Native module rebuilds for Alpine
- npm cache cleaning after installs
- Incremental TypeScript builds
