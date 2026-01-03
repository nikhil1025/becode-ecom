#!/bin/bash

# Diagnose Production Backend Issues
echo "🔍 Production Backend Diagnostics"
echo "=================================="
echo ""

CONTAINER_NAME="ecom-backend"

echo "1️⃣  Container Status:"
docker ps -a -f name=$CONTAINER_NAME --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "2️⃣  Recent Container Logs (last 50 lines):"
docker logs --tail 50 $CONTAINER_NAME 2>&1 | tail -50
echo ""

echo "3️⃣  Migration-related errors:"
docker logs $CONTAINER_NAME 2>&1 | grep -i -A 5 -B 5 "migration\|prisma\|error" | tail -30
echo ""

echo "4️⃣  Container health check:"
docker inspect $CONTAINER_NAME --format='{{.State.Health.Status}}' 2>/dev/null || echo "No health check configured"
echo ""

echo "5️⃣  Port binding:"
docker port $CONTAINER_NAME 2>/dev/null || echo "Container not running"
echo ""

echo "6️⃣  Application logs:"
docker exec $CONTAINER_NAME cat /app/.startup.log 2>/dev/null || echo "No startup log found"
echo ""

echo "💡 Quick Fixes:"
echo "   If container is stopped: docker start $CONTAINER_NAME"
echo "   If container won't start: docker logs $CONTAINER_NAME"
echo "   If migration error: Run the baseline commands from PRODUCTION_MIGRATION_FIX.md"
echo "   Restart container: docker restart $CONTAINER_NAME"
