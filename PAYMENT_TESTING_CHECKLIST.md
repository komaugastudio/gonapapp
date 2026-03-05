# Midtrans Payment Testing Checklist

Print this page and check off items as you test!

---

## 🔧 Setup & Prerequisites

### Environment Setup
- [ ] Backend running on `http://localhost:3000`
  - `cd gonab-backend && npm run start:dev`
- [ ] PostgreSQL running
  - `docker-compose up -d` (in backend folder)
- [ ] Frontend running on `http://localhost:5173`
  - `cd gonab-app && npm run dev`

### Browser & Authentication
- [ ] Opened frontend in browser
- [ ] Logged in with valid Firebase account
- [ ] JWT token exists in localStorage
  - Check: `localStorage.getItem('jwtToken')`
- [ ] No console errors on page load
- [ ] Wallet balance displays correctly

### API Connectivity
- [ ] Backend responds to health check
  - `curl http://localhost:3000/api/health`
- [ ] Midtrans Snap.js loaded
  - Check: `console.log(window.snap)`
- [ ] CORS enabled for frontend origin
- [ ] API client configured correctly

---

## 💳 Test Payment - Successful Card

### Basic Flow
- [ ] Click "Wallet" in navigation
- [ ] Click "+ Top Up" button
- [ ] Modal opens without errors
- [ ] Can see payment method options

### Amount & Method Selection
- [ ] Enter amount: `50000` (Rp 50,000)
- [ ] Amount displays: "Rp 50.000"
- [ ] Select payment method: "Kartu Kredit"
- [ ] Method shows as selected
- [ ] Click "Lanjutkan ke Pembayaran"

### Payment Gateway
- [ ] Midtrans Snap modal/popup opens
- [ ] Payment gateway loads completely
- [ ] Can see payment options (Card, Bank, E-wallet)
- [ ] Modal is not blocked by other elements

### Card Payment
- [ ] Enter test card: `4811 1111 1111 1114`
- [ ] Card number accepted (no validation error)
- [ ] Enter CVV: `123`
- [ ] Set expiry: `12/25`
- [ ] OTP field appears (if required)
- [ ] Enter OTP: `123456`
- [ ] Click "Pay" button

### Payment Processing
- [ ] Loading spinner appears
- [ ] Payment processes (1-3 seconds)
- [ ] Snap modal closes automatically
- [ ] No JavaScript errors in console

### Success Confirmation
- [ ] Success message appears: "Pembayaran Berhasil!"
- [ ] Saldo increased by Rp 50,000
- [ ] Modal closes after 2 seconds
- [ ] Redirected to home screen
- [ ] New balance visible in wallet

### Database Verification
- [ ] Payment record created (check database)
- [ ] Transaction record created
- [ ] Wallet balance updated
- [ ] All records have correct timestamps

---

## 🏦 Test Payment - Bank Transfer Method

### Setup
- [ ] Full page refresh
- [ ] Login again if needed
- [ ] Navigate to Wallet → Top Up

### Method Selection
- [ ] Enter amount: `75000`
- [ ] Select "Transfer Bank"
- [ ] Click "Lanjutkan ke Pembayaran"

### Virtual Account
- [ ] Midtrans shows VA options
- [ ] Multiple banks available
- [ ] Bank names clearly displayed
- [ ] VA numbers provided
- [ ] Can see expiry time

### Payment Processing
- [ ] Copy VA number successfully
- [ ] In Midtrans sandbox, simulate bank transfer
- [ ] Return to application
- [ ] Wait for settlement (5-10 seconds)

### Completion
- [ ] Payment status updates to success
- [ ] Balance increased by Rp 75,000
- [ ] Transaction recorded
- [ ] Payment method shows as "bank_transfer"

---

## 📱 Test Payment - E-Wallet Method

### Setup
- [ ] Full page refresh
- [ ] Navigate to Wallet → Top Up
- [ ] Enter amount: `25000`

### Method Selection
- [ ] Select "E-Wallet"
- [ ] Click "Lanjutkan ke Pembayaran"

### E-Wallet Options
- [ ] Midtrans shows e-wallet providers
- [ ] Can see GCash, OVO, Dana options
- [ ] Select one e-wallet provider
- [ ] E-wallet simulator opens

### Payment Processing
- [ ] Confirm payment in simulator
- [ ] Return to app automatically
- [ ] Or manually return to app

### Completion
- [ ] Success message appears (usually instant)
- [ ] Balance increased by Rp 25,000
- [ ] Transaction recorded
- [ ] Payment method shows as "ewallet"

---

## ❌ Test Payment - Failed Card

### Setup
- [ ] Navigate to Wallet → Top Up
- [ ] Enter amount: `30000`
- [ ] Select "Kartu Kredit"

### Failed Card Payment
- [ ] Enter denied card: `4111 1111 1111 1112`
- [ ] Enter any CVV: `123`
- [ ] Set expiry: `12/25`
- [ ] Click "Pay"

### Expected Result
- [ ] Midtrans shows decline message
- [ ] Error displayed in Snap modal
- [ ] Can close modal or try again
- [ ] Balance NOT increased
- [ ] Payment status = "failed"

### After Failure
- [ ] Modal closes without balance update
- [ ] Error message visible in UI
- [ ] Can try again with different card
- [ ] No partial transactions created

---

## ⏳ Test Payment - Expired Card

### Setup
- [ ] Navigate to Wallet → Top Up
- [ ] Enter amount: `20000`
- [ ] Select "Kartu Kredit"

### Expired Card Payment
- [ ] Enter expired card: `4111 1111 1111 1113`
- [ ] Enter CVV: `123`
- [ ] Set expiry: `12/25`
- [ ] Click "Pay"

### Expected Result
- [ ] Midtrans shows "Card expired" error
- [ ] Payment rejected immediately
- [ ] Balance NOT increased
- [ ] Can retry with valid card

---

## 🔄 Test Payment - Pending Status

### Setup
- [ ] Navigate to Wallet → Top Up
- [ ] Enter amount: `100000`
- [ ] Select "Kartu Kredit"

### Bank Challenge Card
- [ ] Enter card: `4915 0343 3010 9903`
- [ ] Enter CVV: `123`
- [ ] Set expiry: `12/25`
- [ ] Click "Pay"

### Processing
- [ ] Payment goes to processing
- [ ] Check payment status: GET `/payment/status/{orderId}`
- [ ] Status should be "processing" or "pending"

### Settlement
- [ ] Wait 1-2 minutes
- [ ] Check status again
- [ ] Should eventually settle to success or fail

---

## 🧪 API Testing with cURL

### Get JWT Token
- [ ] Extract token from localStorage
- [ ] Token starts with: `eyJ...`
- [ ] Token is not expired

### Test Initiate Payment
```
Command: curl -X POST http://localhost:3000/payment/initiate \
  -H "Authorization: Bearer [JWT_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000, "paymentType": "topup", "paymentMethod": "card"}'
```
- [ ] Command executes without error
- [ ] Returns 200 status
- [ ] Response includes `token`
- [ ] Response includes `redirectUrl`
- [ ] Response includes `orderId`

### Test Check Status
- [ ] Use `orderId` from initiate response
- [ ] GET `/payment/status/{orderId}`
- [ ] Returns payment status
- [ ] Status is one of: pending, processing, success, failed

### Test Webhook Callback
- [ ] POST `/payment/callback` with `order_id`
- [ ] Backend processes without error
- [ ] Balance updated if successful

---

## 📊 Database Verification

### Check Payment Record
```sql
SELECT * FROM payment WHERE user_id = '[YOUR_USER_ID]' ORDER BY created_at DESC;
```
- [ ] Record exists for your test payment
- [ ] `amount` field correct
- [ ] `status` = 'success' (if payment succeeded)
- [ ] `snap_token` populated
- [ ] `completed_at` has timestamp

### Check Transaction Record
```sql
SELECT * FROM transaction WHERE user_id = '[YOUR_USER_ID]' AND type = 'topup' ORDER BY created_at DESC;
```
- [ ] Transaction record created
- [ ] `type` = 'topup'
- [ ] `amount` correct
- [ ] `status` = 'success'
- [ ] `payment_gateway` = 'midtrans'
- [ ] `external_transaction_id` matches payment

### Check Wallet Balance
```sql
SELECT balance FROM wallet WHERE user_id = '[YOUR_USER_ID]';
```
- [ ] Balance increased by payment amount
- [ ] No duplicate changes
- [ ] Updated timestamp is recent

---

## 🐛 Error Handling Tests

### Network Error
- [ ] Disconnect internet
- [ ] Try to initiate payment
- [ ] Should show error: "Terjadi kesalahan jaringan"
- [ ] Reconnect internet
- [ ] Can retry payment

### Unauthorized (Missing JWT)
- [ ] Clear localStorage
- [ ] Try to initiate payment
- [ ] Should redirect to login
- [ ] Login again
- [ ] Payment works

### Invalid Amount
- [ ] Try amount: `0`
- [ ] Should show error: "Nominal harus lebih dari Rp 0"
- [ ] Try amount: `-100`
- [ ] Should show error
- [ ] Try valid amount: `50000`
- [ ] Payment proceeds

### Insufficient Balance Check
- [ ] Payment should work regardless of balance
- [ ] No balance validation on frontend
- [ ] Backend should handle via Midtrans

---

## 🔐 Security Checks

### JWT Token Security
- [ ] Token stored in localStorage (frontend only)
- [ ] Token sent in Authorization header
- [ ] Token not exposed in URLs
- [ ] Token expires after 24 hours
- [ ] Token cannot be used after logout

### Payment Data Security
- [ ] Credit card data never stored locally
- [ ] Card numbers not in localStorage
- [ ] Snap handles PCI compliance
- [ ] HTTPS used in production

### SQL Injection Prevention
- [ ] Database queries use parameterized statements
- [ ] No raw SQL injection possible
- [ ] User input validated

---

## ⚡ Performance Tests

### Response Time
- [ ] Initiate payment: < 2 seconds
- [ ] Check status: < 1 second
- [ ] Balance update: < 5 seconds
- [ ] Modal renders: < 1 second

### UI Responsiveness
- [ ] No lag while typing amount
- [ ] Buttons respond immediately
- [ ] Modal smooth animation
- [ ] Loading spinner appears

### Database Performance
- [ ] Payment record creates < 100ms
- [ ] Query for status < 100ms
- [ ] Balance update < 100ms

---

## 📱 Browser Compatibility

Test on each browser:

### Google Chrome
- [ ] Payment flow works
- [ ] No console errors
- [ ] Snap modal opens
- [ ] Database updates

### Mozilla Firefox
- [ ] Payment flow works
- [ ] No console errors
- [ ] Snap modal opens
- [ ] Database updates

### Safari
- [ ] Payment flow works
- [ ] No console errors
- [ ] Snap modal opens
- [ ] Database updates

### Edge
- [ ] Payment flow works
- [ ] No console errors
- [ ] Snap modal opens
- [ ] Database updates

---

## 📝 Notes & Observations

### Issues Found
List any issues encountered:
```
Issue 1: ____________________________________
- Severity: [ ] Critical [ ] Major [ ] Minor
- Steps to reproduce: ____________________
- Status: [ ] Open [ ] Fixed

Issue 2: ____________________________________
- Severity: [ ] Critical [ ] Major [ ] Minor
- Steps to reproduce: ____________________
- Status: [ ] Open [ ] Fixed
```

### Improvements Noticed
```
Improvement 1: ____________________________________
- Impact: [ ] High [ ] Medium [ ] Low
- Status: [ ] Implemented [ ] Planned

Improvement 2: ____________________________________
- Impact: [ ] High [ ] Medium [ ] Low
- Status: [ ] Implemented [ ] Planned
```

---

## ✅ Final Verification

### Test Summary
- Total tests planned: 30+
- Tests completed: ___
- Tests passed: ___
- Tests failed: ___
- Pass rate: ____%

### Sign-off
- [ ] All critical tests passed
- [ ] All major tests passed  
- [ ] Minor issues documented
- [ ] Ready for production (if all pass)

**Tested Date**: _______________
**Tested By**: _______________
**Notes**: _______________

---

## 📞 Quick Reference

### Important URLs
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Midtrans Sandbox**: https://dashboard.sandbox.midtrans.com/
- **Test Card Docs**: https://docs.midtrans.com/en/development/test-payment

### Test Card Numbers
```
SUCCESS:  4811 1111 1111 1114
DENIED:   4111 1111 1111 1112
EXPIRED:  4111 1111 1111 1113
PENDING:  4915 0343 3010 9903
CVV:      123 (any 3 digits)
EXPIRY:   12/25 (any future date)
OTP:      123456
```

### Useful Commands
```bash
# Start backend
cd gonab-backend && npm run start:dev

# Start PostgreSQL
docker-compose up -d

# Check backend health
curl http://localhost:3000/api/health

# View database
docker-compose exec postgres psql -U postgres -d gonab_db
```

---

**Good luck with testing!** 🚀
