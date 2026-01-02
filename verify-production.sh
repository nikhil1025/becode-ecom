#!/bin/bash
# Quick production verification script

echo "🔍 Production Health Check"
echo "=========================="

# Configuration
API_URL="${1:-https://api.themingkart.com}"

echo ""
echo "Testing API endpoints..."

# Test health endpoint
echo -n "Health Check: "
if curl -sf "${API_URL}/api/health" > /dev/null 2>&1; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
fi

# Test social media endpoint
echo -n "Social Media (public): "
SOCIAL_RESPONSE=$(curl -sf "${API_URL}/api/social-media/active" 2>&1)
if echo "$SOCIAL_RESPONSE" | grep -q "^\["; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    echo "Response: $SOCIAL_RESPONSE"
fi

# Test app logo endpoint
echo -n "App Logo (public): "
LOGO_RESPONSE=$(curl -sf "${API_URL}/api/app-logo/active" 2>&1)
if echo "$LOGO_RESPONSE" | grep -q "^\["; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    echo "Response: $LOGO_RESPONSE"
fi

# Test protected endpoint (should return 401, not 400)
echo -n "Social Media (protected - should be 401): "
PROTECTED_RESPONSE=$(curl -s "${API_URL}/api/social-media" 2>&1)
if echo "$PROTECTED_RESPONSE" | grep -q "401\|Unauthorized"; then
    echo "✅ PASS (Correctly returns 401)"
elif echo "$PROTECTED_RESPONSE" | grep -q "400\|Database operation failed"; then
    echo "❌ FAIL (Returns 400 - Database issue!)"
    echo "Response: $PROTECTED_RESPONSE"
else
    echo "⚠️  UNKNOWN"
    echo "Response: $PROTECTED_RESPONSE"
fi

echo ""
echo "=========================="
echo "Verification complete!"
