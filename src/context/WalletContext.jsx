/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import apiClient from '../services/apiClient';

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jwtToken, setJwtToken] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setLoading(true);
        
        try {
          // Get JWT token from backend
          const authResponse = await apiClient.post('/auth/verify', {
            firebaseUid: currentUser.uid,
            phoneNumber: currentUser.phoneNumber || 'unknown',
          });
          
          const token = authResponse.data.accessToken;
          setJwtToken(token);
          localStorage.setItem('jwtToken', token);

          // Fetch wallet balance
          const balanceResponse = await apiClient.get('/wallet/balance');
          setBalance(balanceResponse.data.balance || 0);

          // Fetch transactions
          const transResponse = await apiClient.get('/transactions?limit=50');
          setTransactions(transResponse.data.data || []);
        } catch (error) {
          console.warn('Backend not ready, using fallback balance:', error.message);
          // Fallback to default balance if backend is down
          setBalance(150000);
          setTransactions([]);
        }
        
        setLoading(false);
      } else {
        setBalance(0);
        setTransactions([]);
        setJwtToken(null);
        localStorage.removeItem('jwtToken');
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  const topUp = async (amount, method = 'card') => {
    if (!jwtToken || amount <= 0) return null;

    try {
      // Call backend to initiate payment
      const response = await apiClient.post('/payment/initiate', {
        amount,
        paymentType: 'topup',
        paymentMethod: method,
      });

      return response.data; // { redirectUrl, token, orderId }
    } catch (error) {
      console.error('Top up failed:', error);
      return null;
    }
  };

  const addTransaction = async (transactionData) => {
    if (!jwtToken) return false;

    try {
      const response = await apiClient.post('/transactions', transactionData);
      
      if (response.data.status === 'success') {
        // Update balance locally
        setBalance(response.data.balanceAfter);
        
        // Refresh transactions
        const transResponse = await apiClient.get('/transactions?limit=50');
        setTransactions(transResponse.data.data || []);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Add Transaction error:', error);
      return false;
    }
  };

  const transfer = async (transferData) => {
    if (!jwtToken) return false;

    try {
      const response = await apiClient.post('/transactions', {
        type: 'transfer',
        amount: transferData.amount,
        recipientUserId: transferData.recipientId,
        description: transferData.description || `Transfer ke ${transferData.recipientName}`,
        paymentMethod: 'wallet',
      });

      if (response.data.status === 'success') {
        setBalance(response.data.balanceAfter);
        const transResponse = await apiClient.get('/transactions?limit=50');
        setTransactions(transResponse.data.data || []);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Transfer error:', error);
      return false;
    }
  };

  const pay = async (amount, merchant = 'Merchant', category = 'payment', description = 'Pembayaran') => {
    if (!jwtToken || balance < amount || amount <= 0) return false;

    try {
      const response = await apiClient.post('/transactions', {
        type: category === 'food' ? 'payment' : category === 'ride' ? 'payment' : 'payment',
        amount,
        description: description || `${category} payment to ${merchant}`,
        paymentMethod: 'wallet',
        metadata: {
          merchant,
          category,
        },
      });

      if (response.data.status === 'success') {
        setBalance(response.data.balanceAfter);
        const transResponse = await apiClient.get('/transactions?limit=50');
        setTransactions(transResponse.data.data || []);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Payment error:', error);
      return false;
    }
  };

  return (
    <WalletContext.Provider value={{ balance, addTransaction, transfer, pay, topUp, transactions, loading, jwtToken }}>
      {children}
    </WalletContext.Provider>
  );
};