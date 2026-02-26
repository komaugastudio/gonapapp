import React from 'react';
import { ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockVouchers = [
  { id: 1, code: 'GONAB50', desc: 'Diskon 50% untuk makanan', expiry: '31 Des 2025' },
];

const VouchersScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white p-4 shadow-sm flex items-center">
        <button onClick={() => navigate(-1)} className="text-gray-700">
          <ChevronLeft size={24} />
        </button>
        <h2 className="flex-1 text-center font-bold text-lg">Voucher & Promo</h2>
      </div>
      <div className="p-4">
        {mockVouchers.length ? (
          <ul className="space-y-4">
            {mockVouchers.map((v) => (
              <li key={v.id} className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3">
                  <Tag size={24} className="text-yellow-600" />
                  <div>
                    <p className="font-medium text-gray-800">{v.code}</p>
                    <p className="text-xs text-gray-500">{v.desc}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">Berakhir {v.expiry}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">Belum ada voucher tersedia.</p>
        )}
      </div>
    </div>
  );
};

export default VouchersScreen;
