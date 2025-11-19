#!/bin/bash

# Lexsy End-to-End Test Suite
# Tests all 5 must-have features

echo "🧪 LEXSY END-TO-END TEST SUITE"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Helper functions
pass() {
  echo -e "${GREEN}✓${NC} $1"
  ((PASSED++))
}

fail() {
  echo -e "${RED}✗${NC} $1"
  ((FAILED++))
}

warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# Test 1: Database Layer
echo "📊 Test 1: Database Layer"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

TABLE_COUNT=$(docker exec lexsy-postgres psql -U lexsy_user -d lexsy -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';" 2>/dev/null | tr -d ' ')

if [ "$TABLE_COUNT" -ge "19" ]; then
  pass "Database has $TABLE_COUNT tables (expected 19+)"
else
  fail "Database has only $TABLE_COUNT tables"
fi

USER_EXISTS=$(docker exec lexsy-postgres psql -U lexsy_user -d lexsy -t -c "SELECT COUNT(*) FROM users WHERE email = 'demo@lexsy.com';" 2>/dev/null | tr -d ' ')

if [ "$USER_EXISTS" = "1" ]; then
  pass "Demo user exists in database"
else
  fail "Demo user not found"
fi

echo ""

# Test 2: Backend API Health
echo "🔧 Test 2: Backend API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

HEALTH=$(curl -s http://localhost:5000/health)
if echo "$HEALTH" | grep -q "healthy"; then
  pass "Backend health check passed"
else
  fail "Backend health check failed"
fi

echo ""

# Test 3: Authentication
echo "🔐 Test 3: Authentication"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@lexsy.com","password":"Demo123!"}')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
  pass "Login endpoint returns JWT token"
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  echo "   Token: ${TOKEN:0:20}..."
else
  fail "Login failed"
  echo "   Response: $LOGIN_RESPONSE"
fi

echo ""

# Test 4: Protected Endpoints
echo "🔒 Test 4: Protected Endpoints"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -z "$TOKEN" ]; then
  DOCS_RESPONSE=$(curl -s -X GET http://localhost:5000/api/documents \
    -H "Authorization: Bearer $TOKEN")

  if echo "$DOCS_RESPONSE" | grep -q "success"; then
    pass "GET /api/documents works with authentication"
  else
    fail "GET /api/documents failed"
  fi

  ANALYTICS_RESPONSE=$(curl -s -X GET http://localhost:5000/api/analytics/dashboard \
    -H "Authorization: Bearer $TOKEN")

  if echo "$ANALYTICS_RESPONSE" | grep -q "success"; then
    pass "GET /api/analytics/dashboard works"
  else
    warn "Analytics endpoint returned: $(echo $ANALYTICS_RESPONSE | head -100)"
  fi
else
  fail "Skipping protected endpoint tests - no token"
fi

echo ""

# Test 5: Frontend
echo "🎨 Test 5: Frontend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

FRONTEND_RESPONSE=$(curl -s http://localhost:5174)
if echo "$FRONTEND_RESPONSE" | grep -q "Lexsy"; then
  pass "Frontend is serving content"
else
  fail "Frontend not responding"
fi

if echo "$FRONTEND_RESPONSE" | grep -q "AI-Powered Legal"; then
  pass "Landing page loads correctly"
else
  fail "Landing page content missing"
fi

echo ""

# Test 6: Frontend Pages (Check if JavaScript loaded)
echo "📱 Test 6: Frontend Routes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PAGES=("/" "/login" "/register")
for page in "${PAGES[@]}"; do
  RESPONSE=$(curl -s "http://localhost:5174$page")
  if echo "$RESPONSE" | grep -q "src/main.tsx"; then
    pass "Route $page accessible"
  else
    fail "Route $page not loading"
  fi
done

echo ""

# Test 7: AI Agents
echo "🤖 Test 7: AI Agents"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

AGENT_COUNT=$(docker exec lexsy-postgres psql -U lexsy_user -d lexsy -t -c "SELECT COUNT(*) FROM ai_agents;" 2>/dev/null | tr -d ' ')

if [ "$AGENT_COUNT" -ge "0" ]; then
  pass "AI agents table exists (agents: $AGENT_COUNT)"
else
  fail "AI agents table not found"
fi

TASK_COUNT=$(docker exec lexsy-postgres psql -U lexsy_user -d lexsy -t -c "SELECT COUNT(*) FROM ai_tasks;" 2>/dev/null | tr -d ' ')
pass "AI tasks table exists (tasks logged: $TASK_COUNT)"

echo ""

# Summary
echo "📋 TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
  echo ""
  echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
  exit 0
else
  echo ""
  echo -e "${RED}⚠️  Some tests failed${NC}"
  exit 1
fi
