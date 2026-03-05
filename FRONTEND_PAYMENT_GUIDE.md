# Frontend Configuration Guide - Real Payment & Transfer

## Environment Variables Setup

Create a `.env` file in the root of your project with the following variables:

### Development Environment (.env.development)

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Midtrans (Payment Gateway)
VITE_MIDTRANS_CLIENT_KEY=your_sandbox_client_key_here
VITE_MIDTRANS_ENVIRONMENT=sandbox

# Firebase (Already configured)
# These should match your firebase.js configuration

# Feature Flags
VITE_ENABLE_REAL_PAYMENTS=true
VITE_ENABLE_REAL_TRANSFERS=true
```

### Production Environment (.env.production)

```env
# API Configuration
VITE_API_URL=https://api.gonab-app.com/api

# Midtrans (Production)
VITE_MIDTRANS_CLIENT_KEY=your_production_client_key_here
VITE_MIDTRANS_ENVIRONMENT=production

# Feature Flags
VITE_ENABLE_REAL_PAYMENTS=true
VITE_ENABLE_REAL_TRANSFERS=true
```

## Integration Steps

### 1. Install Midtrans JavaScript Library

The TopUpModal automatically includes Midtrans Snap. Make sure to add the script to your `index.html`:

```html
<!-- In public/index.html or main HTML file -->
<script src="https://app.sandbox.midtrans.com/snap/snap.js"></script>
<!-- Or for production: -->
<!-- <script src="https://app.midtrans.com/snap/snap.js"></script> -->
```

Or dynamically in your main.jsx:

```javascript
// src/main.jsx
// Load Midtrans Snap script
const script = document.createElement('script');
script.src = import.meta.env.VITE_MIDTRANS_ENVIRONMENT === 'production' 
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js';
script.async = true;
document.body.appendChild(script);
```

### 2. Update Firebase Configuration

Make sure your `firebase.js` is properly configured with all necessary authentication methods:

```javascript
// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

## Component Usage

### Using TopUpModal (for Top-Up functionality)

```jsx
import { useState } from 'react';
import TopUpModal from './components/modals/TopUpModal';

function MyWallet() {
  const [showTopUp, setShowTopUp] = useState(false);

  return (
    <>
      <button onClick={() => setShowTopUp(true)}>Top Up</button>
      {showTopUp && <TopUpModal onClose={() => setShowTopUp(false)} />}
    </>
  );
}
```

### Using TransferModal (for Transfer functionality)

```jsx
import { useState } from 'react';
import TransferModal from './components/modals/TransferModal';

function MyWallet() {
  const [showTransfer, setShowTransfer] = useState(false);

  return (
    <>
      <button onClick={() => setShowTransfer(true)}>Transfer</button>
      {showTransfer && <TransferModal onClose={() => setShowTransfer(false)} />}
    </>
  );
}
```

## API Endpoints Integration

The app expects the following API endpoints on your backend:

### Payment Endpoints
- `POST /api/payment/initiate` - Initiate Snap payment
- `GET /api/payment/status/:orderId` - Check payment status
- `POST /api/payment/bank-transfer` - Create Virtual Account
- `POST /api/payment/ewallet` - Initiate e-wallet payment
- `POST /api/payment/webhook` - Handle payment webhooks

### Transfer Endpoints
- `POST /api/transfer/search-user` - Search user by phone/email
- `POST /api/transfer/to-user` - Transfer to another user
- `POST /api/transfer/to-bank` - Transfer to bank account
- `GET /api/transfer/saved-accounts/:userId` - Get saved bank accounts
- `POST /api/transfer/save-account` - Save new bank account
- `POST /api/transfer/verify-account` - Verify bank account
- `GET /api/transfer/fee` - Get transfer fee
- `GET /api/transfer/history/:userId` - Get transfer history

## Service Layers

The app uses service layers for API communication:

### Payment Service (`src/services/paymentService.js`)

Available functions:
- `initiateMidtransPayment()` - Create Snap payment
- `checkPaymentStatus()` - Check transaction status
- `createBankTransferVA()` - Create Virtual Account
- `initiateEWalletPayment()` - Initiate e-wallet
- `getAvailablePaymentMethods()` - Get payment methods

### Transfer Service (`src/services/transferService.js`)

Available functions:
- `transferToUser()` - Transfer to GonabPay user
- `transferToBank()` - Transfer to bank account
- `getSavedBankAccounts()` - Get saved accounts
- `saveBankAccount()` - Save bank account
- `verifyBankAccount()` - Verify bank account
- `getTransferFee()` - Get transfer fee
- `searchUserForTransfer()` - Search user

## Context Integration

The `WalletContext` now provides:

```javascript
const {
  balance,        // Current wallet balance
  addTransaction, // Add a transaction
  transfer,       // Record a transfer
  pay,            // Record a payment
  transactions,   // Transaction history
  loading         // Loading state
} = useContext(WalletContext);
```

### Example Usage

```jsx
import { useContext } from 'react';
import { WalletContext } from './context/WalletContext';

function MyComponent() {
  const { balance, addTransaction } = useContext(WalletContext);

  const handleTopUp = async () => {
    // After successful payment
    await addTransaction({
      type: 'topup',
      amount: 100000,
      method: 'card',
      description: 'Top up via credit card',
      status: 'success'
    });
  };

  return (
    <div>
      <p>Balance: Rp {balance}</p>
      <button onClick={handleTopUp}>Top Up</button>
    </div>
  );
}
```

## Error Handling

The modals handle errors gracefully:

```jsx
// Errors are displayed in the modal
// Examples:
// - "Saldo tidak cukup" - Insufficient balance
// - "Nominal harus lebih dari Rp 0" - Invalid amount
// - "User penerima tidak ditemukan" - Recipient not found
```

## Security Considerations

1. **Never expose server keys**: All sensitive operations happen on the backend
2. **Use HTTPS only**: Production deployment must use HTTPS
3. **Validate on both ends**: Frontend and backend validation
4. **Store sensitive data safely**: Use Firebase secure rules
5. **Rate limiting**: Backend should implement rate limiting

## Testing Checklist

- [ ] Top-up with credit card works
- [ ] Bank transfer VA generation works
- [ ] E-wallet payment redirects properly
- [ ] Transfer to user validation works
- [ ] Bank account verification works
- [ ] Transaction history updates correctly
- [ ] Error messages display properly
- [ ] Loading states show correctly
- [ ] Success screens appear after completion

## Troubleshooting

### Midtrans Snap not loading
```
Solution: Check that script is loaded before snap.pay() is called
```

### Payment status undefined
```
Solution: Ensure backend endpoint is correctly implemented and
API_URL environment variable is set
```

### Transfer fails with "User not found"
```
Solution: Verify user identifier is correct (phone or email)
and exists in database
```

### "Insufficient balance" error
```
Solution: Check that amount + fee doesn't exceed balance
Fees may apply to bank transfers
```

## Next Steps

1. Set up backend endpoints following `BACKEND_INTEGRATION_GUIDE.md`
2. Configure environment variables
3. Test in sandbox environment
4. Deploy to production with production keys
5. Monitor transactions and errors
