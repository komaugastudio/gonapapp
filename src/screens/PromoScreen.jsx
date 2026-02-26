import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PromoScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white p-4 shadow-sm flex items-center">
        <button onClick={() => navigate(-1)} className="text-gray-700">
          <ChevronLeft size={24} />
        </button>
        <h2 className="flex-1 text-center font-bold text-lg">Promo</h2>
      </div>
      <div className="p-6 text-center text-gray-500">
        Lihat promo menarik di sini.
      </div>
    </div>
  );
};

export default PromoScreen;
