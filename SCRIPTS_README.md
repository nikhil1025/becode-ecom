# Deployment & Fix Scripts

## Scripts Overview

### 🚀 Deployment Scripts

#### `deploy.sh`

Main production deployment script with health checks and rollback capability.

```bash
# Deploy to production
./deploy.sh deploy

# Rollback to previous version
./deploy.sh rollback

# View logs
./deploy.sh logs

# Check status
./deploy.sh status
```

#### `startup.sh`

Container startup script that runs:

1. Prisma Client generation
2. Database migrations
3. Application startup

**Note:** This runs automatically in the Docker container.

#### `prisma-migrate-safe.sh`

Safe migration script used during deployment. Handles:

- Prisma Client regeneration
- Migration status checking
- Migration deployment

### 🔧 Fix & Verification Scripts

#### `fix-production.sh` ⭐

**Use this to fix the current production issue!**

Quick fix script that regenerates Prisma Client in the running container.

```bash
# Run on production server
./fix-production.sh
```

This fixes:

- "Database operation failed" errors
- Missing model errors (socialMedia, appLogo)
- Outdated Prisma Client issues

#### `verify-production.sh`

Tests production API endpoints to verify they're working.

```bash
# Test production (default)
./verify-production.sh

# Test different environment
./verify-production.sh https://api.example.com
```

Checks:

- Health endpoint
- Social media public endpoint
- App logo public endpoint
- Authentication on protected endpoints

## Quick Start

### First Time Setup

```bash
# Make scripts executable
chmod +x *.sh

# Check environment
cp .env.example .env
# Edit .env with your values

# Deploy
./deploy.sh deploy
```

### Fix Production Issue

```bash
# On production server
ssh production-server
cd /path/to/bcode-ecom
./fix-production.sh
```

### Verify Everything Works

```bash
./verify-production.sh https://api.themingkart.com
```

## Common Issues

### Issue: "Database operation failed"

**Solution:** Run `./fix-production.sh` on production

### Issue: Migrations failing

**Solution:** Check logs with `./deploy.sh logs`

### Issue: Container won't start

**Solution:**

```bash
docker logs bcode-backend
./deploy.sh rollback  # If needed
```

## Documentation

- `PRODUCTION_FIX_GUIDE.md` - Complete production fix guide
- `FIX_SUMMARY.md` - Quick summary of current issues and fixes
- See main `README.md` for application documentation

## Support

If you need help:

1. Check the logs: `./deploy.sh logs`
2. Verify migrations: `npx prisma migrate status`
3. Check database: `sudo -u postgres psql -d ecommerce_db -c '\dt'`
4. Read the documentation in `PRODUCTION_FIX_GUIDE.md`
