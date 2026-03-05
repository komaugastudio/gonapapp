# 🎉 Gonab Midtrans Payment Testing - Quick Start

## What's Ready to Test

✅ **Midtrans Snap.js** loaded in frontend  
✅ **Backend payment endpoint** `/payment/initiate` implemented  
✅ **Payment callback handler** for Midtrans webhooks  
✅ **Wallet balance updates** on successful payment  
✅ **Transaction recording** in database  
✅ **JWT authentication** integrated  
✅ **Comprehensive test guide** created  

---

## 🚀 Quick Start - 5 Minutes

### Prerequisites
1. Backend running: `cd gonab-backend && npm run start:dev`
2. PostgreSQL running: `docker-compose up -d`  
3. Frontend running: `cd gonab-app && npm run dev`

### Test Payment Now

**Step 1:** Login to frontend (`http://localhost:5173`)
```
Email: test@gonab.com (or any Firebase account)
Password: password123
```

**Step 2:** Navigate to Wallet → Top Up

**Step 3:** Enter test amount
```
Rp 50,000
```

**Step 4:** Select payment method
```
Kartu Kredit (Credit Card)
```

**Step 5:** Click "Lanjutkan ke Pembayaran"

**Step 6:** Use Midtrans test card
```
Card: 4811 1111 1111 1114
CVV: 123
Expiry: 12/25
OTP: 123456
```

**Expected Result:** ✅ Success message, balance updated!

---

## 📋 Test Card Numbers

### ✅ Success Cards

| Type | Card Number | Results |
|------|-------------|---------|
| Visa | 4811 1111 1111 1114 | ✅ Immediately captured |
| Mastercard | 5555 5555 5555 4444 | ✅ Authorized (needs settlement) |

### ❌ Fail Cards

| Type | Card Number | Results |
|------|-------------|---------|
| Visa Denied | 4111 1111 1111 1112 | ❌ Transaction denied |
| Visa Expired | 4111 1111 1111 1113 | ❌ Card expired error |

### ⏳ Special Cases

| Type | Card Number | Results |
|------|-------------|---------|
| Bank Challenge | 4915 0343 3010 9903 | ⏳ Stays pending |

---

## 🧪 Testing Different Payment Methods

### 1. Credit/Debit Card
- Select "Kartu Kredit"
- Use test card numbers above
- Quick payment (1-2 seconds)

### 2. Bank Transfer (Virtual Account)
- Select "Transfer Bank"
- Midtrans shows virtual account numbers
- Simulate bank payment in Midtrans interface
- Takes 5-10 seconds to settle

### 3. E-Wallet (GCash, OVO, Dana)
- Select "E-Wallet"
- Choose provider
- Confirm in e-wallet simulator
- Instant settlement

---

## 🔍 How to Verify Success

### In Frontend
- [ ] Success message appears
- [ ] Modal auto-closes after 2 seconds
- [ ] Redirects to home screen
- [ ] Wallet balance increased by payment amount

### In Backend Logs
Look for messages like:
```
Payment initiated: orderId-user123-xxx
Payment status: success
Balance updated: +50000
```

### In Database
Check PostgreSQL:
```sql
-- Check payment record
SELECT * FROM payment WHERE external_transaction_id LIKE 'topup-%';

-- Check transaction record
SELECT * FROM transaction WHERE type = 'topup' ORDER BY created_at DESC;

-- Check wallet balance
SELECT balance FROM wallet WHERE user_id = 'your-user-id';
```

---

## 🛠️ API Testing with cURL

### 1. Get Your JWT Token
In browser console:
```javascript
localStorage.getItem('jwtToken')
```

### 2. Initiate Payment
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

**Response:**
```json
{
  "token": "520e2f1b-8f70-4aec-aa64-7e29a3aed1e9",
  "redirectUrl": "https://app.sandbox.midtrans.com/snap/v2/vtweb/xxxxx",
  "orderId": "topup-user123-1709638925000"
}
```

### 3. Check Payment Status
```bash
curl -X GET http://localhost:3000/payment/status/topup-user123-1709638925000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🎯 Complete Testing Checklist

### Before Starting
- [ ] Backend running on port 3000
- [ ] PostgreSQL running
- [ ] Frontend running on port 5173
- [ ] User logged in
- [ ] JWT token in localStorage

### Payment Flow
- [ ] Click "Top Up" button
- [ ] Enter amount (e.g., 50,000)
- [ ] Select payment method
- [ ] Click "Lanjutkan ke Pembayaran"
- [ ] Midtrans Snap modal opens
- [ ] Payment gateway loads correctly
- [ ] Can select payment option

### Payment Processing
- [ ] Enter test card details
- [ ] Click Pay button
- [ ] Payment processes (1-10 seconds depending on method)
- [ ] Snap modal closes
- [ ] Success message appears

### Post-Payment
- [ ] Wallet balance updated
- [ ] Transaction visible in history
- [ ] Payment record in database
- [ ] No console errors

### Error Testing
- [ ] Try failed card: `4111 1111 1111 1112`
- [ ] Should show error message
- [ ] Can retry with different card
- [ ] Balance NOT updated

---

## 📊 Payment Flow Diagram

```
Frontend                    Backend                 Midtrans
   |                          |                        |
   |--POST /payment/initiate-->|                       |
   |                          |--createTransaction-->|
   |                          |<--token, redirectUrl--|
   |<--token, redirectUrl-----|                       |
   |                          |                       |
   |--snap.pay(token)-------->|                       |
   |                          |                       |
   |                          |<------payment data-----|
   |                          |                       |
   |                   (User enters payment details)  |
   |                          |                       |
   |                          |<----[payment success]->|
   |                          |                       |
   |                          |--webhook callback-----|
   |                          |                       |
   |<--success message-----|  |                       |
   |                          |--UPDATE balance-->    |
   |                          |                       |
```

---

## 🐛 Troubleshooting

### "Snap is not defined" Error
```
Solution:
1. Check index.html has Midtrans script:
   <script src="https://app.sandbox.midtrans.com/snap/snap.js"></script>
2. Clear browser cache: Ctrl+Shift+Delete
3. Reload page
4. Verify in console: console.log(window.snap)
```

### Payment Modal Doesn't Open
```
Solution:
1. Check browser console for JS errors
2. Verify JWT token exists
3. Check backend returns valid token
4. Ensure window.snap object is available
```

### "Unauthorized" Error on API Call
```
Solution:
1. Verify user is logged in
2. Check JWT token: localStorage.getItem('jwtToken')
3. Ensure token is in Authorization header
4. Check backend JWT configuration
```

### Balance Not Updated After Payment
```
Solution:
1. Check backend logs for callback processing
2. Verify payment status in database
3. Check transaction record created
4. Restart backend: npm run start:dev
```

---

## 📚 Complete Testing Guide

For detailed testing scenarios and API documentation, see:
📄 **[MIDTRANS_PAYMENT_TESTING.md](./MIDTRANS_PAYMENT_TESTING.md)**

Contains:
- ✅ Step-by-step payment scenarios
- ✅ All test card numbers and results
- ✅ Complete cURL API examples
- ✅ Browser console testing
- ✅ Database verification queries
- ✅ Comprehensive troubleshooting guide

---

## ✨ What Gets Created on Success

### Database Records

**1. Payment Record**
```
id: 123
userId: firebaseUID
amount: 50000
status: 'success'
externalTransactionId: 'topup-...'
snapToken: 'token-...'
completedAt: 2026-03-05 10:30:00
```

**2. Transaction Record**
```
id: 456
userId: firebaseUID
walletId: wallet-id
type: 'topup'
amount: 50000
status: 'success'
paymentGateway: 'midtrans'
externalTransactionId: 'topup-...'
createdAt: 2026-03-05 10:30:00
```

**3. Wallet Update**
```
id: wallet-id
userId: firebaseUID
balance: old_balance + 50000
updatedAt: 2026-03-05 10:30:00
```

---

## 🎮 Testing Scenarios to Try

### Easy ✅
1. Small amount (25,000 Rp) with success card
2. Check balance increased
3. Check transaction appears in history

### Intermediate 🟡
1. Try bank transfer method
2. Try e-wallet method  
3. Test with different amounts
4. Verify database records

### Advanced 🔴
1. Test failed card (denied)
2. Test expired card
3. Test concurrent payments
4. Test payment callbacks
5. Monitor backend logs

---

## 🚦 Next Steps

After successful payment testing:

1. **✅ Payment Works** → Ready for production
2. **Test Other Features** → Ride booking, food order, transfers
3. **Load Testing** → Test with multiple concurrent payments
4. **Webhook Setup** → Configure production Midtrans webhooks
5. **Error Handling** → Test all error scenarios
6. **Monitor** → Setup payment failure alerts

---

## 📞 Support Resources

- **MIDTRANS_PAYMENT_TESTING.md** - Detailed testing guide
- **Midtrans Sandbox Dashboard** - https://dashboard.sandbox.midtrans.com/
- **Midtrans API Documentation** - https://docs.midtrans.com/
- **Test Payment Cards** - https://docs.midtrans.com/en/development/test-payment
- **Backend Payment Code** - `src/modules/payment/`
- **Frontend Payment Code** - `src/components/modals/TopUpModal.jsx`

---

**Status**: ✅ Ready to Test  
**Last Updated**: March 5, 2026  
**Midtrans Environment**: Sandbox (Testing)  
**Payment Gateway**: Active  

**Start testing now!** 🚀
