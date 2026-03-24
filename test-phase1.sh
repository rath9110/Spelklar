#!/bin/bash

echo "🧪 Phase 1 Test: Persistence + Auth"
echo "===================================="

BASE_URL="http://localhost:3001"
PHONE="+46701234567"

echo ""
echo "1️⃣  Creating a match..."
MATCH=$(curl -s -X POST "$BASE_URL/api/match" \
  -H "Content-Type: application/json" \
  -d '{"homeTeam": "AIK", "awayTeam": "Hammarby"}')

MATCH_ID=$(echo $MATCH | grep -o '"matchKey":"[^"]*' | cut -d'"' -f4)
echo "   Created match: $MATCH_ID"

echo ""
echo "2️⃣  Logging an event..."
curl -s -X POST "$BASE_URL/api/match/$MATCH_ID/event" \
  -H "Content-Type: application/json" \
  -d '{"type": "goal", "team": "home"}' > /dev/null
echo "   Event logged"

echo ""
echo "3️⃣  Starting timer..."
curl -s -X POST "$BASE_URL/api/match/$MATCH_ID/start" \
  -H "Content-Type: application/json" > /dev/null
echo "   Timer started"

echo ""
echo "4️⃣  Fetching match (should persist)..."
FETCHED=$(curl -s -X GET "$BASE_URL/api/match/$MATCH_ID")
echo "   Response: $FETCHED" | head -c 100
echo "..."

echo ""
echo "5️⃣  Requesting OTP..."
OTP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/request-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phone\": \"$PHONE\"}")
echo "   Response: $OTP_RESPONSE"

echo ""
echo "✅ Phase 1 tests complete!"
echo "Check server logs for OTP code."
