# Midtrans Payment Flow Testing Guide

## Pre-Testing Checklist

Before testing the payment flow, ensure:

- ✅ **Backend Running**: `npm run start:dev` on `http://localhost:3000`
- ✅ **PostgreSQL Running**: `docker-compose up -d`
- ✅ **Frontend Running**: `npm run dev` on `http://localhost:5173`
- ✅ **Logged In**: User authenticated with Firebase (JWT token in localStorage)
- ✅ **Environment**: Set to **SANDBOX** (testing mode)

---

## Test Payment Flow - Step by Step

### 1. Open Frontend Application
```
http://localhost:5173
```

### 2. Login with Test Account
Use any Firebase email/password combination you've created:
```
Email: test@gonab.com
Password: password123
```

### 3. Navigate to Top Up Page
- Click on **Wallet** icon
- Click **+ Top Up** button
- You should be on the top-up modal

### 4. Enter Test Amount
- Enter amount: **50000** (Rp 50,000)
- Choose payment method: **Kartu Kredit** (Credit Card)
- Click **Lanjutkan ke Pembayaran** button

### 5. Midtrans Payment Gateway Opens
- A popup should appear with Midtrans Snap payment interface
- You're now in sandbox mode (test environment)

---

## Midtrans Test Card Numbers

### ✅ Success Payment

**Visa Card - Success (Capture)**
```
Card Number: 4811 1111 1111 1114
CVV: 123
Expiry: 12/25
OTP: 123456
```
Result: Payment is immediately captured (settled)

**Mastercard - Success (Authorize)**
```
Card Number: 5555 5555 5555 4444
CVV: 123
Expiry: 12/25
OTP: 123456
```
Result: Payment authorized but not yet settled

### ❌ Failed Payment

**Visa - Payment Denied**
```
Card Number: 4111 1111 1111 1112
CVV: 123
Expiry: 12/25
```
Result: Transaction denied

**Card - Expired**
```
Card Number: 4111 1111 1111 1113
CVV: 123
Expiry: 12/25
```
Result: Card expired error

### ⏳ Pending Payment

**Visa - Bank Challenge**
```
Card Number: 4915 0343 3010 9903
CVV: 123
Expiry: 12/25
OTP: 123456
```
Result: Transaction goes to pending status

---

## Payment Flow Test Scenarios

### Scenario 1: Successful Credit Card Payment

**Steps:**
1. Enter amount: 50000
2. Select payment method: Card
3. Click "Lanjutkan ke Pembayaran"
4. Midtrans popup opens
5. Select "Credit Card" in payment options
6. Enter test card: `4811 1111 1111 1114`
7. CVV: 123, Expiry: 12/25
8. OTP: 123456
9. Click Pay

**Expected Result:**
- ✅ Payment successful modal appears
- ✅ Saldo increased by 50,000
- ✅ Transaction recorded in history
- ✅ Modal auto-closes after 2 seconds
- ✅ Redirects to home screen

### Scenario 2: Top Up with Virtual Account (Bank Transfer)

**Steps:**
1. Enter amount: 75000
2. Select payment method: Transfer Bank
3. Click "Lanjutkan ke Pembayaran"
4. Midtrans shows virtual account numbers for different banks
5. Choose a bank (e.g., BCA, Mandiri)
6. Copy VA number
7. In Midtrans test interface, "pay" the VA
8. Return to app

**Expected Result:**
- ⏳ Payment shows as processing
- ✅ After 5-10 seconds, refreshes and shows success
- ✅ Saldo updated
- ✅ Transaction recorded with VA bank name

### Scenario 3: Payment with E-Wallet (GCash, OVO, etc.)

**Steps:**
1. Enter amount: 25000
2. Select payment method: E-Wallet
3. Click "Lanjutkan ke Pembayaran"
4. Midtrans shows e-wallet options
5. Select a test e-wallet
6. Confirm payment in e-wallet simulator
7. Return to app

**Expected Result:**
- ✅ Immediate success confirmation
- ✅ Saldo updated
- ✅ Transaction type: topup

### Scenario 4: Failed Payment

**Steps:**
1. Enter amount: 30000
2. Select Card
3. Use test card: `4111 1111 1111 1112` (Denied)
4. CVV: 123, Expiry: 12/25
5. Click Pay

**Expected Result:**
- ❌ Payment declined message from Midtrans
- ❌ Saldo NOT updated
- ❌ Modal closes after error
- ❌ Can try again with different card

### Scenario 5: Expired Card

**Steps:**
1. Enter amount: 100000
2. Use test card: `4111 1111 1111 1113` (Expired)
3. CVV: 123, Expiry: 12/25
4. Click Pay

**Expected Result:**
- ❌ "Card expired" error message
- ❌ Transaction not created
- ❌ Can try with different card

---

## Backend API Testing (Using cURL)

### Test 1: Initiate Payment (Direct API Call)

**Prerequisites:**
- Have a valid JWT token (from Firebase login)
- Extract token from localStorage in frontend console

**Get JWT Token from Frontend:**
```javascript
// In browser console on frontend
localStorage.getItem('jwtToken')
```

**API Call:**
```bash
curl -X POST http://localhost:3000/payment/initiate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "paymentType": "topup",
    "paymentMethod": "card"
  }'
```

**Success Response:**
```json
{
  "redirectUrl": "https://app.sandbox.midtrans.com/snap/v2/vtweb/xxxxx",
  "token": "520e2f1b-8f70-4aec-aa64-7e29a3aed1e9",
  "orderId": "topup-user123-1709638925000"
}
```

**Expected Response Fields:**
- `token`: Snap token for Midtrans
- `redirectUrl`: URL to open in Snap popup
- `orderId`: Unique order identifier

### Test 2: Check Payment Status

**API Call:**
```bash
curl -X GET "http://localhost:3000/payment/status/topup-user123-1709638925000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response:**
```json
{
  "status": "success",
  "amount": 50000,
  "paymentMethod": "card",
  "completedAt": "2026-03-05T10:30:00Z"
}
```

### Test 3: Payment Callback (Webhook)

Midtrans should automatically send webhook when payment completes. To test manually:

```bash
curl -X POST http://localhost:3000/payment/callback \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "topup-user123-1709638925000"
  }'
```

---

## Testing in Browser Console

### Check Payment Status in Real-time

```javascript
// In browser console, get your JWT token
const token = localStorage.getItem('jwtToken');
const orderId = 'topup-user123-1709638925000'; // Use actual order ID

// Check payment status
fetch(`http://localhost:3000/payment/status/${orderId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(r => r.json())
.then(data => console.log('Payment Status:', data))
.catch(e => console.error('Error:', e));
```

### Simulate Payment Success

```javascript
// Manually trigger the success callback (for testing)
const orderId = 'topup-user123-1709638925000';

fetch('http://localhost:3000/payment/callback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ order_id: orderId })
})
.then(r => r.json())
.then(data => console.log('Callback Result:', data));
```

---

## Understanding Payment States

| Status | Meaning | Next Action |
|--------|---------|-------------|
| `pending` | Payment awaiting confirmation | User completes payment |
| `processing` | Payment being processed | Wait for settlement |
| `success` | Payment completed & settled | Show success modal |
| `failed` | Payment was declined/cancelled | Allow retry |
| `expired` | Payment link expired (30 min) | Request new payment |

---

## Expected Database Records

### After Successful Payment

**1. Payment Record (payments table)**
```
- id: auto-generated
- userId: user_id_from_token
- amount: 50000
- status: 'success'
- externalTransactionId: 'topup-user123-xxx'
- snapToken: token_from_midtrans
- completedAt: current_timestamp
```

**2. Transaction Record (transactions table)**
```
- id: auto-generated
- userId: user_id_from_token
- type: 'topup'
- amount: 50000
- status: 'success'
- paymentGateway: 'midtrans'
- externalTransactionId: 'topup-user123-xxx'
- createdAt: current_timestamp
```

**3. Wallet Update**
```
- balance: increased by 50000
- updatedAt: current_timestamp
```

---

## Troubleshooting Payment Issues

### Issue: "Snap not defined" error

**Solution:**
- Check if Midtrans Snap.js is loaded in `index.html`
- Verify line: `<script src="https://app.sandbox.midtrans.com/snap/snap.js"></script>`
- Clear browser cache and refresh

### Issue: Payment modal doesn't open

**Solution:**
- Check browser console for errors
- Verify `window.snap` object exists: `console.log(window.snap)`
- Check JWT token is valid: `localStorage.getItem('jwtToken')`
- Backend should return valid `token` and `redirectUrl`

### Issue: "Unauthorized" error on API call

**Solution:**
- Ensure user is logged in
- JWT token exists: `localStorage.getItem('jwtToken')`
- Token is sent in Authorization header: `Authorization: Bearer {token}`
- Backend can verify token (check auth service)

### Issue: Payment succeeds but balance not updated

**Solution:**
- Check backend logs for callback processing
- Verify Midtrans sends webhook callback
- Check transaction record in database
- Restart backend if needed: `npm run start:dev`

### Issue: Midtrans sandbox credentials invalid

**Solution:**
- Verify `.env` has correct Midtrans keys:
  - `MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxx`
  - `MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxx`
- Get test keys from: https://dashboard.sandbox.midtrans.com/
- Ensure environment is set to sandbox (not production)

---

## Complete Payment Testing Checklist

### Pre-Payment
- [ ] Backend running on `http://localhost:3000`
- [ ] PostgreSQL running
- [ ] Frontend running on `http://localhost:5173`
- [ ] User logged in with valid account
- [ ] JWT token in localStorage

### During Payment
- [ ] Midtrans Snap modal opens correctly
- [ ] Payment options visible (Card, VA, E-wallet)
- [ ] Test card accepted
- [ ] OTP prompt appears (for cards requiring verification)

### Post-Payment
- [ ] Success message displayed
- [ ] Page redirects to home screen
- [ ] Wallet balance updated
- [ ] Transaction visible in history
- [ ] Database records created

### Backend Verification
- [ ] Payment record in `payments` table
- [ ] Transaction record in `transactions` table
- [ ] Wallet balance increased
- [ ] No error logs in terminal

---

## Test Payment Workflow Diagram

```
1. User clicks "Top Up"
   ↓
2. Enter amount & select payment method
   ↓
3. Click "Lanjutkan ke Pembayaran"
   ↓
4. Frontend calls POST /payment/initiate
   ↓
5. Backend creates Midtrans transaction
   ↓
6. Backend returns token & redirectUrl
   ↓
7. Frontend opens Midtrans Snap popup
   ↓
8. User enters payment details (card, bank, etc)
   ↓
9. Midtrans processes payment
   ↓
10. User returns to app
   ↓
11. Midtrans sends webhook callback to backend
   ↓
12. Backend updates payment status
   ↓
13. Backend adds balance to wallet
   ↓
14. Success modal shown to user
   ↓
15. User redirected to home screen
```

---

## Next Steps After Testing

1. **✅ Payment Flow Works** → Integrate with other features
2. **Update API Tests** → Add payment testing to test suite
3. **Setup Webhooks** → Configure Midtrans webhooks for production
4. **Error Handling** → Test all error scenarios
5. **UI/UX** → Improve payment status messages
6. **Security** → Add additional verification checks
7. **Production** → Switch from sandbox to production keys

---

## Useful Links

- **Midtrans Dashboard (Sandbox)**: https://dashboard.sandbox.midtrans.com/
- **Midtrans Test Cards**: https://docs.midtrans.com/en/development/test-payment
- **Midtrans API Docs**: https://docs.midtrans.com/
- **Snap Redirection Guide**: https://docs.midtrans.com/en/snap/integration-guide

---

## Payment Test Card Summary

| Card Type | Card Number | CVV | Expiry | Result |
|-----------|-------------|-----|--------|--------|
| Visa (Success) | 4811 1111 1111 1114 | 123 | 12/25 | ✅ Captured |
| Visa (Authorize) | 5555 5555 5555 4444 | 123 | 12/25 | ✅ Authorized |
| Visa (Deny) | 4111 1111 1111 1112 | 123 | 12/25 | ❌ Denied |
| Visa (Expire) | 4111 1111 1111 1113 | 123 | 12/25 | ❌ Expired |
| Bank Challenge | 4915 0343 3010 9903 | 123 | 12/25 | ⏳ Pending |

---

**Ready to test!** 🎉 Start with a small amount (25000-50000 Rp) to verify the flow works before testing larger amounts.
