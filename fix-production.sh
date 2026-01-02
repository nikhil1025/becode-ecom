#!/bin/bash
# Manual fix for production database issue
# Run this ON THE PRODUCTION SERVER

set -e

echo "🔧 Production Database Fix Script"
echo "=================================="
echo ""
echo "⚠️  WARNING: This script should be run ON THE PRODUCTION SERVER"
echo ""

read -p "Are you on the production server? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "Step 1: Checking current container..."
CONTAINER_NAME="bcode-backend"

if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "✅ Container is running"
else
    echo "❌ Container is not running!"
    echo "Please start the container first: docker start ${CONTAINER_NAME}"
    exit 1
fi

echo ""
echo "Step 2: Regenerating Prisma Client inside container..."
docker exec ${CONTAINER_NAME} sh -c "cd /app && npx prisma generate" || {
    echo "❌ Failed to generate Prisma Client"
    exit 1
}
echo "✅ Prisma Client regenerated"

echo ""
echo "Step 3: Checking database migrations..."
docker exec ${CONTAINER_NAME} sh -c "cd /app && npx prisma migrate status" || {
    echo "⚠️  Migration status check had warnings"
}

echo ""
echo "Step 4: Deploying any pending migrations..."
docker exec ${CONTAINER_NAME} sh -c "cd /app && npx prisma migrate deploy" || {
    echo "⚠️  Migration deploy had warnings (might be okay if already applied)"
}

echo ""
echo "Step 5: Restarting container to apply changes..."
docker restart ${CONTAINER_NAME}
echo "✅ Container restarted"

echo ""
echo "Waiting for container to be healthy..."
sleep 5

for i in {1..30}; do
    if curl -sf http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "✅ Container is healthy!"
        break
    fi
    echo -n "."
    sleep 2
done

echo ""
echo ""
echo "=================================="
echo "Fix applied! Testing endpoints..."
echo ""

# Test social media
echo -n "Testing /api/social-media/active: "
if curl -sf http://localhost:3001/api/social-media/active | grep -q "^\["; then
    echo "✅ WORKING"
else
    echo "❌ STILL FAILING"
fi

# Test app logo
echo -n "Testing /api/app-logo/active: "
if curl -sf http://localhost:3001/api/app-logo/active | grep -q "^\["; then
    echo "✅ WORKING"
else
    echo "❌ STILL FAILING"
fi

echo ""
echo "=================================="
echo "If endpoints are still failing, you may need to:"
echo "1. Check container logs: docker logs -f ${CONTAINER_NAME}"
echo "2. Verify database tables exist: sudo -u postgres psql -d ecommerce_db -c '\dt'"
echo "3. Rebuild container: ./deploy.sh deploy"
