import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockHistory = [
  { id: 1, title: 'GonabRide - Nabire', date: '1 Des 2025', price: 'Rp 12.000' },
  { id: 2, title: 'GonabFood - Makan Siang', date: '3 Des 2025', price: 'Rp 45.000' },
];

const HistoryScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white p-4 shadow-sm flex items-center">
        <button onClick={() => navigate(-1)} className="text-gray-700">
          <ChevronLeft size={24} />
        </button>
        <h2 className="flex-1 text-center font-bold text-lg">Riwayat Pesanan</h2>
      </div>
      <div className="p-4">
        {mockHistory.length ? (
          <ul className="space-y-4">
            {mockHistory.map((item) => (
              <li key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-sm">
                <div>
                  <p className="font-medium text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.date}</p>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <span className="font-bold">{item.price}</span>
                  <ChevronRight size={18} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">Belum ada riwayat pesanan.</p>
        )}
      </div>
    </div>
  );
};

export default HistoryScreen;
