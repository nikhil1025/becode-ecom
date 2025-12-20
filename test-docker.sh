#!/bin/bash
# Quick test script to verify Docker build locally

set -e

echo "🧪 Testing Docker Build Locally"
echo "================================"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env not found, creating from .env.example"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Created .env - Please edit it with real values"
        echo "   Especially: DATABASE_URL, JWT_SECRET, ADMIN_JWT_SECRET"
        exit 1
    fi
fi

# Load environment variables
export $(grep -v '^#' .env | xargs)

# Clean previous test containers
echo "🧹 Cleaning previous test containers..."
docker stop bcode-test 2>/dev/null || true
docker rm bcode-test 2>/dev/null || true

# Build image
echo "🏗️  Building Docker image..."
docker build \
    --build-arg DATABASE_URL="${DATABASE_URL}" \
    --tag bcode-ecom:test \
    --progress=plain \
    . || {
        echo "❌ Build failed!"
        exit 1
    }

echo "✅ Build successful!"

# Run container
echo "🚀 Starting test container..."
docker run -d \
    --name bcode-test \
    -p 3001:3001 \
    --env-file .env \
    -v "$(pwd)/uploads:/app/uploads" \
    bcode-ecom:test

echo "⏳ Waiting for application to start (60 seconds)..."
sleep 10

# Check if container is running
if ! docker ps | grep -q bcode-test; then
    echo "❌ Container stopped! Logs:"
    docker logs bcode-test
    exit 1
fi

# Wait for health check
for i in {1..25}; do
    if curl -sf http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "✅ Application is healthy!"
        echo ""
        echo "📊 Test Results:"
        echo "  - Container: Running ✓"
        echo "  - Health: OK ✓"
        echo "  - Port: 3001 ✓"
        echo ""
        echo "🔗 Test endpoints:"
        echo "  - Health: http://localhost:3001/api/health"
        echo "  - API Docs: http://localhost:3001/api"
        echo ""
        echo "📝 View logs: docker logs -f bcode-test"
        echo "🛑 Stop test: docker stop bcode-test && docker rm bcode-test"
        echo ""
        echo "✅ All tests passed! Ready for production deployment."
        exit 0
    fi
    echo -n "."
    sleep 2
done

echo ""
echo "❌ Health check failed! Container logs:"
docker logs --tail 100 bcode-test
docker stop bcode-test
docker rm bcode-test
exit 1
