#!/bin/sh
set -e

echo "🚀 Starting application..."

# Load .env file
if [ -f .env ]; then
  echo "📝 Loading environment variables from .env..."
  export $(cat .env | grep -v '^#' | xargs)
fi

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "✅ Starting NestJS application..."
exec node dist/main
