import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, ChevronRight, Utensils, Star, MapPin, Clock, Ticket } from 'lucide-react';

const GonabFoodScreen = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Terdekat');

  const restaurants = [
    { id: 1, name: "Nasi Goreng Hebat Nabire", category: "Nasi Goreng", rating: 4.8, distance: "1.2 km", promo: "Diskon 20%" },
    { id: 2, name: "Seafood Oyehe Spesial", category: "Seafood", rating: 4.9, distance: "2.5 km", promo: "Gratis Ongkir" },
  ];

  return (
    <div className="min-h-screen bg-white pb-6">
      <div className="bg-white p-4 sticky top-0 z-20 shadow-sm flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="text-gray-700"><ChevronLeft size={28} /></button>
        <div className="flex-1 bg-gray-100 rounded-full flex items-center px-4 py-2">
          <Search size={18} className="text-gray-400 mr-2" />
          <input type="text" placeholder="Mau makan apa?" className="bg-transparent border-none outline-none w-full text-sm" />
        </div>
      </div>
      
      <div className="px-4 mt-4 mb-6">
        <div className="w-full bg-red-500 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
          <h3 className="font-extrabold text-xl relative z-10">Makan Kenyang!</h3>
          <p className="text-sm text-red-100 relative z-10">Diskon s.d 50% di Nabire</p>
          <Utensils size={48} className="absolute right-4 top-4 text-red-300 opacity-50" />
        </div>
      </div>

      <div className="flex px-4 space-x-3 overflow-x-auto no-scrollbar mb-6">
        {['Terdekat', 'Terlaris', 'Promo'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${activeTab === tab ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{tab}</button>
        ))}
      </div>

      <div className="px-4 space-y-6">
        <h2 className="font-bold text-lg text-gray-800">Rekomendasi di Nabire</h2>
        {restaurants.map(resto => (
          <div key={resto.id} className="flex space-x-4 border-b border-gray-100 pb-6">
            <div className="w-24 h-24 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400"><Utensils size={32} /></div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800">{resto.name}</h3>
              <p className="text-xs text-gray-500 mb-2">{resto.category}</p>
              <div className="flex text-xs font-semibold text-gray-700 space-x-3 mb-2">
                <span className="flex items-center text-yellow-500"><Star size={14} className="mr-1" /> {resto.rating}</span>
                <span className="flex items-center"><MapPin size={14} className="mr-1 text-gray-400" /> {resto.distance}</span>
              </div>
              {resto.promo && <div className="inline-block bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-md">{resto.promo}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GonabFoodScreen;