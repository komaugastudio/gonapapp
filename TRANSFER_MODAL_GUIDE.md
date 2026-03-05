# Transfer Modal Documentation

## Overview

The `TransferModal` component provides a complete user interface for transferring money between GonabPay users and to external bank accounts.

## Features

### 1. **Transfer to GonabPay Users**
- User search by phone number or email
- Real-time user lookup
- Instant transfer with no fees
- Optional transfer notes/description
- Transaction recorded immediately

### 2. **Transfer to Bank Accounts**
- Multiple bank support (BCA, Mandiri, BNI, BRI, CIMB)
- Account verification before transfer
- Save frequently used accounts
- Automatic fee calculation
- Processing status tracking

### 3. **Security**
- Balance validation before transfer
- User authentication required
- Account verification
- Transaction history

---

## Component Props

```jsx
<TransferModal onClose={() => setShowTransfer(false)} />
```

| Prop | Type | Description |
|------|------|-------------|
| `onClose` | Function | Called when modal is closed |

---

## Usage Example

```jsx
import { useState } from 'react';
import TransferModal from './components/modals/TransferModal';

function WalletScreen() {
  const [showTransfer, setShowTransfer] = useState(false);

  return (
    <div>
      <button onClick={() => setShowTransfer(true)}>
        💸 Transfer Uang
      </button>

      {showTransfer && (
        <TransferModal onClose={() => setShowTransfer(false)} />
      )}
    </div>
  );
}
```

---

## Flow Diagrams

### Transfer to GonabPay User Flow

```
┌─────────────────────────┐
│  Choose Transfer Type   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   User Transfer Type    │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Search Recipient      │
│  (Phone or Email)       │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Recipient Found?      │
└───────────┬──────────┬──┘
     Yes    │          │    No
         ┌──┘          └────────┐
         │                       │
         ▼                       ▼
    ┌────────────┐         ┌──────────┐
    │ Select &   │         │   Error  │
    │ Confirm    │         │  Message │
    └────┬───────┘         └──────────┘
         │
         ▼
┌─────────────────────────┐
│   Enter Amount          │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Optional Notes        │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Confirm Transfer      │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Processing...         │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Success! ✅           │
│   Balance Updated       │
└─────────────────────────┘
```

### Transfer to Bank Account Flow

```
┌─────────────────────────┐
│  Choose Transfer Type   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Bank Transfer Type    │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Saved Accounts?        │
└───────────┬──────────┬──┘
     Yes    │          │    No
         ┌──┘          └────────┐
         │                       │
         ▼                       ▼
    ┌────────────┐      ┌──────────────┐
    │  Select    │      │   Add New    │
    │  Account   │      │   Account    │
    └────┬───────┘      └──────┬───────┘
         │                      │
         │                      ▼
         │              ┌──────────────┐
         │              │ Select Bank  │
         │              └──────┬───────┘
         │                     │
         │                     ▼
         │              ┌──────────────┐
         │              │ Enter Account│
         │              │   Number     │
         │              └──────┬───────┘
         │                     │
         │                     ▼
         │              ┌──────────────┐
         │              │  Verify      │
         │              │   Account    │
         │              └──────┬───────┘
         │                     │
         │                     ▼
         │              ┌──────────────┐
         │              │    Save?     │
         │              └──────┬───────┘
         │                     │
         └─────────────┬───────┘
                       │
                       ▼
                ┌─────────────┐
                │Enter Amount │
                └──────┬──────┘
                       │
                       ▼
                ┌──────────────┐
                │Show Fee      │
                │Calculate     │
                │Total         │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │Confirm       │
                │Transfer      │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │  Processing  │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │ Success! ✅  │
                │ Fund Sent    │
                └──────────────┘
```

---

## Step-by-Step Walkthrough

### Step 1: Type Selection
User chooses between:
- 👤 **Transfer ke User GonabPay** - Transfer to another app user
- 🏦 **Transfer ke Rekening Bank** - Transfer to any bank account

### Step 2a: User Transfer - Search

```javascript
// User enters search query (phone or email)
// System calls: searchUserForTransfer(identifier)
// Returns: User info if found
```

**Expected Response from Backend:**
```json
{
  "success": true,
  "user": {
    "id": "user123",
    "name": "John Doe", 
    "phone": "08123456789",
    "email": "john@example.com"
  }
}
```

### Step 2b: Bank Transfer - Account Selection

User can either:
1. **Select saved account** - Pick from previously saved accounts
2. **Add new account** - Enter bank code + account number

**Account Verification:**
```javascript
// System calls: verifyBankAccount(bankCode, accountNumber)
// Returns: Account holder name if valid
```

**Expected Response:**
```json
{
  "success": true,
  "accountName": "BUDI SANTOSO",
  "message": "Akun valid"
}
```

### Step 3: Amount Entry

- User enters transfer amount
- System shows preset buttons (Rp50.000, Rp100.000, etc.)
- Manual input also available
- Current balance shown

**For Bank Transfer:**
- Fee automatically calculated and shown
- Total amount = Transfer amount + Fee

### Step 4: Confirmation

Shows:
- Recipient/Account details
- Amount
- Fee (if applicable)
- Remaining balance after transfer

### Step 5: Processing

- Transfers funds via API
- Shows success screen
- Updates wallet balance
- Records transaction

---

## Error Handling

The modal handles these errors gracefully:

| Error | Message | Cause |
|-------|---------|-------|
| Invalid Amount | "Nominal harus lebih dari Rp 0" | User entered 0 or negative |
| Balance Error | "Saldo tidak cukup" | Balance < amount + fee |
| User Not Found | "User tidak ditemukan" | Invalid phone/email |
| Account Not Found | "Akun tidak ditemukan" | Invalid account number |
| Verification Failed | "Terjadi kesalahan saat verifikasi" | Bank API error |
| Transfer Failed | Various messages based on error | Network or backend error |

---

## Context Integration

The modal uses `WalletContext`:

```javascript
const {
  balance,          // Current wallet balance
  transfer,         // Function to record transfer
  loading            // Loading state
} = useContext(WalletContext);
```

After successful transfer, it calls:
```javascript
await transfer({
  type: 'transfer',
  amount: transferAmount,
  recipient: recipientName,
  bankCode: bankCodeIfBank,
  description: userDescription,
  status: 'success'
});
```

---

## Service Methods

### Payment Service (for top-up)
```javascript
import { 
  initiateMidtransPayment,
  createBankTransferVA,
  initiateEWalletPayment
} from '../services/paymentService';
```

### Transfer Service
```javascript
import {
  transferToUser,           // Transfer to GonabPay user
  transferToBank,          // Transfer to bank account
  searchUserForTransfer,    // Find user
  getSavedBankAccounts,    // Get saved accounts
  saveBankAccount,         // Save new account
  verifyBankAccount,       // Verify account
  getTransferFee           // Calculate fee
} from '../services/transferService';
```

---

## Database Requirements

### Users Collection
```javascript
{
  uid: "user123",
  name: "John Doe",
  phone: "08123456789",
  email: "john@example.com",
  walletBalance: 500000,
  bankAccounts: [
    {
      id: "account1",
      bankCode: "BCA",
      accountNumber: "1234567890",
      accountName: "John Doe",
      isVerified: true,
      isDefault: true
    }
  ]
}
```

### Transfers Collection
```javascript
{
  id: "transfer123",
  fromUserId: "user123",
  toUserId: "user456",        // null for bank transfers
  toBank: {
    bankCode: "BCA",
    accountNumber: "1234567890",
    accountName: "Recipient"
  },
  amount: 100000,
  fee: 5000,
  totalAmount: 105000,
  status: "success",
  timestamp: Timestamp,
  type: "user_transfer" | "bank_transfer"
}
```

---

## API Endpoints Required

### User Search
```
POST /api/transfer/search-user
Body: { identifier: "08123456789" }
Response: { success: true, user: {...} }
```

### Transfer to User
```
POST /api/transfer/to-user
Body: { 
  fromUserId: "user123",
  toUserIdentifier: "08987654321",
  amount: 100000,
  description: "For groceries"
}
Response: { success: true, transactionId: "...", newBalance: ... }
```

### Transfer to Bank
```
POST /api/transfer/to-bank
Body: {
  userId: "user123",
  bankCode: "BCA",
  accountNumber: "1234567890",
  amount: 100000,
  accountName: "Recipient Name"
}
Response: { success: true, transactionId: "...", fee: 5000, ... }
```

### Verify Bank Account
```
POST /api/transfer/verify-account
Body: {
  bankCode: "BCA",
  accountNumber: "1234567890"
}
Response: { success: true, accountName: "BUDI SANTOSO" }
```

### Get Transfer Fee
```
GET /api/transfer/fee?amount=100000&bankCode=BCA
Response: { success: true, fee: 5000 }
```

---

## Styling & Customization

The modal uses Tailwind CSS. To customize:

1. **Colors** - Change `bg-blue-600`, `bg-green-600`, etc.
2. **Sizes** - Adjust `w-full max-w-md`, padding values
3. **Icons** - Replace lucide-react icons with your own
4. **Text** - Translate strings to your language

---

## Best Practices

1. **Always verify balance** before showing confirmation
2. **Show fees clearly** before processing
3. **Confirm recipient details** carefully
4. **Implement retry logic** for failed transfers
5. **Log all transactions** for audit trail
6. **Handle network errors** gracefully
7. **Provide clear error messages** to users
8. **Implement limits** on transfer amounts/daily

---

## Testing Checklist

- [ ] Search works with valid phone number
- [ ] Search works with valid email
- [ ] Search shows error for invalid user
- [ ] Bank account verification works
- [ ] Fee calculation is correct
- [ ] Transfer deducts correct amount
- [ ] Recipient receives funds
- [ ] Transaction is recorded in history
- [ ] Error messages display properly
- [ ] Balance updates immediately
- [ ] Modal closes on success

---

## FAQ

**Q: Can users transfer to themselves?**
A: No, the system should prevent this on the backend.

**Q: What's the maximum transfer amount?**
A: Set by your backend, implement limits there.

**Q: Can transfers be cancelled?**
A: No, transfers are instant once confirmed.

**Q: How long for bank transfers to arrive?**
A: Depends on bank, usually 1-2 hours to 1 day.

**Q: Is there a daily transfer limit?**
A: Yes, implement this on backend if needed.

---

**Version**: 1.0  
**Last Updated**: March 2026  
**Status**: Production Ready
