#!/bin/bash

# Fix Production Migrations - Apply all missing migrations
# Run this on EC2: ./fix-production-migrations.sh

set -e

echo "🔧 Fixing Production Database Migrations"
echo "========================================"
echo ""

CONTAINER_NAME="ecom-backend"

# Step 1: Create _prisma_migrations table if it doesn't exist
echo "📋 Step 1: Creating migration tracking table..."
docker exec $CONTAINER_NAME npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > /tmp/init_migration.sql || true

# Alternative: Just run migrate deploy which creates the table automatically
echo ""
echo "📦 Step 2: Applying all migrations..."
docker exec $CONTAINER_NAME npx prisma migrate deploy

echo ""
echo "📊 Step 3: Checking migration status..."
docker exec $CONTAINER_NAME npx prisma migrate status

echo ""
echo "✅ Migration fix complete!"
echo ""
echo "Verify tables exist:"
echo "  docker exec -it $CONTAINER_NAME sh -c 'npx prisma db execute --stdin' <<< 'SELECT tablename FROM pg_tables WHERE schemaname = '\''public'\'' ORDER BY tablename;'"
