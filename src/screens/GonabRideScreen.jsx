import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Bike, Car, User, Clock } from 'lucide-react';

const GonabRideScreen = () => {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState('Oyehe, Nabire, Papua Tengah');
  const [dropoff, setDropoff] = useState('');
  const [showPrice, setShowPrice] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowPrice(dropoff.length > 2), 500);
    return () => clearTimeout(timer);
  }, [dropoff]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col relative">
      <div className="absolute inset-0 z-0 bg-gray-200">
        <iframe title="Peta Lokasi" width="100%" height="100%" frameBorder="0" src={`https://maps.google.com/maps?q=${encodeURIComponent(pickup || 'Nabire, Papua Tengah')}&t=&z=15&ie=UTF8&iwloc=&output=embed`} allowFullScreen loading="lazy"></iframe>
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent pointer-events-none"></div>
      </div>

      <div className="relative z-10 p-4">
        <button onClick={() => navigate(-1)} className="bg-white p-2 rounded-full shadow-md text-gray-700 hover:bg-gray-50"><ChevronLeft size={24} /></button>
      </div>

      <div className="relative z-10 mt-auto bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] pt-2 pb-6 px-4">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Mau pergi ke mana?</h2>

        <div className="relative pl-8 mb-6">
          <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-gray-200 border-l-2 border-dotted border-gray-300"></div>
          <div className="relative mb-4">
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full border-4 border-green-100"></div>
            <input type="text" value={pickup} onChange={(e) => setPickup(e.target.value)} className="w-full bg-gray-100 p-3 rounded-xl outline-none focus:ring-1 focus:ring-green-500 text-sm font-medium" placeholder="Cari lokasi jemput..." />
          </div>
          <div className="relative">
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full border-4 border-red-100"></div>
            <input type="text" value={dropoff} onChange={(e) => setDropoff(e.target.value)} className="w-full bg-gray-100 p-3 rounded-xl outline-none focus:ring-1 focus:ring-red-500 text-sm font-medium" placeholder="Cari lokasi tujuan" />
          </div>
        </div>

        {showPrice && (
          <div className="space-y-3 mb-6 animate-in fade-in">
            <h3 className="font-bold text-gray-700 text-sm mb-2">Pilih Kendaraan</h3>
            <div className="flex items-center justify-between p-3 border border-green-500 bg-green-50 rounded-xl cursor-pointer">
              <div className="flex items-center space-x-4">
                <Bike size={32} className="text-green-600" />
                <div><h4 className="font-bold text-gray-800">GonabRide</h4><p className="text-xs text-gray-500 flex items-center"><User size={12} className="mr-1"/> 1 Orang • <Clock size={12} className="ml-2 mr-1"/> 3 mnt</p></div>
              </div>
              <p className="font-bold text-lg text-gray-800">Rp 12.000</p>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 hover:border-green-500 hover:bg-green-50 rounded-xl cursor-pointer transition-all">
              <div className="flex items-center space-x-4">
                <Car size={32} className="text-gray-600" />
                <div><h4 className="font-bold text-gray-800">GonabCar</h4><p className="text-xs text-gray-500 flex items-center"><User size={12} className="mr-1"/> 1-4 Orang • <Clock size={12} className="ml-2 mr-1"/> 5 mnt</p></div>
              </div>
              <p className="font-bold text-lg text-gray-800">Rp 25.000</p>
            </div>
          </div>
        )}
        <button disabled={!showPrice} className="w-full bg-green-600 text-white font-bold text-lg py-4 rounded-full shadow-lg hover:bg-green-700 disabled:opacity-50">
          {showPrice ? "Pesan Sekarang" : "Pilih Tujuan Dulu"}
        </button>
      </div>
    </div>
  );
};

export default GonabRideScreen;
