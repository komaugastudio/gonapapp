// Transfer Service - For real money transfers between users and external accounts

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Transfer ke user lain (antar pengguna GonabPay)
export const transferToUser = async (fromUserId, toUserIdentifier, amount, description = '') => {
  try {
    const response = await fetch(`${BASE_URL}/transfer/to-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fromUserId,
        toUserIdentifier, // Bisa berupa user ID, phone number, atau email
        amount,
        description,
        timestamp: new Date().toISOString(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Gagal melakukan transfer',
        transactionId: null,
      };
    }

    return {
      success: true,
      message: 'Transfer berhasil',
      transactionId: data.transactionId,
      newBalance: data.newBalance,
      recipientName: data.recipientName,
      timestamp: data.timestamp,
    };
  } catch (error) {
    console.error('Error transferring to user:', error);
    return {
      success: false,
      message: 'Terjadi kesalahan saat melakukan transfer',
      transactionId: null,
    };
  }
};

// Transfer ke bank account (real bank)
export const transferToBank = async (userId, bankCode, accountNumber, amount, accountName = '') => {
  try {
    const response = await fetch(`${BASE_URL}/transfer/to-bank`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        bankCode, // Code untuk bank (e.g., 'BCA', 'MANDIRI', 'BNI', etc.)
        accountNumber,
        amount,
        accountName,
        timestamp: new Date().toISOString(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Gagal melakukan transfer ke bank',
        transactionId: null,
      };
    }

    return {
      success: true,
      message: 'Transfer ke bank berhasil diproses',
      transactionId: data.transactionId,
      newBalance: data.newBalance,
      fee: data.fee || 0,
      totalAmount: data.totalAmount || amount + (data.fee || 0),
      bankName: data.bankName,
      timestamp: data.timestamp,
    };
  } catch (error) {
    console.error('Error transferring to bank:', error);
    return {
      success: false,
      message: 'Terjadi kesalahan saat melakukan transfer',
      transactionId: null,
    };
  }
};

// Get bank account list for user (saved accounts)
export const getSavedBankAccounts = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/transfer/saved-accounts/${userId}`);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        accounts: [],
      };
    }

    return {
      success: true,
      accounts: data.accounts,
    };
  } catch (error) {
    console.error('Error fetching saved accounts:', error);
    return {
      success: false,
      accounts: [],
    };
  }
};

// Save bank account
export const saveBankAccount = async (userId, bankCode, accountNumber, accountName, isDefault = false) => {
  try {
    const response = await fetch(`${BASE_URL}/transfer/save-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        bankCode,
        accountNumber,
        accountName,
        isDefault,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Gagal menyimpan akun bank',
      };
    }

    return {
      success: true,
      message: 'Akun bank berhasil disimpan',
      accountId: data.accountId,
    };
  } catch (error) {
    console.error('Error saving bank account:', error);
    return {
      success: false,
      message: 'Terjadi kesalahan saat menyimpan akun',
    };
  }
};

// Verify bank account
export const verifyBankAccount = async (bankCode, accountNumber) => {
  try {
    const response = await fetch(`${BASE_URL}/transfer/verify-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bankCode,
        accountNumber,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        accountName: null,
        message: data.message || 'Akun tidak ditemukan',
      };
    }

    return {
      success: true,
      accountName: data.accountName,
      message: 'Akun valid',
    };
  } catch (error) {
    console.error('Error verifying account:', error);
    return {
      success: false,
      accountName: null,
      message: 'Terjadi kesalahan saat verifikasi akun',
    };
  }
};

// Get transfer fee
export const getTransferFee = async (amount, bankCode = null) => {
  try {
    const url = new URL(`${BASE_URL}/transfer/fee`);
    url.searchParams.append('amount', amount);
    if (bankCode) url.searchParams.append('bankCode', bankCode);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        fee: 0,
      };
    }

    return {
      success: true,
      fee: data.fee,
    };
  } catch (error) {
    console.error('Error getting transfer fee:', error);
    return {
      success: false,
      fee: 0,
    };
  }
};

// Search user by phone or email
export const searchUserForTransfer = async (identifier) => {
  try {
    const response = await fetch(`${BASE_URL}/transfer/search-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier, // phone number or email
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        user: null,
        message: data.message || 'User tidak ditemukan',
      };
    }

    return {
      success: true,
      user: data.user,
      message: 'User ditemukan',
    };
  } catch (error) {
    console.error('Error searching user:', error);
    return {
      success: false,
      user: null,
      message: 'Terjadi kesalahan saat mencari user',
    };
  }
};

// Get transfer history
export const getTransferHistory = async (userId, limit = 20) => {
  try {
    const url = new URL(`${BASE_URL}/transfer/history/${userId}`);
    url.searchParams.append('limit', limit);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        transfers: [],
      };
    }

    return {
      success: true,
      transfers: data.transfers,
    };
  } catch (error) {
    console.error('Error fetching transfer history:', error);
    return {
      success: false,
      transfers: [],
    };
  }
};
