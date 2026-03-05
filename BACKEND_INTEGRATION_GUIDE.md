# Backend Integration Guide - Real Payment & Transfer System

## Overview
This guide provides implementation instructions for the real top-up and transfer system integrated into the Gonab App.

---

## 1. Payment Gateway Integration - Midtrans

### Setup Midtrans Account
1. Register at https://midtrans.com
2. Get your Merchant ID, Client Key, and Server Key
3. Add to `.env` file:

```env
MIDTRANS_MERCHANT_ID=your_merchant_id
MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_API_URL=https://app.midtrans.com/api
```

### Backend Endpoints

#### 1. Initiate Payment (`POST /api/payment/initiate`)
```javascript
// Request body
{
  userId: "user123",
  amount: 100000,
  paymentMethod: "card", // card, bank, ovo, dana, gopay
  orderId: "TOP-UP-user123-1234567890",
  customerDetails: {
    userId: "user123"
  }
}

// Response
{
  success: true,
  token: "midtrans_snap_token",
  redirectUrl: "https://app.sandbox.midtrans.com/snap/v2/...",
  orderId: "TOP-UP-user123-1234567890"
}
```

**Implementation (Node.js/Express):**
```javascript
const axios = require('axios');

router.post('/payment/initiate', async (req, res) => {
  try {
    const { userId, amount, paymentMethod, orderId } = req.body;

    // Validate amount
    if (amount < 10000) {
      return res.status(400).json({
        success: false,
        message: 'Minimal top-up adalah Rp 10.000'
      });
    }

    // Create Snap transaction
    const response = await axios.post(
      `${process.env.MIDTRANS_API_URL}/v2/snap/transactions`,
      {
        transaction_details: {
          order_id: orderId,
          gross_amount: amount,
        },
        customer_details: {
          first_name: userId,
          email: 'support@gonab.app'
        },
        enabled_payments: getPaymentMethods(paymentMethod),
        credit_card: {
          secure: true
        }
      },
      {
        auth: {
          username: process.env.MIDTRANS_SERVER_KEY,
          password: ''
        }
      }
    );

    if (response.data.token) {
      // Save transaction to database
      await saveTransaction({
        userId,
        orderId,
        amount,
        method: paymentMethod,
        status: 'pending',
        timestamp: new Date()
      });

      res.json({
        success: true,
        token: response.data.token,
        redirectUrl: response.data.redirect_url,
        orderId: orderId
      });
    }
  } catch (error) {
    console.error('Error initiating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menginisiasi pembayaran'
    });
  }
});

function getPaymentMethods(method) {
  const methods = {
    card: ['credit_card'],
    bank: ['bank_transfer'],
    ovo: ['ovo'],
    dana: ['dana'],
    gopay: ['gopay']
  };
  return methods[method] || ['credit_card'];
}
```

#### 2. Check Payment Status (`GET /api/payment/status/:orderId`)
```javascript
// Response
{
  success: true,
  transactionStatus: "settlement", // capture, settlement, pending, deny, cancel, expire
  statusMessage: "Pembayaran berhasil",
  transactionAmount: 100000
}
```

**Implementation:**
```javascript
router.get('/payment/status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const response = await axios.get(
      `${process.env.MIDTRANS_API_URL}/v2/${orderId}/status`,
      {
        auth: {
          username: process.env.MIDTRANS_SERVER_KEY,
          password: ''
        }
      }
    );

    const transactionStatus = response.data.transaction_status;
    
    // Update database transaction status
    await updateTransactionStatus(orderId, transactionStatus);

    // If payment successful, credit the wallet
    if (['capture', 'settlement'].includes(transactionStatus)) {
      const transaction = await getTransaction(orderId);
      if (transaction && !transaction.credited) {
        const userId = transaction.userId;
        const amount = transaction.amount;

        // Update user wallet
        await updateUserWallet(userId, amount, 'topup');
        
        // Mark transaction as credited
        await markTransactionCredited(orderId);
      }
    }

    res.json({
      success: true,
      transactionStatus: transactionStatus,
      statusMessage: getStatusMessage(transactionStatus),
      transactionAmount: response.data.gross_amount
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({
      success: false,
      status: 'unknown',
      message: 'Gagal mengecek status pembayaran'
    });
  }
});

function getStatusMessage(status) {
  const messages = {
    'capture': 'Pembayaran berhasil',
    'settlement': 'Pembayaran berhasil diproses',
    'pending': 'Pembayaran sedang diproses',
    'deny': 'Pembayaran ditolak',
    'cancel': 'Pembayaran dibatalkan',
    'expire': 'Pembayaran kadaluarsa'
  };
  return messages[status] || 'Status pembayaran tidak diketahui';
}
```

#### 3. Webhook Handler (`POST /api/payment/webhook`)
```javascript
router.post('/payment/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    // Verify webhook signature
    const body = req.body.toString('utf-8');
    const hash = crypto
      .createHash('sha512')
      .update(body + process.env.MIDTRANS_SERVER_KEY)
      .digest('hex');

    if (hash !== req.get('x-midtrans-signature')) {
      return res.status(403).json({ message: 'Invalid signature' });
    }

    const notification = JSON.parse(body);
    const { order_id, transaction_status } = notification;

    // Update transaction
    await updateTransactionStatus(order_id, transaction_status);

    // Credit wallet if successful
    if (['capture', 'settlement'].includes(transaction_status)) {
      const transaction = await getTransaction(order_id);
      if (transaction && !transaction.credited) {
        await updateUserWallet(transaction.userId, transaction.amount, 'topup');
        await markTransactionCredited(order_id);
      }
    }

    res.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ status: 'error' });
  }
});
```

---

## 2. Bank Transfer Virtual Account (VA)

### Setup
Use Midtrans Bank Transfer API or integrate with a bank partner like Xendit.

#### Create Virtual Account (`POST /api/payment/bank-transfer`)

**Implementation with Midtrans:**
```javascript
router.post('/payment/bank-transfer', async (req, res) => {
  try {
    const { userId, amount, orderId } = req.body;

    // Create VA for multiple banks
    const vaNumbers = [];
    const banks = ['bca', 'mandiri', 'bni'];

    for (const bank of banks) {
      const response = await axios.post(
        `${process.env.MIDTRANS_API_URL}/v2/charge`,
        {
          payment_type: 'bank_transfer',
          bank_transfer: {
            bank: bank
          },
          transaction_details: {
            order_id: orderId,
            gross_amount: amount
          }
        },
        {
          auth: {
            username: process.env.MIDTRANS_SERVER_KEY,
            password: ''
          }
        }
      );

      if (response.data.va_numbers) {
        vaNumbers.push({
          bankCode: bank.toUpperCase(),
          bankName: getBankName(bank),
          vaNumber: response.data.va_numbers[0].va_number
        });
      }
    }

    // Save transaction
    await saveTransaction({
      userId,
      orderId,
      amount,
      type: 'bank_transfer',
      vaNumbers,
      status: 'pending',
      expireTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    res.json({
      success: true,
      message: 'Nomor Virtual Account berhasil dibuat',
      vaNumbers,
      amount,
      expireTime: '24 jam'
    });
  } catch (error) {
    console.error('Error creating VA:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat nomor virtual account'
    });
  }
});

function getBankName(bankCode) {
  const names = {
    'bca': 'Bank Central Asia',
    'mandiri': 'Bank Mandiri',
    'bni': 'Bank Negara Indonesia',
    'bri': 'Bank Rakyat Indonesia'
  };
  return names[bankCode] || bankCode;
}
```

---

## 3. Real Transfer System

### Database Schema

**Users Collection Enhancement:**
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
      isDefault: true,
      savedAt: timestamp
    }
  ]
}
```

**Transfers Collection:**
```javascript
{
  id: "transfer1",
  fromUserId: "user123",
  toUserId: "user456", // null if bank transfer
  toBank: {
    bankCode: "BCA",
    accountNumber: "1234567890",
    accountName: "Recipient Name"
  },
  amount: 100000,
  fee: 5000,
  totalAmount: 105000,
  description: "Transfer notes",
  status: "success", // pending, success, failed
  timestamp: timestamp,
  transactionId: "TRX123"
}
```

### Backend Endpoints

#### 1. Search User for Transfer (`POST /api/transfer/search-user`)

```javascript
router.post('/transfer/search-user', async (req, res) => {
  try {
    const { identifier } = req.body;

    // Search by phone or email
    let user = await db.collection('users').where('phone', '==', identifier).get();
    
    if (user.empty) {
      user = await db.collection('users').where('email', '==', identifier).get();
    }

    if (user.empty) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    const userData = user.docs[0].data();
    res.json({
      success: true,
      user: {
        id: user.docs[0].id,
        name: userData.name,
        phone: userData.phone,
        email: userData.email
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mencari user'
    });
  }
});
```

#### 2. Transfer to User (`POST /api/transfer/to-user`)

```javascript
router.post('/transfer/to-user', async (req, res) => {
  try {
    const { fromUserId, toUserIdentifier, amount, description } = req.body;

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Nominal harus lebih dari Rp 0'
      });
    }

    // Get sender's wallet
    const senderDoc = await db.collection('users').doc(fromUserId).get();
    const sender = senderDoc.data();

    if (!sender || sender.walletBalance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Saldo tidak cukup'
      });
    }

    // Find recipient
    let recipientDoc = await db.collection('users')
      .where('phone', '==', toUserIdentifier).limit(1).get();
    
    if (recipientDoc.empty) {
      recipientDoc = await db.collection('users')
        .where('email', '==', toUserIdentifier).limit(1).get();
    }

    if (recipientDoc.empty) {
      return res.status(404).json({
        success: false,
        message: 'User penerima tidak ditemukan'
      });
    }

    const toUserId = recipientDoc.docs[0].id;
    const recipient = recipientDoc.docs[0].data();

    // Process transfer in transaction
    const batch = db.batch();
    const transactionId = `TRX-${Date.now()}`;

    // Deduct from sender
    batch.update(db.collection('users').doc(fromUserId), {
      walletBalance: sender.walletBalance - amount
    });

    // Add to recipient
    batch.update(db.collection('users').doc(toUserId), {
      walletBalance: recipient.walletBalance + amount
    });

    // Record transfer
    batch.set(db.collection('transfers').doc(transactionId), {
      fromUserId,
      toUserId,
      amount,
      description,
      status: 'success',
      timestamp: new Date(),
      type: 'user_transfer'
    });

    // Record in sender's transaction history
    batch.set(
      db.collection('users').doc(fromUserId).collection('transactions').doc(),
      {
        type: 'transfer_out',
        amount,
        recipient: recipient.name,
        description,
        timestamp: new Date(),
        status: 'success'
      }
    );

    // Record in recipient's transaction history
    batch.set(
      db.collection('users').doc(toUserId).collection('transactions').doc(),
      {
        type: 'transfer_in',
        amount,
        fromUser: sender.name,
        description,
        timestamp: new Date(),
        status: 'success'
      }
    );

    await batch.commit();

    res.json({
      success: true,
      message: 'Transfer berhasil',
      transactionId,
      newBalance: sender.walletBalance - amount,
      recipientName: recipient.name,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat melakukan transfer'
    });
  }
});
```

#### 3. Transfer to Bank (`POST /api/transfer/to-bank`)

```javascript
// Integrate with bank partner like Xendit or DuitKu
router.post('/transfer/to-bank', async (req, res) => {
  try {
    const { userId, bankCode, accountNumber, amount, accountName } = req.body;

    // Get user's wallet
    const userDoc = await db.collection('users').doc(userId).get();
    const user = userDoc.data();
    const fee = calculateTransferFee(amount, bankCode);
    const totalAmount = amount + fee;

    if (!user || user.walletBalance < totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Saldo tidak cukup (termasuk biaya transfer)'
      });
    }

    // Call bank transfer API (example: using Xendit)
    const transferResponse = await axios.post(
      'https://api.xendit.co/transfers',
      {
        reference_id: `BANK-TRANSFER-${userId}-${Date.now()}`,
        amount: amount,
        bank_code: bankCode,
        account_number: accountNumber,
        account_holder_name: accountName
      },
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(process.env.XENDIT_API_KEY).toString('base64')}`
        }
      }
    );

    const transactionId = transferResponse.data.id;

    // Deduct from user wallet
    await db.collection('users').doc(userId).update({
      walletBalance: user.walletBalance - totalAmount
    });

    // Record transfer
    await db.collection('transfers').doc(transactionId).set({
      userId,
      bankCode,
      accountNumber,
      accountName,
      amount,
      fee,
      totalAmount,
      status: 'processing',
      timestamp: new Date(),
      type: 'bank_transfer',
      xenditId: transactionId
    });

    // Record in user's transaction history
    await db.collection('users').doc(userId).collection('transactions').add({
      type: 'bank_transfer',
      amount,
      bankCode,
      accountName,
      fee,
      totalAmount,
      status: 'processing',
      timestamp: new Date(),
      transactionId
    });

    res.json({
      success: true,
      message: 'Transfer ke bank berhasil diproses',
      transactionId,
      newBalance: user.walletBalance - totalAmount,
      fee,
      totalAmount,
      bankName: getBankName(bankCode),
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Bank transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat melakukan transfer'
    });
  }
});

function calculateTransferFee(amount, bankCode) {
  const baseFee = 5000;
  // Add more complex logic if needed
  return baseFee;
}
```

#### 4. Verify Bank Account (`POST /api/transfer/verify-account`)

```javascript
router.post('/transfer/verify-account', async (req, res) => {
  try {
    const { bankCode, accountNumber } = req.body;

    // Call account inquiry API (e.g., using Xendit or bank partner)
    const response = await axios.get(
      'https://api.xendit.co/bank_account_inquiry',
      {
        params: {
          bank_code: bankCode,
          account_number: accountNumber
        },
        headers: {
          'Authorization': `Basic ${Buffer.from(process.env.XENDIT_API_KEY).toString('base64')}`
        }
      }
    );

    if (response.data.account_holder_name) {
      res.json({
        success: true,
        accountName: response.data.account_holder_name,
        message: 'Akun valid'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Akun tidak ditemukan'
      });
    }
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat verifikasi akun'
    });
  }
});
```

#### 5. Get Transfer Fee (`GET /api/transfer/fee`)

```javascript
router.get('/transfer/fee', (req, res) => {
  try {
    const { amount, bankCode } = req.query;

    const fee = calculateTransferFee(parseInt(amount), bankCode);

    res.json({
      success: true,
      fee,
      amount: parseInt(amount),
      totalAmount: parseInt(amount) + fee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      fee: 0
    });
  }
});
```

---

## 4. Security Best Practices

### 1. API Authentication
Use Firebase Auth tokens for all requests:

```javascript
const verifyAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.userId = decodedToken.uid;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Apply to all payment routes
router.use(verifyAuth);
```

### 2. Rate Limiting
Implement rate limiting to prevent abuse:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

router.use('/payment/', limiter);
router.use('/transfer/', limiter);
```

### 3. Input Validation
Always validate input:

```javascript
const { body, validationResult } = require('express-validator');

router.post('/transfer/to-user',
  body('amount').isInt({ min: 1 }).withMessage('Invalid amount'),
  body('toUserIdentifier').trim().isLength({ min: 5 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
);
```

### 4. Logging
Implement comprehensive logging for audit trails:

```javascript
const logger = require('./logger');

router.post('/transfer/to-user', async (req, res) => {
  try {
    logger.info(`Transfer initiated: ${req.userId} -> ${req.body.toUserIdentifier} (${req.body.amount})`);
    // ... rest of code
  } catch (error) {
    logger.error(`Transfer failed: ${error.message}`);
  }
});
```

---

## 5. Environment Variables (.env)

```env
# Midtrans
MIDTRANS_MERCHANT_ID=your_merchant_id
MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_API_URL=https://app.sandbox.midtrans.com/api

# Xendit (for bank transfers)
XENDIT_API_KEY=your_xendit_api_key

# DuitKu (alternative)
DUITKU_MERCHANT_ID=your_duitku_merchant_id
DUITKU_API_KEY=your_duitku_api_key

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# API
API_URL=http://localhost:3000
NODE_ENV=development
```

---

## 6. Testing

### Test Midtrans Sandbox
Use these test card numbers:

```
Visa (Success): 4811 1111 1111 1114
Visa (Decline): 4911 1111 1111 1113
Mastercard (Success): 5555 5555 5555 4444
Mastercard (Decline): 5105 1051 0510 5100
```

### Test Bank Transfer
Virtual accounts are generated automatically in sandbox.

---

## 7. Monitoring & Maintenance

1. **Monitor failed transactions**: Set up alerts for failed transfers
2. **Regular reconciliation**: Daily reconciliation between app and payment gateway
3. **Backup systems**: Have fallback payment methods
4. **Support system**: Quick response for transaction issues
5. **Compliance**: Ensure PCI DSS compliance for payment data

---

## Important Notes

- Implement proper error handling and logging
- Always use HTTPS in production
- Store sensitive data encrypted
- Implement 2FA for admin functions
- Regular security audits
- Maintain audit trails for all transactions
