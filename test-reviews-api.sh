#!/bin/bash
# Test script for Reviews Dashboard APIs

echo "🧪 Testing Reviews Dashboard APIs"
echo "=================================="
echo ""

# Configuration
API_URL="${1:-https://api.themingkart.com}"
ADMIN_TOKEN="${2}"

if [ -z "$ADMIN_TOKEN" ]; then
    echo "❌ Error: Admin token required"
    echo ""
    echo "Usage: ./test-reviews-api.sh <api_url> <admin_token>"
    echo "Example: ./test-reviews-api.sh https://api.themingkart.com 'Bearer eyJhbG...'"
    echo ""
    exit 1
fi

echo "Testing API: $API_URL"
echo ""

# Test 1: Get all variant reviews (Admin endpoint)
echo "Test 1: GET /reviews/admin/variant-reviews"
echo "-------------------------------------------"
RESPONSE=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    "${API_URL}/api/reviews/admin/variant-reviews?page=1&limit=10")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ PASS (Status: $HTTP_CODE)"
    echo "$BODY" | jq -r '.pagination // "No pagination found"'
else
    echo "❌ FAIL (Status: $HTTP_CODE)"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
fi
echo ""

# Test 2: Create admin reply
echo "Test 2: POST /reviews/admin/reply (requires reviewId)"
echo "------------------------------------------------------"
echo "⏭️  Skipped (requires valid reviewId)"
echo ""

# Test 3: Get variant reviews by ID
echo "Test 3: GET /reviews/variant/:variantId (Public endpoint)"
echo "---------------------------------------------------------"
# Try to get a variant ID first
VARIANT_ID=$(curl -s "${API_URL}/api/products?page=1&limit=1" | jq -r '.products[0].variants[0].id // empty')

if [ ! -z "$VARIANT_ID" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        "${API_URL}/api/reviews/variant/${VARIANT_ID}")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ PASS (Status: $HTTP_CODE)"
        echo "Variant ID: $VARIANT_ID"
        echo "$BODY" | jq -r '.pagination // "No reviews found"'
    else
        echo "❌ FAIL (Status: $HTTP_CODE)"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    fi
else
    echo "⏭️  Skipped (no products found)"
fi
echo ""

# Test 4: Verify auth is working correctly
echo "Test 4: GET /reviews/admin/variant-reviews (Without Auth)"
echo "----------------------------------------------------------"
RESPONSE=$(curl -s -w "\n%{http_code}" \
    -H "Content-Type: application/json" \
    "${API_URL}/api/reviews/admin/variant-reviews")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "401" ]; then
    echo "✅ PASS - Correctly returns 401 Unauthorized"
elif [ "$HTTP_CODE" = "403" ]; then
    echo "✅ PASS - Correctly returns 403 Forbidden"
else
    echo "❌ FAIL - Expected 401/403, got $HTTP_CODE"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
fi
echo ""

# Test 5: Check if backend is using JwtAuthGuard or AdminJwtAuthGuard
echo "Test 5: Authentication Type Check"
echo "----------------------------------"
if echo "$BODY" | grep -q "admin"; then
    echo "✅ Uses AdminJwtAuthGuard (correct for admin endpoints)"
else
    echo "ℹ️  Uses JwtAuthGuard (standard auth)"
fi
echo ""

echo "=================================="
echo "Test Summary"
echo "=================================="
echo ""
echo "To test with your admin token:"
echo "1. Login to admin dashboard"
echo "2. Open browser DevTools > Application > Local Storage"
echo "3. Copy the 'adminToken' value"
echo "4. Run: ./test-reviews-api.sh $API_URL 'Bearer <token>'"
echo ""
echo "Common Issues:"
echo "- 401: Token is invalid or expired"
echo "- 403: User is not admin"
echo "- 400: Database operation failed (Prisma Client issue)"
echo ""
