#!/bin/sh
set -e

echo "🔧 Starting application startup sequence..."
echo "============================================"

echo ""
echo "📦 Generating Prisma Client..."
if npx prisma generate; then
    echo "✅ Prisma Client generated successfully"
else
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi

echo ""
echo "🔄 Running database migrations..."
if npx prisma migrate deploy; then
    echo "✅ Database migrations completed successfully"
else
    echo "⚠️  Database migrations failed, but continuing..."
    echo "This might be okay if migrations are already applied"
fi

echo ""
echo "🔍 Checking migration status..."
npx prisma migrate status || true

echo ""
echo "🚀 Starting NestJS application..."
echo "============================================"
exec node dist/src/main
