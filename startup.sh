#!/bin/sh
set -e

echo "� Generating Prisma Client..."
npx prisma generate

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "🚀 Starting NestJS application..."
exec node dist/src/main
