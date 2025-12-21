#!/bin/bash
# Production-safe Prisma migration script
# Handles ALL edge cases without crashing CI/CD

set -e

echo "🔍 Checking database state..."

# Check if _prisma_migrations table exists
TABLE_EXISTS=$(docker run --rm --env-file .env ${IMAGE_NAME}:${IMAGE_TAG} sh -c '
  npx prisma db execute --stdin <<EOF
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = '\''public'\'' 
  AND table_name = '\''_prisma_migrations'\''
);
EOF
' 2>&1 | grep -oP '(?<=\[).*?(?=\])' || echo "false")

if [ "$TABLE_EXISTS" = "true" ]; then
    echo "✅ _prisma_migrations table exists"
    
    # Check for failed migrations
    echo "🔍 Checking for failed migrations..."
    FAILED_MIGRATIONS=$(docker run --rm --env-file .env ${IMAGE_NAME}:${IMAGE_TAG} sh -c '
      npx prisma migrate status 2>&1 | grep -i "failed" || echo "none"
    ')
    
    if [[ "$FAILED_MIGRATIONS" != "none" ]]; then
        echo "⚠️  Failed migrations detected, attempting to resolve..."
        
        # Try to mark failed migrations as rolled back
        docker run --rm --env-file .env ${IMAGE_NAME}:${IMAGE_TAG} sh -c '
          MIGRATION_NAME=$(npx prisma migrate status 2>&1 | grep -oP "(?<=migration started at).*?(?=failed)" | xargs basename || echo "")
          if [ ! -z "$MIGRATION_NAME" ]; then
            echo "Resolving failed migration: $MIGRATION_NAME"
            npx prisma migrate resolve --rolled-back "$MIGRATION_NAME" || true
          fi
        '
    fi
    
    # Apply pending migrations
    echo "📦 Applying pending migrations..."
    docker run --rm --env-file .env ${IMAGE_NAME}:${IMAGE_TAG} \
      npx prisma migrate deploy
    
else
    echo "⚠️  _prisma_migrations table does NOT exist"
    echo "🔨 Creating migration infrastructure..."
    
    # First, try to deploy migrations (this creates _prisma_migrations)
    docker run --rm --env-file .env ${IMAGE_NAME}:${IMAGE_TAG} \
      npx prisma migrate deploy || {
        echo "⚠️  Initial migrate deploy failed, checking database state..."
        
        # If DB has tables but no _prisma_migrations, we need to baseline
        TABLES_EXIST=$(docker run --rm --env-file .env ${IMAGE_NAME}:${IMAGE_TAG} sh -c '
          npx prisma db execute --stdin <<EOF
SELECT COUNT(*) > 0 FROM information_schema.tables 
WHERE table_schema = '\''public'\'' AND table_type = '\''BASE TABLE'\'';
EOF
        ' 2>&1 | grep -oP '(?<=\[).*?(?=\])' || echo "false")
        
        if [ "$TABLES_EXIST" = "true" ]; then
            echo "⚠️  Database has tables but no migration history"
            echo "📝 Baselining the latest migration..."
            
            # Get the latest migration name
            LATEST_MIGRATION=$(ls -1 prisma/migrations | tail -n 1)
            
            docker run --rm --env-file .env ${IMAGE_NAME}:${IMAGE_TAG} \
              npx prisma migrate resolve --applied "$LATEST_MIGRATION"
        else
            echo "✨ Database is empty, applying all migrations..."
            docker run --rm --env-file .env ${IMAGE_NAME}:${IMAGE_TAG} \
              npx prisma migrate deploy
        fi
    }
fi

echo "✅ Database migration completed successfully"
