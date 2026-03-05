// Payment Gateway Service - Midtrans Integration
// For real payment processing

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
const MIDTRANS_SERVER_KEY = import.meta.env.VITE_MIDTRANS_SERVER_KEY;

// Initialize payment via Midtrans Snap
export const initiateMidtransPayment = async (userId, amount, method = 'card') => {
  try {
    const response = await fetch(`${BASE_URL}/payment/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        amount,
        paymentMethod: method,
        orderId: `TOP-UP-${userId}-${Date.now()}`,
        customerDetails: {
          userId,
        },
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Gagal menginisiasi pembayaran',
        redirectUrl: null,
        token: null,
      };
    }

    return {
      success: true,
      message: 'Pembayaran diinisiasi',
      redirectUrl: data.redirectUrl,
      token: data.token,
      orderId: data.orderId,
    };
  } catch (error) {
    console.error('Error initiating payment:', error);
    return {
      success: false,
      message: 'Terjadi kesalahan saat menginisiasi pembayaran',
      redirectUrl: null,
      token: null,
    };
  }
};

// Check payment status
export const checkPaymentStatus = async (orderId) => {
  try {
    const response = await fetch(`${BASE_URL}/payment/status/${orderId}`);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        status: 'unknown',
        message: 'Gagal mengecek status pembayaran',
      };
    }

    return {
      success: true,
      status: data.transactionStatus, // capture, settlement, pending, deny, cancel, expire
      message: data.statusMessage,
      amount: data.transactionAmount,
    };
  } catch (error) {
    console.error('Error checking payment status:', error);
    return {
      success: false,
      status: 'unknown',
      message: 'Terjadi kesalahan saat mengecek status',
    };
  }
};

// Bank Transfer Top-up (VA - Virtual Account)
export const createBankTransferVA = async (userId, amount) => {
  try {
    const response = await fetch(`${BASE_URL}/payment/bank-transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        amount,
        orderId: `BANK-TRANSFER-${userId}-${Date.now()}`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Gagal membuat nomor virtual account',
        vaNumbers: null,
      };
    }

    return {
      success: true,
      message: 'Nomor Virtual Account berhasil dibuat',
      vaNumbers: data.vaNumbers, // Array of VA numbers for different banks
      amount: data.amount,
      expireTime: data.expireTime,
    };
  } catch (error) {
    console.error('Error creating bank transfer VA:', error);
    return {
      success: false,
      message: 'Terjadi kesalahan saat membuat nomor rekening virtual',
      vaNumbers: null,
    };
  }
};

// E-Wallet Payment (OVO, DANA, GoPay, etc.)
export const initiateEWalletPayment = async (userId, amount, walletType) => {
  try {
    const response = await fetch(`${BASE_URL}/payment/ewallet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        amount,
        walletType, // ovo, dana, gopay, linkaja
        orderId: `EWALLET-${userId}-${Date.now()}`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Gagal menginisiasi pembayaran e-wallet',
        redirectUrl: null,
      };
    }

    return {
      success: true,
      message: 'Pembayaran e-wallet diinisiasi',
      redirectUrl: data.redirectUrl,
      orderId: data.orderId,
    };
  } catch (error) {
    console.error('Error initiating e-wallet payment:', error);
    
    // Fallback: If backend is not available and in development mode
    if (import.meta.env.DEV && error instanceof TypeError) {
      console.warn('Backend e-wallet endpoint not available. Using mock mode for development.');
      return {
        success: false,
        message: `E-Wallet backend belum diimplementasikan. Mohon hubungi developer untuk setup backend.`,
        redirectUrl: null,
      };
    }
    
    return {
      success: false,
      message: 'Terjadi kesalahan saat menginisiasi pembayaran',
      redirectUrl: null,
    };
  }
};

// Get Payment Methods
export const getAvailablePaymentMethods = async () => {
  try {
    const response = await fetch(`${BASE_URL}/payment/methods`);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        methods: [],
      };
    }

    return {
      success: true,
      methods: data.methods,
    };
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return {
      success: false,
      methods: [],
    };
  }
};
