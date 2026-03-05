import React, { useState, useContext, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Loader, Search, ExternalLink } from 'lucide-react';
import { WalletContext } from '../../context/WalletContext';
import { formatRp } from '../../utils/format';
import { auth } from '../../firebase';
import apiClient from '../../services/apiClient';

const TransferModal = ({ onClose }) => {
  const { balance, addTransaction } = useContext(WalletContext);
  const [transferType, setTransferType] = useState('user'); // user or bank
  const [step, setStep] = useState('type'); // type, recipient, amount, confirm, success
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  // Bank transfer fields
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  // Selected recipient
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [description, setDescription] = useState('');

  const bankCodes = [
    { code: 'BCA', name: 'Bank Central Asia' },
    { code: 'MANDIRI', name: 'Bank Mandiri' },
    { code: 'BNI', name: 'Bank Negara Indonesia' },
    { code: 'BRI', name: 'Bank Rakyat Indonesia' },
    { code: 'CIMB', name: 'CIMB Niaga' },
  ];

  useEffect(() => {
    if (transferType === 'bank') {
      loadSavedBankAccounts();
    }
  }, [transferType]);

  const loadSavedBankAccounts = async () => {
    try {
      const response = await apiClient.get('/transfers/bank-accounts');
      if (response.data && response.data.accounts) {
        setSavedAccounts(response.data.accounts);
      }
    } catch (err) {
      console.error('Failed to load bank accounts:', err);
      setSavedAccounts([]);
    }
  };

  const handleSearchUser = async (query) => {
    if (!query) {
      setSearchResults(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.get('/transfers/search-user', {
        params: { query: query }
      });
      if (response.data && response.data.user) {
        setSearchResults({ user: response.data.user, message: response.data.message });
      } else {
        setSearchResults({ user: null, message: response.data?.message || 'User tidak ditemukan' });
      }
    } catch (err) {
      console.error('Search user error:', err);
      setSearchResults({ user: null, message: 'Terjadi kesalahan saat mencari user' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyBankAccount = async () => {
    if (!bankCode || !accountNumber) {
      setError('Pilih bank dan masukkan nomor rekening');
      return;
    }

    setVerifying(true);
    setError('');
    try {
      const response = await apiClient.post('/transfers/verify-account', {
        bankCode: bankCode,
        accountNumber: accountNumber,
      });
      if (response.data && response.data.accountName) {
        setAccountName(response.data.accountName);
        setVerified(true);
      } else {
        setError(response.data?.message || 'Verifikasi rekening gagal');
      }
    } catch (err) {
      console.error('Bank account verification error:', err);
      setError(err.response?.data?.message || 'Terjadi kesalahan saat verifikasi');
    } finally {
      setVerifying(false);
    }
  };

  const handleSaveBankAccount = async () => {
    if (!verified) {
      setError('Verifikasi akun terlebih dahulu');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post('/transfers/save-account', {
        bankCode: bankCode,
        accountNumber: accountNumber,
        accountName: accountName,
      });
      if (response.data && response.data.accountId) {
        loadSavedBankAccounts();
        setSelectedAccount({ id: response.data.accountId, bankCode, accountNumber, accountName });
        setStep('amount');
      } else {
        setError(response.data?.message || 'Gagal menyimpan akun');
      }
    } catch (err) {
      console.error('Save bank account error:', err);
      setError(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan akun');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError('User tidak terautentikasi');
      return;
    }

    const val = parseInt(amount.replace(/\D/g, ''));
    if (val <= 0) {
      setError('Nominal harus lebih dari Rp 0');
      return;
    }
    if (val > balance) {
      setError('Saldo tidak cukup');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let result;

      if (transferType === 'user') {
        // Transfer to user
        result = await apiClient.post('/transfers/to-user', {
          recipientUserId: selectedRecipient.id,
          amount: val,
          description: description,
        });
      } else {
        // Transfer to bank
        result = await apiClient.post('/transfers/to-bank', {
          bankAccountId: selectedAccount.id,
          amount: val,
        });
      }

      if (result.data && result.data.transferId) {
        // Record transaction
        await addTransaction(
          'debit',
          val,
          'transfer',
          transferType === 'user' ? 
            `Transfer ke ${selectedRecipient.name}` : 
            `Transfer ke ${selectedAccount.accountName} (${selectedAccount.bankCode})`,
          result.data.transferId
        );
        setIsSuccess(true);
      } else {
        setError(result.data?.message || 'Transfer gagal. Silakan coba lagi.');
      }
    } catch (err) {
      console.error('Transfer error:', err);
      setError(err.response?.data?.message || 'Terjadi kesalahan: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex flex-col justify-end">
      <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl p-6 relative animate-in slide-in-from-bottom duration-300 min-h-[50vh] overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 rounded-full p-1">
          <X size={24} />
        </button>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center h-64 text-center pt-8">
            <CheckCircle size={64} className="text-green-500 mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-gray-800">Transfer Berhasil!</h3>
            <p className="text-gray-500 mt-2">
              {transferType === 'user' ? `Uang dikirim ke ${selectedRecipient.name}` : `Uang ditransfer ke ${selectedAccount.accountName}`}
            </p>
            <p className="font-bold text-green-600 text-xl mt-4">{formatRp(parseInt(amount.replace(/\D/g, '')))}</p>
            <button
              onClick={onClose}
              className="mt-6 w-full py-3 bg-green-600 text-white rounded-full font-bold hover:bg-green-700"
            >
              Tutup
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold mb-6 text-gray-800 pt-2">Transfer Uang</h3>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm font-medium flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {step === 'type' ? (
              <>
                <p className="text-gray-600 text-sm mb-4">Pilih tujuan transfer</p>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setTransferType('user');
                      setStep('recipient');
                    }}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 transition"
                  >
                    <p className="font-bold text-gray-800">👤 Transfer ke User GonabPay</p>
                    <p className="text-sm text-gray-500">Kirim ke user lain yang memiliki akun GonabPay</p>
                  </button>

                  <button
                    onClick={() => {
                      setTransferType('bank');
                      setStep(savedAccounts.length > 0 ? 'select-account' : 'bank-account');
                    }}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 transition"
                  >
                    <p className="font-bold text-gray-800">🏦 Transfer ke Rekening Bank</p>
                    <p className="text-sm text-gray-500">Kirim ke rekening bank manapun di Indonesia</p>
                  </button>
                </div>
              </>
            ) : step === 'recipient' ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Cari Penerima (Nomor HP / Email)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="08xx... atau email@domain.com"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleSearchUser(searchQuery)}
                      disabled={isLoading}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Search size={20} />
                    </button>
                  </div>
                </div>

                {searchResults && (
                  <div className="mb-4 p-4 border border-gray-200 rounded-lg">
                    {searchResults.user ? (
                      <button
                        onClick={() => {
                          setSelectedRecipient(searchResults.user);
                          setStep('amount');
                        }}
                        className="w-full text-left hover:bg-gray-50 p-2 rounded"
                      >
                        <p className="font-bold text-gray-800">{searchResults.user.name}</p>
                        <p className="text-sm text-gray-500">{searchResults.user.phone}</p>
                      </button>
                    ) : (
                      <p className="text-red-600 text-sm">{searchResults.message}</p>
                    )}
                  </div>
                )}

                <button
                  onClick={() => setStep('type')}
                  className="w-full py-2 border border-gray-300 rounded-full font-semibold text-gray-700 hover:bg-gray-50 mt-4"
                >
                  Kembali
                </button>
              </>
            ) : step === 'select-account' ? (
              <>
                <p className="text-sm text-gray-600 mb-4">Pilih rekening tujuan</p>
                <div className="space-y-2 mb-4">
                  {savedAccounts.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => {
                        setSelectedAccount(acc);
                        setStep('amount');
                      }}
                      className="w-full p-4 border-2 border-gray-200 rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 transition"
                    >
                      <p className="font-bold text-gray-800">{acc.accountName}</p>
                      <p className="text-sm text-gray-500">{acc.bankCode} • {acc.accountNumber}</p>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setBankCode('');
                    setAccountNumber('');
                    setAccountName('');
                    setVerified(false);
                    setStep('bank-account');
                  }}
                  className="w-full py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 mb-3"
                >
                  + Tambah Rekening Baru
                </button>

                <button
                  onClick={() => setStep('type')}
                  className="w-full py-2 border border-gray-300 rounded-full font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Kembali
                </button>
              </>
            ) : step === 'bank-account' ? (
              <>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Bank</label>
                    <select
                      value={bankCode}
                      onChange={(e) => setBankCode(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                    >
                      <option value="">-- Pilih Bank --</option>
                      {bankCodes.map(bank => (
                        <option key={bank.code} value={bank.code}>{bank.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nomor Rekening</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => {
                        setAccountNumber(e.target.value);
                        setVerified(false);
                      }}
                      placeholder="Masukkan nomor rekening"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                    />
                  </div>

                  {verified && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-gray-600">Nama Pemilik Rekening</p>
                      <p className="font-bold text-green-600">{accountName}</p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleVerifyBankAccount}
                    disabled={verifying || verified}
                    className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg font-bold hover:bg-gray-300 disabled:opacity-50"
                  >
                    {verifying ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader size={18} className="animate-spin" /> Verifikasi...
                      </span>
                    ) : verified ? (
                      '✓ Terverifikasi'
                    ) : (
                      'Verifikasi Rekening'
                    )}
                  </button>

                  {verified && (
                    <button
                      type="button"
                      onClick={handleSaveBankAccount}
                      disabled={isLoading}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Menyimpan...' : 'Simpan Rekening & Lanjut'}
                    </button>
                  )}
                </form>

                <button
                  onClick={() => setStep(savedAccounts.length > 0 ? 'select-account' : 'type')}
                  className="w-full py-2 border border-gray-300 rounded-full font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Kembali
                </button>
              </>
            ) : step === 'amount' ? (
              <>
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Penerima</p>
                  <p className="font-bold text-gray-800">
                    {transferType === 'user' ? selectedRecipient?.name : `${selectedAccount?.bankCode} • ${selectedAccount?.accountNumber}`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[50000, 100000, 250000, 500000].map(val => (
                    <button
                      key={val}
                      onClick={() => setAmount(val.toString())}
                      className={`py-3 border rounded-lg font-semibold transition-all ${
                        amount === val.toString()
                          ? 'bg-blue-100 border-blue-600 text-blue-600'
                          : 'border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {formatRp(val).replace('Rp ', '')}
                    </button>
                  ))}
                </div>

                <form onSubmit={(e) => { e.preventDefault(); setStep('confirm'); }} className="space-y-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Atau masukkan nominal</label>
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                      <span className="px-4 text-gray-500 font-bold">Rp</span>
                      <input
                        type="text"
                        value={amount}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setAmount(val);
                        }}
                        placeholder="0"
                        className="flex-1 py-3 outline-none text-gray-800 font-bold"
                      />
                    </div>
                  </div>

                  {transferType === 'user' && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Catatan (Opsional)</label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Misalnya: untuk kuliah"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 text-sm"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!amount || parseInt(amount) <= 0}
                    className="w-full py-4 bg-blue-600 text-white rounded-full font-bold shadow-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    Lanjutkan
                  </button>
                </form>

                <button
                  onClick={() => setStep(transferType === 'user' ? 'recipient' : 'select-account')}
                  className="w-full py-2 border border-gray-300 rounded-full font-semibold text-gray-700 hover:bg-gray-50 mt-2"
                >
                  Kembali
                </button>
              </>
            ) : step === 'confirm' ? (
              <>
                <div className="mb-6 space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Penerima</p>
                    <p className="font-bold text-gray-800">
                      {transferType === 'user' ? selectedRecipient?.name : `${selectedAccount?.bankCode} • ${selectedAccount?.accountNumber}`}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Jumlah Transfer</p>
                    <p className="text-3xl font-bold text-blue-600">{formatRp(parseInt(amount.replace(/\D/g, '')))}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Saldo Setelah Transfer</p>
                    <p className="font-bold text-gray-800">
                      {formatRp(balance - parseInt(amount.replace(/\D/g, ''))) || 0}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleTransfer} className="space-y-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-green-600 text-white rounded-full font-bold shadow-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader size={20} className="animate-spin" /> Memproses...
                      </>
                    ) : (
                      'Konfirmasi Transfer'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('amount')}
                    className="w-full py-2 border border-gray-300 rounded-full font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Kembali
                  </button>
                </form>
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default TransferModal;
