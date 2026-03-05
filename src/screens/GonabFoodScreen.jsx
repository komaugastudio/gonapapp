import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Utensils, Star, MapPin, Clock, ShoppingCart, Plus, Minus, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { WalletContext } from '../context/WalletContext';
import { formatRp } from '../utils/format';
import { auth } from '../firebase';
import apiClient from '../services/apiClient';
import Map from '../components/Map';

const GonabFoodScreen = () => {
  const navigate = useNavigate();
  const { balance, addTransaction } = useContext(WalletContext);
  const [activeTab, setActiveTab] = useState('Terdekat');
  const [cart, setCart] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'processing', 'success', 'error'
  const [paymentError, setPaymentError] = useState('');

  const restaurants = [
    { id: 1, name: "Nasi Goreng Hebat Nabire", category: "Nasi Goreng", rating: 4.8, distance: "1.2 km", promo: "Diskon 20%" },
    { id: 2, name: "Seafood Oyehe Spesial", category: "Seafood", rating: 4.9, distance: "2.5 km", promo: "Gratis Ongkir" },
  ];

  const foods = [
    { id: 1, name: "Nasi Goreng Spesial", restaurant: "Nasi Goreng Hebat Nabire", price: 35000, rating: 4.7, reviews: 234 },
    { id: 2, name: "Mie Aceh", restaurant: "Nasi Goreng Hebat Nabire", price: 28000, rating: 4.6, reviews: 156 },
    { id: 3, name: "Udang Goreng", restaurant: "Seafood Oyehe Spesial", price: 48000, rating: 4.9, reviews: 312 },
    { id: 4, name: "Ikan Bakar", restaurant: "Seafood Oyehe Spesial", price: 42000, rating: 4.8, reviews: 245 },
  ];

  const addToCart = (food) => {
    const existing = cart.find(item => item.id === food.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === food.id ? { ...item, qty: item.qty + 1 } : item
      ));
    } else {
      setCart([...cart, { ...food, qty: 1 }]);
    }
  };

  const removeFromCart = (foodId) => {
    setCart(cart.filter(item => item.id !== foodId));
  };

  const updateQty = (foodId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(foodId);
    } else {
      setCart(cart.map(item => 
        item.id === foodId ? { ...item, qty: newQty } : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.qty), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const totalPrice = getTotalPrice();
    const deliveryFee = 10000;
    const finalTotal = totalPrice + deliveryFee;

    if (balance < finalTotal) {
      setPaymentError(`Saldo Anda (${formatRp(balance)}) tidak mencukupi. Kurang ${formatRp(finalTotal - balance)}`);
      setPaymentStatus('error');
      setTimeout(() => setPaymentStatus(null), 3000);
      return;
    }

    setPaymentStatus('processing');
    setPaymentError('');

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setPaymentError('User tidak terautentikasi');
        setPaymentStatus('error');
        return;
      }

      // Prepare order data for backend
      const orderData = {
        items: cart.map(item => ({
          food_id: item.id,
          quantity: item.qty,
          price: item.price,
        })),
        delivery_fee: deliveryFee,
        total_amount: finalTotal,
        payment_method: 'wallet',
        delivery_address: 'Oyehe, Nabire, Papua Tengah',
      };

      // Call backend to create order
      const response = await apiClient.post('/orders', orderData);

      if (response.data && response.data.orderId) {
        // Record transaction
        const description = `Pesanan makanan dari GonabFood (${cart.length} item)`;
        await addTransaction(
          'debit',
          finalTotal,
          'food',
          description,
          response.data.orderId
        );

        setPaymentStatus('success');
        setTimeout(() => {
          setCart([]);
          setPaymentStatus(null);
          navigate('/');
        }, 2500);
      } else {
        setPaymentError('Pemesanan gagal. Silakan coba lagi.');
        setPaymentStatus('error');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setPaymentError(error.response?.data?.message || 'Terjadi kesalahan: ' + error.message);
      setPaymentStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="sticky top-0 z-20 bg-white shadow-sm">
        <div className="p-4 flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="text-gray-700"><ChevronLeft size={28} /></button>
          <div className="flex-1 bg-gray-100 rounded-full flex items-center px-4 py-2">
            <Search size={18} className="text-gray-400 mr-2" />
            <input type="text" placeholder="Mau makan apa?" className="bg-transparent border-none outline-none w-full text-sm" />
          </div>
          <div className="relative">
            <ShoppingCart size={24} className="text-red-500 cursor-pointer" />
            {cart.length > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cart.length}
              </div>
            )}
          </div>
        </div>

        {/* Restaurant Map */}
        <div className="h-64 w-full border-t border-gray-100">
          <Map 
            pickup="Oyehe, Nabire, Papua Tengah"
            height="100%"
            onLocationSelect={(coords) => console.log('Restaurant selected:', coords)}
          />
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

      {paymentStatus === 'success' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center">
            <CheckCircle size={64} className="text-green-600 mx-auto mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Pesanan Berhasil!</h3>
            <p className="text-gray-600 mb-4">Pesanan Anda akan tiba dalam 30-45 menit</p>
            <p className="text-3xl font-bold text-green-600 mb-4">{formatRp(getTotalPrice() + 10000)}</p>
            <p className="text-sm text-gray-500">Mengalihkan ke halaman utama...</p>
          </div>
        </div>
      )}

      {paymentStatus === 'error' && (
        <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-2">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-red-900">{paymentError}</p>
            <button 
              onClick={() => setPaymentStatus(null)}
              className="text-sm text-red-700 hover:underline mt-1"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <div className="px-4 space-y-4">
        <h2 className="font-bold text-lg text-gray-800">Menu Populer</h2>
        {foods.map(food => (
          <div key={food.id} className="flex space-x-3 border border-gray-100 rounded-lg p-3 hover:shadow-md transition-shadow">
            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 flex-shrink-0"><Utensils size={28} /></div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-800 text-sm">{food.name}</h3>
              <p className="text-xs text-gray-500 mb-1">{food.restaurant}</p>
              <div className="flex items-center gap-2 mb-2">
                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-semibold text-gray-700">{food.rating}</span>
                <span className="text-xs text-gray-500">({food.reviews})</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-bold text-red-600">{formatRp(food.price)}</p>
                <button 
                  onClick={() => addToCart(food)}
                  className="bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 max-w-md mx-auto shadow-2xl">
          <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">{formatRp(item.price)} x {item.qty}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-bold w-6 text-center">{item.qty}</span>
                  <button 
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Plus size={14} />
                  </button>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 hover:bg-red-100 rounded ml-1"
                  >
                    <X size={14} className="text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 py-3 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">{formatRp(getTotalPrice())}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Ongkir</span>
              <span className="font-semibold">Rp 10.000</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-200">
              <span>Total</span>
              <span className="text-red-600">{formatRp(getTotalPrice() + 10000)}</span>
            </div>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={paymentStatus === 'processing'}
            className="w-full mt-4 py-3 bg-red-500 text-white font-bold rounded-full hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {paymentStatus === 'processing' ? (
              <>
                <Loader size={18} className="animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <ShoppingCart size={18} />
                Lanjutkan Pembayaran
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default GonabFoodScreen;