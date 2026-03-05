import React, { useContext } from 'react';
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, Calendar, DollarSign, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WalletContext } from '../context/WalletContext';
import { formatRp } from '../utils/format';

const HistoryScreen = () => {
  const navigate = useNavigate();
  const { transactions, loading } = useContext(WalletContext);

  const getTransactionIcon = (type, subtype) => {
    if (type === 'topup') return <ArrowDownLeft size={20} className="text-green-600" />;
    if (type === 'payment' && subtype === 'ride') return <ArrowUpRight size={20} className="text-red-600" />;
    if (type === 'payment' && subtype === 'food') return <ArrowUpRight size={20} className="text-orange-600" />;
    if (type === 'payment' && subtype === 'mart') return <ArrowUpRight size={20} className="text-purple-600" />;
    return <ArrowUpRight size={20} className="text-red-600" />;
  };

  const getTransactionColor = (type, subtype) => {
    if (type === 'topup') return 'bg-green-50 border-green-100';
    if (type === 'payment' && subtype === 'ride') return 'bg-red-50 border-red-100';
    if (type === 'payment' && subtype === 'food') return 'bg-orange-50 border-orange-100';
    if (type === 'payment' && subtype === 'mart') return 'bg-purple-50 border-purple-100';
    return 'bg-red-50 border-red-100';
  };

  const formatDate = (date) => {
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString('id-ID', { 
        day: 'short', 
        month: 'short', 
        year: 'numeric' 
      });
    } else if (date instanceof Date) {
      return date.toLocaleDateString('id-ID', { 
        day: 'short', 
        month: 'short', 
        year: 'numeric' 
      });
    }
    return 'N/A';
  };

  const formatTime = (date) => {
    if (typeof date === 'string') {
      return new Date(date).toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (date instanceof Date) {
      return date.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 shadow-sm flex items-center sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="text-gray-700 hover:bg-gray-100 p-1 rounded">
          <ChevronLeft size={24} />
        </button>
        <h2 className="flex-1 text-center font-bold text-lg">Riwayat Transaksi</h2>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader size={40} className="text-gray-400 animate-spin mb-4" />
            <p className="text-gray-500">Memuat transaksi...</p>
          </div>
        ) : transactions && transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((trans) => (
              <div 
                key={trans.id} 
                className={`p-4 rounded-lg border ${getTransactionColor(trans.type, trans.subtype)} cursor-pointer hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-grow">
                    <div className="mt-1">
                      {getTransactionIcon(trans.type, trans.subtype)}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="font-semibold text-gray-800 text-sm">
                        {trans.type === 'topup' ? `Top Up ${trans.method}` : trans.merchant || trans.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{trans.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {formatDate(trans.timestamp)}
                        </span>
                        <span>{formatTime(trans.timestamp)}</span>
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${
                          trans.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {trans.status === 'success' ? 'Sukses' : 'Menunggu'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-2 flex-shrink-0">
                    <p className={`font-bold text-lg ${
                      trans.type === 'topup' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {trans.type === 'topup' ? '+' : '-'}{formatRp(trans.amount)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Saldo: {formatRp(trans.balanceAfter)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200 text-center">
              <p className="text-sm text-gray-600">Showing {transactions.length} recent transactions</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-600 font-semibold">Belum ada transaksi</p>
            <p className="text-xs text-gray-500 mt-2">Transaksi Anda akan muncul di sini</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryScreen;
