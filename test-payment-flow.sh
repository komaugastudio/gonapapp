#!/bin/bash
# Midtrans Payment Flow Test Script
# This script tests the payment flow end-to-end

echo "======================================"
echo "Gonab Midtrans Payment Flow Test"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get JWT token from user
echo "To test the payment flow, you'll need:"
echo "1. Backend running on http://localhost:3000"
echo "2. Frontend running on http://localhost:5173"
echo "3. Logged in user with JWT token"
echo ""

echo -e "${YELLOW}Step 1: Verify Backend is Running${NC}"
if curl -s http://localhost:3000/api/health > /dev/null; then
  echo -e "${GREEN}✓ Backend is running${NC}"
else
  echo -e "${RED}✗ Backend is not responding${NC}"
  echo "  Start backend: cd gonab-backend && npm run start:dev"
  exit 1
fi

echo ""
echo -e "${YELLOW}Step 2: Get Your JWT Token${NC}"
echo "1. Open http://localhost:5173 in your browser"
echo "2. Login with your Firebase account"
echo "3. Open browser console (F12) and run:"
echo "   localStorage.getItem('jwtToken')"
echo "4. Copy the token and enter below:"
echo ""
read -p "Enter your JWT token: " JWT_TOKEN

if [ -z "$JWT_TOKEN" ]; then
  echo -e "${RED}✗ No JWT token provided${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}Step 3: Test Payment Initiation${NC}"
echo "Testing:PaymentController.initiatePayment endpoint..."
echo ""

PAYLOAD='{
  "amount": 50000,
  "paymentType": "topup",
  "paymentMethod": "card"
}'

RESPONSE=$(curl -s -X POST http://localhost:3000/payment/initiate \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

echo "Request:"
echo "  POST /payment/initiate"
echo "  Amount: 50,000 Rp"
echo "  Method: card"
echo ""
echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Extract token from response
TOKEN=$(echo "$RESPONSE" | jq -r '.token' 2>/dev/null)
ORDER_ID=$(echo "$RESPONSE" | jq -r '.orderId' 2>/dev/null)

if [ "$TOKEN" != "null" ] && [ ! -z "$TOKEN" ]; then
  echo -e "${GREEN}✓ Payment initiated successfully${NC}"
  echo "  Snap Token: $TOKEN"
  echo "  Order ID: $ORDER_ID"
else
  echo -e "${RED}✗ Failed to initiate payment${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}Step 4: Open Payment Gateway${NC}"
echo "Opening Midtrans Snap payment page..."
echo ""
echo "Next steps in browser:"
echo "1. The Snap popup should have opened automatically"
echo "2. Select payment method (Card, Bank, E-wallet)"
echo "3. For card test, use: 4811 1111 1111 1114 (visa)"
echo "4. CVV: 123, Expiry: 12/25"
echo "5. Click Pay and follow prompts"
echo ""

echo -e "${YELLOW}Step 5: Verify Payment Status${NC}"
echo "After payment, we'll check the status..."
echo ""
echo "Checking payment status (waiting 5 seconds first)..."
sleep 5

STATUS=$(curl -s -X GET "http://localhost:3000/payment/status/$ORDER_ID" \
  -H "Authorization: Bearer $JWT_TOKEN")

echo "Response:"
echo "$STATUS" | jq '.' 2>/dev/null || echo "$STATUS"
echo ""

STATUS_VALUE=$(echo "$STATUS" | jq -r '.status' 2>/dev/null)
if [ "$STATUS_VALUE" = "success" ]; then
  echo -e "${GREEN}✓ Payment successful!${NC}"
  echo "  Your balance should be updated"
elif [ "$STATUS_VALUE" = "pending" ] || [ "$STATUS_VALUE" = "processing" ]; then
  echo -e "${YELLOW}⏳ Payment is still processing${NC}"
  echo "  Check again in a few seconds"
else
  echo -e "${RED}✗ Payment failed or status unknown${NC}"
fi

echo ""
echo -e "${GREEN}======================================"
echo "Test Complete"
echo "======================================${NC}"
