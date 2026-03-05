import React, { useState, useContext, useEffect } from 'react';
import { ChevronLeft, ShoppingBag, Trash2, Plus, Minus, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WalletContext } from '../context/WalletContext';
import { formatRp } from '../utils/format';
import { auth } from '../firebase';
import apiClient from '../services/apiClient';
import Toast from '../components/ui/Toast';
import Map from '../components/Map';

// initial blank product list, fetched from service


const GomartScreen = () => {
  const navigate = useNavigate();
  const { balance, addTransaction } = useContext(WalletContext);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gomartCart') || '[]');
    } catch {
      return [];
    }
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    // load product catalog in async function to avoid eslint hook warning
    let mounted = true;
    const load = async () => {
      if (mounted) setLoading(true);
      try {
        const response = await apiClient.get('/products');
        if (mounted && response.data && response.data.products) {
          setProducts(response.data.products);
        }
      } catch (e) {
        console.error('Error fetching products:', e);
        Toast('Gagal mengambil produk');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, qty: p.qty + 1 } : p
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const changeQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, qty: Math.max(1, p.qty + delta) } : p))
        .filter((p) => p.qty > 0)
    );
  };

  const total = cart.reduce((sum, p) => sum + p.price * p.qty, 0);

  // persist cart
  useEffect(() => {
    localStorage.setItem('gomartCart', JSON.stringify(cart));
  }, [cart]);

  const handleCheckout = async () => {
    if (total === 0) return;
    if (balance < total) {
      setMessage('Saldo tidak cukup.');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    setCheckoutLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setMessage('User tidak terautentikasi');
        setCheckoutLoading(false);
        return;
      }

      // Prepare order data for backend
      const orderData = {
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.qty,
          price: item.price,
        })),
        total_amount: total,
        payment_method: 'wallet',
        delivery_address: 'Oyehe, Nabire, Papua Tengah',
      };

      // Call backend to create order
      const response = await apiClient.post('/orders/gomart', orderData);

      if (response.data && response.data.orderId) {
        // Record transaction
        await addTransaction(
          'debit',
          total,
          'shopping',
          `Pembelian di GonabMart (${cart.length} item)`,
          response.data.orderId
        );

        setMessage('Pembelian berhasil!');
        setCart([]);
        localStorage.removeItem('gomartCart');
      } else {
        setMessage(response.data?.message || 'Gagal memproses pesanan');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setMessage(error.response?.data?.message || 'Terjadi kesalahan jaringan');
    }
    setCheckoutLoading(false);
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-20 bg-white shadow-sm">
        <div className="p-4 flex items-center">
          <button onClick={() => navigate(-1)} className="text-gray-700">
            <ChevronLeft size={24} />
          </button>
          <h2 className="flex-1 text-center font-bold text-lg">GonabMart</h2>
        </div>

        {/* Store Map */}
        <div className="h-56 w-full border-t border-gray-100">
          <Map 
            pickup="Oyehe, Nabire, Papua Tengah"
            height="100%"
            onLocationSelect={(coords) => console.log('Store location:', coords)}
          />
        </div>
      </div>

      {message && (
        <div className="p-3 bg-green-50 text-green-700 text-center font-medium">
          {message}
        </div>
      )}

      <div className="p-4">
        <h3 className="font-bold mb-2">Saldo: {formatRp(balance)}</h3>
        <h4 className="font-semibold mt-4 mb-2">Produk</h4>
        {loading ? (
          <div className="text-center py-8">Memuat produk...</div>
        ) : (
          <ul className="space-y-4">
            {products.map((prod) => (
              <li key={prod.id} className="flex justify-between items-center">
                <span>{prod.name}</span>
                <div className="flex items-center space-x-3">
                  <span>{formatRp(prod.price)}</span>
                  <button
                    onClick={() => addToCart(prod)}
                    className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs"
                  >
                    Tambah
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {cart.length > 0 && (
          <>
            <h4 className="font-semibold mt-6 mb-2">Keranjang</h4>
            <ul className="space-y-3">
              {cart.map((item) => (
                <li key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <button onClick={() => changeQty(item.id, -1)}><Minus size={16} /></button>
                    <span className="font-medium">{item.qty}</span>
                    <button onClick={() => changeQty(item.id, 1)}><Plus size={16} /></button>
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>{formatRp(item.price * item.qty)}</span>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-600"><Trash2 size={16} /></button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between font-bold mb-2">
            <span>Total:</span>
            <span>{formatRp(total)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={total === 0 || checkoutLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg disabled:opacity-50"
          >
            {checkoutLoading ? 'Memproses...' : 'Bayar Sekarang'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GomartScreen;
