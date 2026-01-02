#!/bin/bash
# Production-safe Prisma migration script
# Simple and reliable approach

set -e

echo "🔍 Running database migrations..."
echo "============================================"

# Run Prisma generate first to ensure client is up to date
echo ""
echo "📦 Generating Prisma Client in container..."
docker run --rm --env-file .env ${IMAGE_NAME}:${IMAGE_TAG} \
  npx prisma generate

# Check migration status
echo ""
echo "📊 Checking migration status..."
docker run --rm --env-file .env ${IMAGE_NAME}:${IMAGE_TAG} \
  npx prisma migrate status || {
    echo "⚠️  Migration status check had warnings (this might be okay)"
  }

# Deploy migrations
echo ""
echo "🚀 Deploying migrations..."
if docker run --rm --env-file .env ${IMAGE_NAME}:${IMAGE_TAG} \
  npx prisma migrate deploy; then
    echo "✅ Migrations deployed successfully"
else
    EXIT_CODE=$?
    echo "⚠️  Migration deploy returned code: $EXIT_CODE"
    echo ""
    echo "Checking if migrations are already applied..."
    
    # Check if it's just because migrations are up to date
    STATUS_OUTPUT=$(docker run --rm --env-file .env ${IMAGE_NAME}:${IMAGE_TAG} \
      npx prisma migrate status 2>&1 || true)
    
    if echo "$STATUS_OUTPUT" | grep -q "Database schema is up to date"; then
        echo "✅ Database is already up to date"
    else
        echo "❌ Migration deployment failed"
        echo "Status output:"
        echo "$STATUS_OUTPUT"
        exit 1
    fi
fi

echo ""
echo "============================================"
echo "✅ Migration process completed"
