# Backend Server Setup - Quick Start

## Error: `net::ERR_CONNECTION_REFUSED`

Ini berarti backend server Anda tidak berjalan di `http://localhost:3000`.

---

## ☑️ Solution 1: Gunakan Kartu Kredit/Bank Transfer (Recommended)

Alih-alih menggunakan e-wallet (yang membutuhkan backend custom), gunakan:

1. **💳 Kartu Kredit** - Langsung via Midtrans Snap (SUDAH BERJALAN)
2. **🏦 Bank Transfer VA** - Sudah terintegrasi, butuh backend

Untuk testing sekarang: Skip e-wallet, gunakan card payment dulu.

---

## ☑️ Solution 2: Implementasi Backend Minimal

Buat file `backend.js` atau `server.js` di folder project atau di-deploy di Vercel/Railway.

### Opsi A: Express.js Server Local (Node.js)

**File: `backend/server.js`**

```javascript
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Auth middleware
const verifyAuth = (req, res, next) => {
  // For testing phase, skip auth
  // In production, verify Firebase token
  next();
};

// ======= PAYMENT ENDPOINTS =======

// Payment Initiate (Midtrans)
app.post('/api/payment/initiate', verifyAuth, async (req, res) => {
  try {
    const { amount, paymentMethod, orderId } = req.body;

    // Call Midtrans to create snap token
    const response = await axios.post(
      'https://app.sandbox.midtrans.com/snap/v2/transactions',
      {
        transaction_details: {
          order_id: orderId,
          gross_amount: amount,
        },
        enabled_payments: ['credit_card', 'bank_transfer'],
        credit_card: { secure: true }
      },
      {
        auth: {
          username: process.env.MIDTRANS_SERVER_KEY,
          password: ''
        }
      }
    );

    res.json({
      success: true,
      token: response.data.token,
      redirectUrl: response.data.redirect_url,
      orderId
    });
  } catch (error) {
    console.error('Midtrans error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat payment'
    });
  }
});

// Payment Status Check
app.get('/api/payment/status/:orderId', verifyAuth, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Check status di Midtrans
    const response = await axios.get(
      `https://app.sandbox.midtrans.com/snap/v2/${orderId}/status`,
      {
        auth: {
          username: process.env.MIDTRANS_SERVER_KEY,
          password: ''
        }
      }
    );

    res.json({
      success: true,
      transactionStatus: response.data.transaction_status,
      statusMessage: getStatusMessage(response.data.transaction_status),
      transactionAmount: response.data.gross_amount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unknown'
    });
  }
});

// Bank Transfer - Create VA
app.post('/api/payment/bank-transfer', verifyAuth, async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    // Create VA via Midtrans
    const vaNumbers = [];
    const banks = ['bca', 'mandiri', 'bni'];

    for (const bank of banks) {
      try {
        const response = await axios.post(
          'https://app.sandbox.midtrans.com/snap/v2/transactions',
          {
            payment_type: 'bank_transfer',
            bank_transfer: { bank },
            transaction_details: {
              order_id: `${orderId}-${bank}`,
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
      } catch (e) {
        console.error(`VA creation for ${bank} failed:`, e.message);
      }
    }

    res.json({
      success: true,
      message: 'Nomor VA berhasil dibuat',
      vaNumbers,
      amount,
      expireTime: '24 jam'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal membuat VA'
    });
  }
});

// E-Wallet Payment
app.post('/api/payment/ewallet', verifyAuth, async (req, res) => {
  try {
    const { amount, walletType, orderId } = req.body;

    // Create payment via Midtrans
    const paymentTypeMap = {
      'ovo': 'ovo',
      'dana': 'dana',
      'gopay': 'gopay'
    };

    const response = await axios.post(
      'https://app.sandbox.midtrans.com/snap/v2/transactions',
      {
        payment_type: 'digital_wallet',
        digital_wallet: {
          type: paymentTypeMap[walletType]
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

    res.json({
      success: true,
      message: `${walletType.toUpperCase()} payment initiated`,
      redirectUrl: response.data.redirect_url,
      orderId
    });
  } catch (error) {
    console.error('E-wallet error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal menginisiasi e-wallet payment'
    });
  }
});

// ======= TRANSFER ENDPOINTS =======

// Search User
app.post('/api/transfer/search-user', verifyAuth, async (req, res) => {
  try {
    const { identifier } = req.body;

    // Mock: Cari user dari database
    // For demo, returning mock user
    const mockUsers = {
      '08123456789': { id: 'user2', name: 'Budi Santoso', phone: '08123456789' },
      'budi@example.com': { id: 'user2', name: 'Budi Santoso', phone: '08123456789' }
    };

    if (mockUsers[identifier]) {
      res.json({
        success: true,
        user: mockUsers[identifier]
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mencari user'
    });
  }
});

// Transfer to User
app.post('/api/transfer/to-user', verifyAuth, async (req, res) => {
  try {
    const { fromUserId, toUserIdentifier, amount, description } = req.body;

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Nominal harus lebih dari Rp 0'
      });
    }

    // Mock: Process transfer
    res.json({
      success: true,
      message: 'Transfer berhasil',
      transactionId: `TRX-${Date.now()}`,
      newBalance: 500000,
      recipientName: 'Budi Santoso',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat melakukan transfer'
    });
  }
});

// Transfer to Bank
app.post('/api/transfer/to-bank', verifyAuth, async (req, res) => {
  try {
    const { userId, bankCode, accountNumber, amount, accountName } = req.body;

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Nominal harus lebih dari Rp 0'
      });
    }

    // Mock: Process bank transfer
    const fee = 5000;
    res.json({
      success: true,
      message: 'Transfer ke bank berhasil diproses',
      transactionId: `BANK-${Date.now()}`,
      newBalance: 500000 - amount - fee,
      fee,
      totalAmount: amount + fee,
      bankName: 'Bank Central Asia',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat melakukan transfer'
    });
  }
});

// Verify Bank Account
app.post('/api/transfer/verify-account', verifyAuth, async (req, res) => {
  try {
    const { bankCode, accountNumber } = req.body;

    // Mock verification
    res.json({
      success: true,
      accountName: 'BUDI SANTOSO',
      message: 'Akun valid'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal memverifikasi akun',
      accountName: null
    });
  }
});

// Save Bank Account
app.post('/api/transfer/save-account', verifyAuth, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Akun bank berhasil disimpan',
      accountId: `account-${Date.now()}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menyimpan akun'
    });
  }
});

// Get Saved Accounts
app.get('/api/transfer/saved-accounts/:userId', verifyAuth, async (req, res) => {
  try {
    res.json({
      success: true,
      accounts: [
        {
          id: 'account1',
          bankCode: 'BCA',
          accountNumber: '1234567890',
          accountName: 'John Doe',
          isDefault: true
        }
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      accounts: []
    });
  }
});

// Get Transfer Fee
app.get('/api/transfer/fee', verifyAuth, async (req, res) => {
  try {
    const fee = 5000;
    res.json({
      success: true,
      fee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      fee: 0
    });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server running', timestamp: new Date() });
});

// Utility Functions
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

function getBankName(code) {
  const names = {
    'bca': 'Bank Central Asia',
    'mandiri': 'Bank Mandiri',
    'bni': 'Bank Negara Indonesia'
  };
  return names[code] || code;
}

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📍 Payment API: http://localhost:${PORT}/api/payment`);
  console.log(`📍 Transfer API: http://localhost:${PORT}/api/transfer`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});
```

**File: `backend/.env`**

```env
PORT=3000
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
```

**Install dependencies:**

```bash
npm install express cors axios dotenv
```

**Run server:**

```bash
node server.js
```

---

## ☑️ Solution 3: Deploy Backend ke Cloud

### Opsi B: Vercel (Recommended, Free)

**File: `api/payment.js`**

```javascript
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { amount, paymentMethod, orderId } = req.body;
    
    // Call Midtrans...
    return res.json({
      success: true,
      token: '...',
      redirectUrl: '...',
      orderId
    });
  }

  res.status(400).json({ error: 'Method not allowed' });
}
```

Deploy dengan `vercel deploy`.

### Opsi C: Railway/Render (Free tier)

Upload kode Express.js Anda ke GitHub, connect ke Railway/Render, auto-deploy.

---

## ☑️ Solution 4: Mock Mode untuk Development

Jika ingin test tanpa backend, edit `.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_USE_MOCK_PAYMENT=true
```

Kemudian update `paymentService.js`:

```javascript
const USE_MOCK = import.meta.env.VITE_USE_MOCK_PAYMENT === 'true';

export const initiateMidtransPayment = async (userId, amount, method) => {
  if (USE_MOCK) {
    return {
      success: true,
      token: 'mock-token-' + Date.now(),
      redirectUrl: 'about:blank',
      orderId: 'MOCK-' + Date.now()
    };
  }
  // ... normal implementation
};
```

---

## 🎯 Recommended Setup

**Untuk Development:**
- Gunakan local backend server (Node.js/Express)
- Atau gunakan Mock Mode

**Untuk Production:**
- Deploy ke Vercel/Railway/Heroku
- Use real Midtrans + Bank partner APIs
- Implement proper authentication

---

## ✅ Checklist

- [ ] Backend server running di port 3000
- [ ] Test: `curl http://localhost:3000/api/health` (should return status: ok)
- [ ] `.env` file updated dengan API URL
- [ ] Midtrans keys configured
- [ ] Frontend can now connect to backend

---

## 🔥 Quick Test

Buka browser console, run:

```javascript
fetch('http://localhost:3000/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Backend connected!', d))
  .catch(e => console.error('❌ Backend not running:', e))
```

Jika muncul `✅ Backend connected!`, maka backend sudah berjalan!
