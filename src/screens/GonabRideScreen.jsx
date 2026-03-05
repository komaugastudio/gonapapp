import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Bike, Car, User, Clock, Heart, Star, Zap, Shield, Users, FileText, ArrowRight, AlertCircle, Loader, CheckCircle } from 'lucide-react';
import { WalletContext } from '../context/WalletContext';
import { useContext } from 'react';
import { formatRp } from '../utils/format';
import { auth } from '../firebase';
import apiClient from '../services/apiClient';
import Map from '../components/Map';

const GonabRideScreen = () => {
  const navigate = useNavigate();
  const { balance, pay, addTransaction } = useContext(WalletContext);
  const [pickup, setPickup] = useState('Oyehe, Nabire, Papua Tengah');
  const [dropoff, setDropoff] = useState('');
  const [showPrice, setShowPrice] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [passengers, setPassengers] = useState(1);
  const [promoCode, setPromoCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [shareRide, setShareRide] = useState(false);
  const [scheduleRide, setScheduleRide] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null); // 'processing', 'success', 'error'
  const [bookingError, setBookingError] = useState('');
  const [bookingData, setBookingData] = useState(null);

  const favorites = [
    { id: 1, name: 'Rumah', address: 'Oyehe, Nabire, Papua Tengah' },
    { id: 2, name: 'Kantor', address: 'Jl. Kartini, Nabire, Papua Tengah' },
    { id: 3, name: 'Mal', address: 'Mal Nabire, Nabire, Papua Tengah' },
  ];

  const vehicles = [
    {
      id: 'gonabride',
      name: 'GonabRide',
      icon: Bike,
      color: 'text-green-600',
      passengers: 1,
      eta: 3,
      basePrice: 12000,
      pricePerKm: 3000,
      description: 'Ojek Motor - Cepat & Terjangkau',
      rating: 4.8,
      reviews: 24500,
    },
    {
      id: 'gonabcar',
      name: 'GonabCar',
      icon: Car,
      color: 'text-gray-600',
      passengers: 4,
      eta: 5,
      basePrice: 25000,
      pricePerKm: 5000,
      description: 'Taksi Online - Nyaman & Aman',
      rating: 4.9,
      reviews: 31200,
    },
  ];

  const promoCodes = [
    { code: 'RIDE50', discount: 50000, maxUse: 'Sisa 3x', tag: 'Diskon' },
    { code: 'GOJEK20', discount: 20000, maxUse: 'Unlimited', tag: 'Promo' },
    { code: 'SHARE15', discount: 15000, maxUse: 'Sisa 5x', tag: 'Share' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setShowPrice(dropoff.length > 2), 500);
    return () => clearTimeout(timer);
  }, [dropoff]);

  const calculatePrice = (vehicle) => {
    const distanceMultiplier = dropoff.length / 5;
    const basePrice = vehicle.basePrice;
    const distancePrice = vehicle.pricePerKm * distanceMultiplier;
    const totalPrice = Math.round(basePrice + distancePrice);

    if (passengers > 1 && shareRide) {
      return Math.round(totalPrice / passengers);
    }
    return totalPrice;
  };

  const handleConfirmBooking = async () => {
    if (!selectedVehicle || !dropoff) return;

    const finalPrice = calculatePrice(selectedVehicle);

    // Cek saldo
    if (paymentMethod === 'wallet' && balance < finalPrice) {
      setBookingError('Saldo GonabPay Anda tidak mencukupi');
      setBookingStatus('error');
      setTimeout(() => setBookingStatus(null), 3000);
      return;
    }

    setBookingStatus('processing');
    setBookingError('');

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setBookingError('User tidak terautentikasi');
        setBookingStatus('error');
        return;
      }

      // Call backend to create ride booking
      const rideData = {
        pickup: pickup.trim(),
        dropoff: dropoff.trim(),
        vehicleType: selectedVehicle.id,
        passengers: passengers,
        payment_method: paymentMethod,
        promo_code: promoCode || null,
        estimated_price: finalPrice,
        scheduled_time: scheduleRide ? scheduleTime : null,
        share_ride: shareRide,
      };

      const response = await apiClient.post('/rides', rideData);

      if (response.data && response.data.rideId) {
        // Record transaction
        const description = `Perjalanan ${selectedVehicle.name} dari ${pickup.split(',')[0]} ke ${dropoff.split(',')[0]}`;
        await addTransaction(
          'debit',
          finalPrice,
          'ride',
          description,
          response.data.rideId
        );

        // Save booking data
        setBookingData({
          rideId: response.data.rideId,
          vehicle: selectedVehicle.name,
          price: finalPrice,
          pickup,
          dropoff,
          passengers,
          timestamp: new Date(),
        });
        setBookingStatus('success');

        // Redirect to home after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setBookingError('Pemesanan gagal. Silakan coba lagi.');
        setBookingStatus('error');
      }
    } catch (error) {
      console.error('Booking error:', error);
      setBookingError(error.response?.data?.message || 'Terjadi kesalahan: ' + error.message);
      setBookingStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col relative">
      <div className="absolute inset-0 z-0 bg-gray-200">
        <Map 
          pickup={pickup}
          dropoff={dropoff}
          height="100%"
          onLocationSelect={(coords) => {
            console.log('Selected location:', coords);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent pointer-events-none"></div>
      </div>

      <div className="relative z-10 p-4">
        <button onClick={() => navigate(-1)} className="bg-white p-2 rounded-full shadow-md text-gray-700 hover:bg-gray-50"><ChevronLeft size={24} /></button>
      </div>

      <div className="relative z-10 mt-auto bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] pt-2 pb-6 px-4 max-h-[75vh] overflow-y-auto">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>

        {!selectedVehicle ? (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Mau pergi ke mana?</h2>

            <div className="relative pl-8 mb-4">
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

            {!showPrice && (
              <div className="mb-4">
                <button onClick={() => setShowFavorites(!showFavorites)} className="w-full text-left text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <Heart size={14} className="text-red-500" /> Lokasi Favorit
                </button>
                {showFavorites && (
                  <div className="space-y-2">
                    {favorites.map((fav) => (
                      <button key={fav.id} onClick={() => setDropoff(fav.address)} className="w-full text-left p-2 hover:bg-green-50 rounded-lg">
                        <p className="font-medium text-sm text-gray-800">{fav.name}</p>
                        <p className="text-xs text-gray-500">{fav.address}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {showPrice && (
              <div className="space-y-4 mb-6 animate-in fade-in">
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                  <Users size={16} className="text-blue-600" />
                  <div className="flex-grow">
                    <p className="text-xs text-gray-600">Penumpang</p>
                    <p className="text-sm font-bold text-gray-800">{passengers} Orang</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setPassengers(Math.max(1, passengers - 1))} className="px-2 py-1 bg-white border border-gray-200 rounded hover:bg-gray-50">−</button>
                    <button onClick={() => setPassengers(Math.min(4, passengers + 1))} className="px-2 py-1 bg-white border border-gray-200 rounded hover:bg-gray-50">+</button>
                  </div>
                </div>

                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" checked={shareRide} onChange={(e) => setShareRide(e.target.checked)} className="w-4 h-4 accent-green-600" />
                  <div className="ml-3 flex-grow">
                    <p className="font-semibold text-sm text-gray-800">GonabPool</p>
                    <p className="text-xs text-gray-500">Berbagi perjalanan, hemat biaya hingga 50%</p>
                  </div>
                </label>

                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" checked={scheduleRide} onChange={(e) => setScheduleRide(e.target.checked)} className="w-4 h-4 accent-green-600" />
                  <div className="ml-3 flex-grow">
                    <p className="font-semibold text-sm text-gray-800">Jadwalkan Perjalanan</p>
                    {scheduleRide && <input type="datetime-local" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="mt-1 w-full text-xs p-1 border border-gray-200 rounded" />}
                  </div>
                </label>

                <div>
                  <h3 className="font-bold text-gray-700 text-sm mb-2">Pilih Kendaraan</h3>
                  <div className="space-y-2">
                    {vehicles.map((vehicle) => {
                      const price = calculatePrice(vehicle);
                      const Icon = vehicle.icon;
                      return (
                        <button key={vehicle.id} onClick={() => setSelectedVehicle(vehicle)} className="w-full p-3 border border-gray-200 hover:border-green-500 hover:bg-green-50 rounded-xl transition-all text-left group">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <Icon size={28} className={vehicle.color} />
                              <div>
                                <h4 className="font-bold text-gray-800 text-sm">{vehicle.name}</h4>
                                <p className="text-xs text-gray-500">{vehicle.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                  <span className="text-xs font-semibold text-gray-700">{vehicle.rating}</span>
                                  <span className="text-xs text-gray-500">({vehicle.reviews.toLocaleString()})</span>
                                </div>
                              </div>
                            </div>
                            <p className="font-bold text-lg text-gray-800">Rp {price.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center gap-1"><User size={12} /> {vehicle.passengers} Orang</span>
                            <span className="flex items-center gap-1"><Clock size={12} /> {vehicle.eta} mnt</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {showPrice && (
              <>
                <div className="mb-4 space-y-2">
                  <p className="font-semibold text-gray-800 text-sm">Promo/Voucher</p>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {promoCodes.map((promo) => (
                      <button key={promo.code} onClick={() => setPromoCode(promo.code)} className={`flex-shrink-0 px-3 py-2 rounded-lg border text-xs font-semibold whitespace-nowrap transition-all ${promoCode === promo.code ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-700 hover:border-green-300'}`}>
                        <span className="block text-[10px] text-gray-500">{promo.tag}</span>
                        <Tag size={12} className="inline mr-1" /> {promo.code}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tarif Dasar</span>
                    <span className="font-semibold">Rp 12.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Jarak & Waktu</span>
                    <span className="font-semibold">Rp 15.000</span>
                  </div>
                  {promoCode && <div className="flex justify-between text-green-600 border-t border-gray-200 pt-2">
                    <span>Promo</span>
                    <span>-Rp 10.000</span>
                  </div>}
                  <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-green-600">Rp 17.000</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="font-semibold text-gray-800 text-sm mb-2">Metode Pembayaran</p>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50" style={{ borderColor: paymentMethod === 'wallet' ? '#10b981' : '#e5e7eb' }}>
                      <input type="radio" name="payment" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} className="w-4 h-4 accent-green-600" />
                      <span className="ml-3 font-semibold text-sm text-gray-800">GonabPay</span>
                      <span className="ml-auto text-xs text-gray-500">Rp {balance?.toLocaleString() || '0'}</span>
                    </label>
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="payment" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="w-4 h-4 accent-green-600" />
                      <span className="ml-3 font-semibold text-sm text-gray-800">Tunai</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            <button disabled={!showPrice} className="w-full bg-green-600 text-white font-bold text-lg py-4 rounded-full shadow-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {showPrice ? (selectedVehicle ? "Pesan Sekarang" : "Pilih Kendaraan") : "Pilih Tujuan Dulu"}
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Konfirmasi Pemesanan</h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex gap-2">
              <AlertCircle size={20} className="text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Driver sedang mencari</p>
                <p className="text-xs text-blue-700">Driver dalam area akan segera merespons</p>
              </div>
            </div>

            <div className="space-y-4 mb-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Dari</p>
                <p className="font-semibold text-gray-800 flex items-center gap-2"><MapPin size={16} className="text-green-600" /> {pickup}</p>
              </div>

              <div className="px-4">
                <button className="w-full py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2">
                  <ArrowRight size={16} /> Tampilkan Rute
                </button>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Ke</p>
                <p className="font-semibold text-gray-800 flex items-center gap-2"><MapPin size={16} className="text-red-600" /> {dropoff}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Kendaraan</p>
                  <p className="font-bold text-gray-800 text-sm">{selectedVehicle.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tarif</p>
                  <p className="font-bold text-gray-800 text-sm">Rp {calculatePrice(selectedVehicle).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">ETA</p>
                  <p className="font-bold text-gray-800 text-sm">{selectedVehicle.eta} mnt</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <button onClick={() => setSelectedVehicle(null)} className="flex-1 py-3 border border-green-600 text-green-600 font-bold rounded-full hover:bg-green-50 disabled:opacity-50" disabled={bookingStatus === 'processing'}>
                Ubah
              </button>
              <button 
                onClick={handleConfirmBooking}
                disabled={bookingStatus === 'processing'}
                className="flex-1 py-3 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {bookingStatus === 'processing' ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Konfirmasi & Lanjut'
                )}
              </button>
            </div>

            <button 
              onClick={() => setSelectedVehicle(null)}
              className="w-full py-3 border border-red-200 text-red-600 font-semibold rounded-full hover:bg-red-50 disabled:opacity-50"
              disabled={bookingStatus === 'processing'}
            >
              Batal
            </button>

            {bookingStatus === 'error' && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-900">{bookingError}</p>
                  <button 
                    onClick={() => setBookingStatus(null)}
                    className="text-sm text-red-700 hover:underline mt-1"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}

            {bookingStatus === 'success' && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center">
                  <CheckCircle size={64} className="text-green-600 mx-auto mb-4 animate-bounce" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Pemesanan Berhasil!</h3>
                  <p className="text-gray-600 mb-4">Driver sedang dalam perjalanan menuju Anda</p>
                  <p className="text-3xl font-bold text-green-600 mb-4">{formatRp(calculatePrice(selectedVehicle))}</p>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 mb-4">
                    <p className="font-semibold mb-2">Detail Perjalanan</p>
                    <p>Kendaraan: {selectedVehicle.name}</p>
                    <p>Dari: {pickup.split(',')[0]}</p>
                    <p>Ke: {dropoff.split(',')[0]}</p>
                  </div>
                  <p className="text-sm text-gray-500">Mengalihkan ke halaman utama...</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GonabRideScreen;
